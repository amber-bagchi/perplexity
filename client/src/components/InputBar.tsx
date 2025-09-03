"use client";

import { useState, forwardRef } from "react";

interface InputBarProps {
  onSend: (msg: string) => void;
}

const InputBar = forwardRef<HTMLInputElement, InputBarProps>(
  ({ onSend }, ref) => {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && input.trim()) {
        onSend(input);
        setInput("");
      }
    };

    return (
      <div className="flex items-center p-2 bg-black border-t border-gray-800">
        <input
          ref={ref}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 rounded-2xl px-4 py-2 text-white bg-gray-900 placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
          className="ml-2 px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    );
  }
);

InputBar.displayName = "InputBar";
export default InputBar;
