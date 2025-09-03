"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-md my-3">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 bg-gray-700 text-white text-xs px-2 py-1 rounded-lg hover:bg-gray-600 transition"
      >
        <Copy size={14} />
        {copied ? "Copied!" : "Copy"}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          padding: "1rem",
          margin: 0,
          fontSize: "0.9rem",
          background: "transparent",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
