from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
import os
import httpx

load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

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

async def search_web(query: str):
    """Search the web using Tavily API"""
    if not tavily_api_key:
        return []

    headers = {"Content-Type": "application/json"}
    payload = {"api_key": tavily_api_key, "query": query}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json=payload,
                headers=headers,
                timeout=10
            )
            data = response.json()
            return data.get("results", [])
    except Exception as e:
        print(f"Search error: {e}")
        return []

async def call_gemini(prompt: str):
    """Call Gemini API and stream response"""
    if not google_api_key:
        yield "Error: GOOGLE_API_KEY not set"
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={google_api_key}"

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 2048
        }
    }

    try:
        print(f"[DEBUG] Calling Gemini API at {url[:50]}...")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=60
            )

            print(f"[DEBUG] Gemini response status: {response.status_code}")

            if response.status_code != 200:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                print(f"[DEBUG] {error_msg}")
                yield error_msg
                return

            data = response.json()
            print(f"[DEBUG] Gemini response: {str(data)[:200]}...")

            # Extract text from the response
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    for part in candidate["content"]["parts"]:
                        if "text" in part:
                            text = part["text"]
                            print(f"[DEBUG] Yielding text: {text[:50]}...")
                            yield text
                else:
                    print("[DEBUG] No content/parts in candidate")
                    yield "No content in response"
            else:
                print("[DEBUG] No candidates in response")
                yield "No response from Gemini API"

    except Exception as e:
        print(f"[DEBUG] Gemini error: {type(e).__name__}: {str(e)}")
        yield f"Error: {str(e)}"

def should_search(query: str) -> bool:
    """Determine if we should search the web for this query"""
    simple_queries = {
        "hi", "hello", "hey", "thanks", "thank you", "okay", "ok",
        "yes", "no", "sure", "got it", "good", "nice", "cool",
        "lol", "haha", "hy", "bye", "goodbye", "see you", "take care",
        "what's up", "how are you", "how are you?", "how's it going"
    }

    query_lower = query.lower().strip()
    return query_lower not in simple_queries and len(query_lower) > 3

async def get_simple_response(query: str) -> str:
    """Get a simple response without web search"""
    simple_responses = {
        "hi": "Hey there! How can I help you today?",
        "hello": "Hello! What can I assist you with?",
        "hey": "Hi! What's on your mind?",
        "hy": "Hello! Did you mean 'hi'? Or would you like to know about something specific? Just ask!",
        "thanks": "You're welcome! Happy to help!",
        "thank you": "Glad I could help!",
        "okay": "Alright! What else can I do for you?",
        "ok": "Got it! Anything else?",
        "good": "That's great! Is there anything else you'd like to know?",
        "bye": "Goodbye! See you next time!",
        "goodbye": "See you later!",
    }

    return simple_responses.get(query.lower().strip(), "I'm here to help! What would you like to know?")

async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None):
    """Generate streaming chat responses"""
    try:
        new_checkpoint_id = checkpoint_id or str(uuid4())

        # Send checkpoint
        yield f"data: {json.dumps({'type': 'checkpoint', 'checkpoint_id': new_checkpoint_id})}\n\n"

        # Check if we should search for this query
        needs_search = should_search(message)
        search_results = []

        # Handle simple queries without search
        if not needs_search:
            simple_response = await get_simple_response(message)
            yield f"data: {json.dumps({'type': 'content', 'content': simple_response})}\n\n"
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            return

        # For complex queries, search the web
        search_results = await search_web(message)

        if search_results:
            urls = [result.get("url") for result in search_results if "url" in result]
            yield f"data: {json.dumps({'type': 'search_start', 'query': message})}\n\n"
            yield f"data: {json.dumps({'type': 'search_results', 'urls': urls})}\n\n"

        # Build search context with better formatting
        search_context = ""
        if search_results:
            search_context = "Based on the latest search results:\n\n"
            for i, result in enumerate(search_results[:4], 1):
                title = result.get('title', 'Untitled')
                snippet = result.get('snippet', '')
                search_context += f"• {title}: {snippet}\n"

        # Prepare prompt with search results
        full_prompt = f"""{search_context}

User Question: {message}

Please provide a comprehensive and well-formatted answer. Use markdown formatting with **bold** for important terms, and structure your response clearly with line breaks. Include relevant citations when referring to the search results. Make the response conversational and easy to read."""

        # Get AI response
        response_text = ""
        has_response = False

        try:
            async for chunk in call_gemini(full_prompt):
                if chunk:
                    has_response = True
                    response_text += chunk
                    yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
        except Exception as gemini_error:
            print(f"Gemini error during streaming: {type(gemini_error).__name__}: {str(gemini_error)}")
            yield f"data: {json.dumps({'type': 'content', 'content': f'Oops! I encountered an error: {str(gemini_error)}. Please try again! 😊'})}\n\n"

        if not has_response:
            print("Warning: No response from Gemini")
            yield f"data: {json.dumps({'type': 'content', 'content': 'No response received from AI'})}\n\n"

        # End stream
        yield f"data: {json.dumps({'type': 'end'})}\n\n"

    except Exception as e:
        print(f"Stream error: {type(e).__name__}: {e}")
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/chat_stream")
async def chat_stream(query: str, checkpoint_id: str = None):
    """SSE endpoint for streaming chat responses"""
    return StreamingResponse(
        generate_chat_responses(query, checkpoint_id),
        media_type="text/event-stream"
    )
