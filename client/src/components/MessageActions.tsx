"use client";

import { Copy, Check, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
}

export default function MessageActions({ content, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded transition-colors"
        title="Copy message"
      >
        {copied ? (
          <>
            <Check size={14} className="text-green-400" />
            <span className="text-xs text-green-400">Copied</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span className="text-xs">Copy</span>
          </>
        )}
      </button>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded transition-colors"
          title="Regenerate response"
        >
          <RotateCcw size={14} />
          <span className="text-xs">Regenerate</span>
        </button>
      )}

      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-900 rounded transition-colors"
        title="Share"
      >
        <Share2 size={14} />
        <span className="text-xs">Share</span>
      </button>
    </div>
  );
}
