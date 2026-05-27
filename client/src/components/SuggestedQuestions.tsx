"use client";

import { ArrowRight } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({
  questions,
  onSelect,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-800">
      <div className="text-sm font-semibold text-gray-400 mb-3">
        Suggested follow-ups
      </div>
      <div className="space-y-2">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(question)}
            className="w-full flex items-start gap-3 px-3 py-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group text-left"
          >
            <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm text-gray-300 group-hover:text-white">
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
