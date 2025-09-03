"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Lightbulb, LineChart, MapPin, Trophy, ThumbsUp } from "lucide-react";
import MessageArea from "../components/MessageArea";
import InputBar from "../components/InputBar";
import { Message, SearchInfo } from "../types";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hi there, how can I help you?", type: "assistant" },
  ]);
  const [loading, setLoading] = useState(false);
  const [checkpointId, setCheckpointId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when ready
  useEffect(() => {
    if (inputRef.current && !loading) inputRef.current.focus();
  }, [messages, loading]);

  const handleSend = useCallback(
    async (userInput: string) => {
      const userMsgId =
        messages.length > 0
          ? Math.max(...messages.map((msg) => msg.id)) + 1
          : 1;
      const aiResponseId = userMsgId + 1;

      // Push user + assistant placeholder message
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, content: userInput, type: "user", isUser: true },
        {
          id: aiResponseId,
          content: "🔎 Searching the web...",
          type: "assistant",
          isLoading: true,
          searchInfo: { stages: ["searching"], query: "", urls: [] },
        },
      ]);

      setLoading(true);

      let url = `https://perplexity-33vr.onrender.com/chat_stream?query=${encodeURIComponent(
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
                        content: "🔎 Searching the web...",
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
                        // ✅ Keep reply text, links will be shown *below*
                        content: msg.content || "📖 Reading results...",
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
                        content: "❌ Search failed.",
                        isLoading: false,
                      }
                    : msg
                )
              );
            } else if (data.type === "end") {
              if (searchData) {
                const finalSearchInfo = {
                  ...searchData,
                  stages: [...searchData.stages, "writing"],
                };
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiResponseId
                      ? { ...msg, searchInfo: finalSearchInfo }
                      : msg
                  )
                );
              }
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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-white px-4 bg-[#111]">
      {/* Logo */}
      <h1 className="text-5xl font-bold mb-10">perplexity</h1>

      {/* Chat Container */}
      <div className="w-full max-w-3xl min-h-[80vh] flex flex-col rounded-xl bg-[#1a1a1a]">
        {/* Messages */}
        <MessageArea messages={messages} />

        {/* Input Bar */}
        <div className="border-t border-gray-700 p-3">
          <InputBar onSend={handleSend} ref={inputRef} />
        </div>
      </div>

      {/* Quick Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="px-5 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center space-x-2">
          <Lightbulb className="w-4 h-4" />
          <span>Learn</span>
        </button>
        <button className="px-5 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center space-x-2">
          <LineChart className="w-4 h-4" />
          <span>Analyze</span>
        </button>
        <button className="px-5 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>Local</span>
        </button>
        <button className="px-5 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center space-x-2">
          <Trophy className="w-4 h-4" />
          <span>Sports</span>
        </button>
        <button className="px-5 py-2 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center space-x-2">
          <ThumbsUp className="w-4 h-4" />
          <span>Recommend</span>
        </button>
      </div>
    </main>
  );
}
