"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Conversation, Message } from "@/lib/types";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  MoreVertical,
  CheckCheck,
  Check,
  Clock,
  Bot,
  User,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const FOLDERS = [
  { key: "", label: "All" },
  { key: "new_leads", label: "New Leads" },
  { key: "interested", label: "Interested" },
  { key: "follow_up", label: "Follow Up" },
  { key: "converted", label: "Converted" },
  { key: "closed", label: "Closed" },
];

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [activeFolder, setActiveFolder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [activeFolder, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const params: Record<string, string> = {};
      if (activeFolder) params.folder = activeFolder;
      if (searchQuery) params.search = searchQuery;
      const response = await api.get("/conversations", { params });
      setConversations(response.data.data || []);
    } catch {
      console.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    try {
      const response = await api.get(`/conversations/${conv.id}`);
      setMessages(response.data.messages?.data || []);
      // Update local state to reflect read
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, is_unread: false, unread_count: 0 } : c))
      );
    } catch {
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
        type: "text",
        body: messageText,
      });
      setMessages((prev) => [...prev, response.data.message]);
      setMessageText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
      case "sent":
        return <Check className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">
      {/* Conversation List */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        {/* Search & Folders */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
              placeholder="Search contacts..."
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {FOLDERS.map((folder) => (
              <button
                key={folder.key}
                onClick={() => setActiveFolder(folder.key)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeFolder === folder.key
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {folder.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              No conversations yet. Messages will appear here when contacts reach out.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${
                  selectedConversation?.id === conv.id ? "bg-slate-800" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-300">
                      {(conv.contact?.name || conv.contact?.phone || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {conv.is_unread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-white truncate">
                      {conv.contact?.name || conv.contact?.phone}
                    </p>
                    <span className="text-xs text-slate-400">{formatTime(conv.last_message_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {(selectedConversation.contact?.name || selectedConversation.contact?.phone || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {selectedConversation.contact?.name || selectedConversation.contact?.phone}
                  </p>
                  <p className="text-xs text-slate-400">{selectedConversation.contact?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.direction === "outbound"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-slate-800 text-slate-100 rounded-bl-md"
                    }`}
                  >
                    {msg.is_from_bot && msg.direction === "outbound" && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3" />
                        <span className="text-xs opacity-70">Bot</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.direction === "outbound" ? "justify-end" : ""}`}>
                      <span className="text-xs opacity-60">
                        {formatTime(msg.sent_at || msg.created_at)}
                      </span>
                      {msg.direction === "outbound" && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="px-6 py-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button type="button" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendingMessage}
                  className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
