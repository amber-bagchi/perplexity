"use client";

import { useEffect, useRef } from "react";
import { Message } from "../types";
import CodeBlock from "./CodeBlock";

interface MessageAreaProps {
  messages: Message[];
}

export default function MessageArea({ messages }: MessageAreaProps) {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Detect URLs inside text
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Parse mixed text + code blocks
  const renderMessageContent = (content: string) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      // text before code
      if (index > lastIndex) {
        parts.push(
          <p key={lastIndex} className="whitespace-pre-wrap">
            {renderTextWithLinks(content.slice(lastIndex, index))}
          </p>
        );
      }

      // code block
      parts.push(
        <CodeBlock
          key={index}
          language={lang || "plaintext"}
          code={code.trim()}
        />
      );

      lastIndex = index + fullMatch.length;
    }

    // remaining text
    if (lastIndex < content.length) {
      parts.push(
        <p key={lastIndex} className="whitespace-pre-wrap">
          {renderTextWithLinks(content.slice(lastIndex))}
        </p>
      );
    }

    return <div className="space-y-2">{parts}</div>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black text-white">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-2xl px-4 py-2 max-w-[75%] whitespace-pre-wrap break-words shadow-md ${
            msg.type === "user"
              ? "bg-blue-600 text-white ml-auto"
              : "bg-gray-800 text-white"
          }`}
        >
          {/* Render text/code */}
          {msg.content && renderMessageContent(msg.content)}

          {/* Render image if exists */}
          {msg.imageUrl && (
            <div className="mt-2">
              <img
                src={msg.imageUrl}
                alt="Generated"
                className="rounded-lg max-w-full h-auto border border-gray-700 shadow"
              />
            </div>
          )}

          {/* Sources if available */}
          {msg.type === "assistant" && msg.searchInfo?.urls?.length > 0 && (
            <div className="mt-2 border-t border-gray-700 pt-2 text-sm text-gray-300 space-y-1">
              <div className="font-semibold text-gray-400">Sources:</div>
              <ul className="list-disc list-inside space-y-1">
                {msg.searchInfo.urls.map((url: string, i: number) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
