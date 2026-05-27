"use client";

import { useEffect, useRef } from "react";
import { Message } from "../types";
import CodeBlock from "./CodeBlock";
import MessageActions from "./MessageActions";
import { ExternalLink, Search } from "lucide-react";

interface MessageAreaProps {
  messages: Message[];
}

export default function MessageArea({ messages }: MessageAreaProps) {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const parseMarkdown = (text: string) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Handle bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Process text with multiple markdown patterns
    let processedText = text;

    // First, find all patterns with their positions
    const patterns: Array<{ start: number; end: number; type: string; content: string }> = [];

    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      patterns.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "bold",
        content: match[1],
      });
    }

    // Sort patterns by start position
    patterns.sort((a, b) => a.start - b.start);

    lastIndex = 0;
    patterns.forEach((pattern, i) => {
      if (lastIndex < pattern.start) {
        const textBefore = text.slice(lastIndex, pattern.start);
        const urlMatches = Array.from(textBefore.matchAll(urlRegex));

        if (urlMatches.length > 0) {
          let subLastIndex = 0;
          urlMatches.forEach((urlMatch) => {
            if (subLastIndex < urlMatch.index) {
              parts.push(
                <span key={`text-${keyCounter++}`}>
                  {textBefore.slice(subLastIndex, urlMatch.index)}
                </span>
              );
            }
            parts.push(
              <a
                key={`url-${keyCounter++}`}
                href={urlMatch[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {urlMatch[0]}
              </a>
            );
            subLastIndex = urlMatch.index + urlMatch[0].length;
          });
          if (subLastIndex < textBefore.length) {
            parts.push(
              <span key={`text-${keyCounter++}`}>{textBefore.slice(subLastIndex)}</span>
            );
          }
        } else {
          parts.push(
            <span key={`text-${keyCounter++}`}>{textBefore}</span>
          );
        }
      }

      if (pattern.type === "bold") {
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold text-white">
            {pattern.content}
          </strong>
        );
      }

      lastIndex = pattern.end;
    });

    // Handle remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      const urlMatches = Array.from(remainingText.matchAll(urlRegex));

      if (urlMatches.length > 0) {
        let subLastIndex = 0;
        urlMatches.forEach((urlMatch) => {
          if (subLastIndex < urlMatch.index) {
            parts.push(
              <span key={`text-${keyCounter++}`}>
                {remainingText.slice(subLastIndex, urlMatch.index)}
              </span>
            );
          }
          parts.push(
            <a
              key={`url-${keyCounter++}`}
              href={urlMatch[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
            >
              {urlMatch[0]}
            </a>
          );
          subLastIndex = urlMatch.index + urlMatch[0].length;
        });
        if (subLastIndex < remainingText.length) {
          parts.push(
            <span key={`text-${keyCounter++}`}>{remainingText.slice(subLastIndex)}</span>
          );
        }
      } else {
        parts.push(
          <span key={`text-${keyCounter++}`}>{remainingText}</span>
        );
      }
    }

    return parts.length > 0 ? parts : text;
  };

  const renderMessageContent = (content: string) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = codeRegex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      if (index > lastIndex) {
        const textBefore = content.slice(lastIndex, index);
        const lines = textBefore.split("\n");

        parts.push(
          <div key={`text-${keyCounter++}`} className="space-y-3">
            {lines.map((line, i) => (
              line.trim() ? (
                <div key={`line-${i}`} className="text-base leading-relaxed text-gray-200">
                  {parseMarkdown(line)}
                </div>
              ) : (
                <div key={`line-${i}`}></div>
              )
            ))}
          </div>
        );
      }

      parts.push(
        <CodeBlock
          key={`code-${keyCounter++}`}
          language={lang || "plaintext"}
          code={code.trim()}
        />
      );

      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      const lines = remainingText.split("\n");

      parts.push(
        <div key={`text-${keyCounter++}`} className="space-y-3">
          {lines.map((line, i) => (
            line.trim() ? (
              <div key={`line-${i}`} className="text-base leading-relaxed text-gray-200">
                {parseMarkdown(line)}
              </div>
            ) : (
              <div key={`line-${i}`}></div>
            )
          ))}
        </div>
      );
    }

    return <div className="space-y-4">{parts}</div>;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-black text-white">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-4 max-w-4xl mx-auto">
          {/* User message - right aligned */}
          {msg.type === "user" && (
            <div className="flex flex-col gap-2 ml-auto">
              <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md break-words shadow-sm">
                {msg.content}
              </div>
            </div>
          )}

          {/* Assistant message - left aligned */}
          {msg.type === "assistant" && (
            <div className="flex flex-col gap-3 flex-1">
              {/* Main response */}
              {msg.content && (
                <div className="space-y-4">
                  {renderMessageContent(msg.content)}
                </div>
              )}

              {/* Loading state */}
              {msg.isLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="animate-pulse">⚪</div>
                  {msg.searchInfo?.stages?.includes("searching") && "🔍 Searching the web..."}
                  {msg.searchInfo?.stages?.includes("reading") && "📖 Reading results..."}
                  {msg.searchInfo?.stages?.includes("writing") && "✍️ Generating response..."}
                </div>
              )}

              {/* Sources section */}
              {msg.searchInfo?.urls && msg.searchInfo.urls.length > 0 && (
                <div className="mt-2 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-400">SOURCES</span>
                  </div>
                  <div className="space-y-2">
                    {msg.searchInfo.urls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-sm text-blue-400 hover:text-blue-300 group"
                      >
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="hover:underline break-all">{url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Actions */}
              {msg.content && msg.type === "assistant" && (
                <MessageActions content={msg.content} />
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
