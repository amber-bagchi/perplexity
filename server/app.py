from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from fastapi import FastAPI, Query, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver
import os
import asyncio

load_dotenv()

# Initialize memory saver for checkpointing
memory = MemorySaver()

class State(TypedDict):
    messages: Annotated[list, add_messages]

# Search Tool
search_tool = TavilySearchResults(max_results=4)
tools = [search_tool]

# Initialize Gemini 2.0 Flash model with Google API Key
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",  
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

llm_with_tools = llm.bind_tools(tools=tools)

# LLM Node
async def model(state: State):
    result = await llm_with_tools.ainvoke(state["messages"])
    return {"messages": [result]}

# Decide whether to route to tool node
async def tools_router(state: State):
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
        return "tool_node"
    else: 
        return END

# Custom Tool Node
async def tool_node(state):
    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []
    
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]
        
        if tool_name == "tavily_search_results_json":
            search_results = await search_tool.ainvoke(tool_args)
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            tool_messages.append(tool_message)
    
    return {"messages": tool_messages}

# Build Graph
graph_builder = StateGraph(State)
graph_builder.add_node("model", model)
graph_builder.add_node("tool_node", tool_node)
graph_builder.set_entry_point("model")
graph_builder.add_conditional_edges("model", tools_router)
graph_builder.add_edge("tool_node", "model")

graph = graph_builder.compile(checkpointer=memory)

# FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
    expose_headers=["Content-Type"], 
)

# Helper for serialisation
def serialise_ai_message_chunk(chunk): 
    if isinstance(chunk, AIMessageChunk):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation"
        )
# Streaming Responses
async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None):
    is_new_conversation = checkpoint_id is None

    if is_new_conversation:
        new_checkpoint_id = str(uuid4())
        config = {"configurable": {"thread_id": new_checkpoint_id}}

        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config,
        )

        # Send checkpoint event
        yield f"data: {json.dumps({'type': 'checkpoint', 'checkpoint_id': new_checkpoint_id})}\n\n"
    else:
        config = {"configurable": {"thread_id": checkpoint_id}}
        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config,
        )

    async for event in events:
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
            yield f"data: {json.dumps({'type': 'content', 'content': chunk_content})}\n\n"

        elif event_type == "on_chat_model_end":
            tool_calls = (
                event["data"]["output"].tool_calls
                if hasattr(event["data"]["output"], "tool_calls")
                else []
            )
            search_calls = [
                call for call in tool_calls if call["name"] == "tavily_search_results_json"
            ]

            if search_calls:
                search_query = search_calls[0]["args"].get("query", "")
                yield f"data: {json.dumps({'type': 'search_start', 'query': search_query})}\n\n"

        elif event_type == "on_tool_end" and event["name"] == "tavily_search_results_json":
            output = event["data"]["output"]

            if isinstance(output, list):
                urls = [item["url"] for item in output if isinstance(item, dict) and "url" in item]
                yield f"data: {json.dumps({'type': 'search_results', 'urls': urls})}\n\n"

    # Always close the stream
    yield f"data: {json.dumps({'type': 'end'})}\n\n"


# SSE Endpoint
@app.get("/chat_stream")
async def chat_stream(query: str, checkpoint_id: str = None):
    return StreamingResponse(
        generate_chat_responses(query, checkpoint_id), 
        media_type="text/event-stream"
    )


