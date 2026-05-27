"use client";

import { Lightbulb, BookOpen, Code, Newspaper, Youtube, Users } from "lucide-react";

interface FocusModeProps {
  selected: string;
  onSelect: (mode: string) => void;
}

const FOCUS_MODES = [
  { id: "general", name: "General", icon: Lightbulb, description: "All sources" },
  { id: "academic", name: "Academic", icon: BookOpen, description: "Scholarly sources" },
  { id: "coding", name: "Coding", icon: Code, description: "Code & documentation" },
  { id: "news", name: "News", icon: Newspaper, description: "Latest news" },
  { id: "youtube", name: "YouTube", icon: Youtube, description: "Video content" },
  { id: "reddit", name: "Reddit", icon: Users, description: "Community insights" },
];

export default function FocusMode({ selected, onSelect }: FocusModeProps) {
  return (
    <div className="w-full px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-gray-950 to-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Focus Mode
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FOCUS_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelect(mode.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 text-sm font-medium flex-shrink-0 ${
                  selected === mode.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <Icon size={16} />
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
