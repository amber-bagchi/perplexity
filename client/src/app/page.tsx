"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import MessageArea from "../components/MessageArea";
import InputBar from "../components/InputBar";
import Sidebar from "../components/Sidebar";
import FocusMode from "../components/FocusMode";
import SuggestedQuestions from "../components/SuggestedQuestions";
import { Message, SearchInfo } from "../types";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hi there, how can I help you?", type: "assistant" },
  ]);
  const [loading, setLoading] = useState(false);
  const [checkpointId, setCheckpointId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState("general");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Array<{ id: string; title: string; date: string }>>([]);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (inputRef.current && !loading) inputRef.current.focus();
  }, [messages, loading]);

  const handleNewChat = () => {
    setMessages([
      { id: 1, content: "Hi there, how can I help you?", type: "assistant" },
    ]);
    setCheckpointId(null);
    setSuggestedQuestions([]);
  };

  const addConversation = (firstMessage: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? "..." : "");

    const newConv = {
      id: Date.now().toString(),
      title,
      date: dateStr,
    };

    setConversations((prev) => [newConv, ...prev.slice(0, 9)]);
  };

  const handleSend = useCallback(
    async (userInput: string) => {
      // Add to conversations on first message
      if (messages.length === 1) {
        addConversation(userInput);
      }

      const userMsgId =
        messages.length > 0
          ? Math.max(...messages.map((msg) => msg.id)) + 1
          : 1;
      const aiResponseId = userMsgId + 1;

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, content: userInput, type: "user", isUser: true },
        {
          id: aiResponseId,
          content: "",
          type: "assistant",
          isLoading: true,
          searchInfo: { stages: ["searching"], query: "", urls: [] },
        },
      ]);

      setSuggestedQuestions([]);
      setLoading(true);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      let url = `${backendUrl}/chat_stream?query=${encodeURIComponent(
        userInput
      )}`;
      if (checkpointId)
        url += `&checkpoint_id=${encodeURIComponent(checkpointId)}`;

      try {
        const evtSource = new EventSource(url);
        let streamedContent = "";
        let searchData: SearchInfo | null = null;

        evtSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "checkpoint") {
              setCheckpointId(data.checkpoint_id);
            } else if (data.type === "content") {
              streamedContent += data.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? { ...msg, content: streamedContent, isLoading: false }
                    : msg
                )
              );
            } else if (data.type === "search_start") {
              const newSearchInfo = {
                stages: ["searching"],
                query: data.query,
                urls: [],
              };
              searchData = newSearchInfo;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        searchInfo: newSearchInfo,
                        isLoading: true,
                      }
                    : msg
                )
              );
            } else if (data.type === "search_results") {
              const urls =
                typeof data.urls === "string"
                  ? JSON.parse(data.urls)
                  : data.urls;
              const newSearchInfo = {
                stages: searchData
                  ? [...searchData.stages, "reading"]
                  : ["reading"],
                query: searchData?.query || "",
                urls,
              };
              searchData = newSearchInfo;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        searchInfo: newSearchInfo,
                        isLoading: true,
                      }
                    : msg
                )
              );
            } else if (data.type === "search_error") {
              const newSearchInfo = {
                stages: searchData
                  ? [...searchData.stages, "error"]
                  : ["error"],
                query: searchData?.query || "",
                urls: [],
                error: data.error || "Unknown error",
              };
              searchData = newSearchInfo;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        searchInfo: newSearchInfo,
                        content: "Search failed.",
                        isLoading: false,
                      }
                    : msg
                )
              );
            } else if (data.type === "end") {
              if (searchData) {
                const finalSearchInfo = {
                  ...searchData,
                  stages: [...searchData.stages, "complete"],
                };
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiResponseId
                      ? { ...msg, searchInfo: finalSearchInfo, isLoading: false }
                      : msg
                  )
                );
              }

              // Generate suggested follow-ups
              generateSuggestedQuestions(streamedContent);
              setLoading(false);
              evtSource.close();
            }
          } catch (error) {
            console.error("Error parsing event data:", error, event.data);
          }
        };

        evtSource.onerror = (error) => {
          console.error("EventSource error:", error);
          evtSource.close();
          setLoading(false);
        };
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: aiResponseId,
            content: "Sorry, there was an error connecting to the server.",
            type: "assistant",
            isLoading: false,
          },
        ]);
        setLoading(false);
      }
    },
    [messages, checkpointId]
  );

  const generateSuggestedQuestions = (response: string) => {
    // Simple heuristic to generate follow-up questions
    const questions = [];

    if (response.includes("history")) {
      questions.push("What are the historical implications?");
    }
    if (response.includes("how")) {
      questions.push("Can you provide more details?");
    }
    if (response.includes("technology")) {
      questions.push("What are future developments?");
    }

    if (questions.length === 0) {
      questions.push(
        "Can you explain this in simpler terms?",
        "What are practical applications?",
        "Are there any controversies?"
      );
    }

    setSuggestedQuestions(questions.slice(0, 3));
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        conversations={conversations}
        onSelectConversation={() => {}}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!isMobile ? "ml-64" : ""}`}>
        {/* Header */}
        <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              perplexity
            </h1>
            <button
              onClick={handleNewChat}
              className="hidden md:block px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Focus Mode */}
        <FocusMode selected={focusMode} onSelect={setFocusMode} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <MessageArea messages={messages} />

          {/* Suggested Questions */}
          {!loading && suggestedQuestions.length > 0 && (
            <div className="max-w-4xl mx-auto px-4 pb-20">
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelect={handleSuggestedQuestion}
              />
            </div>
          )}

          {/* Empty State */}
          {messages.length === 1 && (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <h2 className="text-3xl font-bold mb-4 text-center">
                What would you like to know?
              </h2>
              <p className="text-gray-400 text-center max-w-md mb-8">
                Ask anything. Get comprehensive answers with sources from across the web.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                {[
                  "Explain quantum computing",
                  "Latest AI breakthroughs",
                  "How does blockchain work?",
                  "Best programming languages 2024",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="p-4 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all text-left"
                  >
                    <span className="text-sm text-gray-300">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gradient-to-t from-black to-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <InputBar onSend={handleSend} ref={inputRef} />
            <p className="text-xs text-gray-600 text-center mt-2">
              Perplexity can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
