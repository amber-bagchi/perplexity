"use client";

import { useState, forwardRef } from "react";
import { Send } from "lucide-react";

interface InputBarProps {
  onSend: (msg: string) => void;
}

const InputBar = forwardRef<HTMLInputElement, InputBarProps>(
  ({ onSend }, ref) => {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && input.trim() && !e.shiftKey) {
        e.preventDefault();
        onSend(input);
        setInput("");
      }
    };

    const handleSend = () => {
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    };

    return (
      <div className="flex items-end gap-3">
        <input
          ref={ref}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="flex-1 rounded-full px-5 py-3 text-white bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 border border-gray-700 hover:border-gray-600 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }
);

InputBar.displayName = "InputBar";
export default InputBar;
