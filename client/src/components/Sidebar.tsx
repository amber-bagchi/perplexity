"use client";

import { Plus, History, Settings, Trash2, Menu, X } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onNewChat: () => void;
  conversations: Array<{ id: string; title: string; date: string }>;
  onSelectConversation: (id: string) => void;
  isMobile: boolean;
}

export default function Sidebar({
  onNewChat,
  conversations,
  onSelectConversation,
  isMobile,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(!isMobile);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 hover:bg-gray-900 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-950 to-black border-r border-gray-800 flex flex-col transition-all duration-300 z-40 ${
          !isOpen && isMobile ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
            Recent Chats
          </div>
          {conversations.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  if (isMobile) setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm text-gray-300 hover:text-white truncate group"
              >
                <div className="truncate">{conv.title}</div>
                <div className="text-xs text-gray-600">{conv.date}</div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-3 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-900 rounded-lg transition-colors text-sm text-gray-400 hover:text-white">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <div className="text-xs text-gray-600 px-3 py-2">
            Perplexity Clone • v1.0
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
