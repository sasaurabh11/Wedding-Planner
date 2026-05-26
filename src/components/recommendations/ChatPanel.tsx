"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, Recommendation, StoredChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  intakeId: string;
  recommendations: Recommendation[];
}

interface DisplayMessage {
  role: "user" | "model";
  text: string;
  isStreaming?: boolean;
}

function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        h1: ({ children }) => <h1 className="font-playfair font-bold text-base mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="font-semibold text-sm mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function ChatPanel({ intakeId, recommendations }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    fetch(`/api/chat/${intakeId}`)
      .then(async (res) => {
        if (!res.ok) return;
        const stored: StoredChatMessage[] = await res.json();
        if (stored.length === 0) return;

        // Rebuild display messages from DB
        const display: DisplayMessage[] = stored.map((m) => ({
          role: m.role,
          text: m.content,
        }));
        setDisplayMessages(display);

        // Rebuild ChatMessage history for Gemini context
        const history: ChatMessage[] = stored.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));
        setMessages(history);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [intakeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");

    const userMessage: ChatMessage = { role: "user", parts: [{ text }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const newDisplayCount = displayMessages.length + 1;
    setDisplayMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);
    setDisplayMessages((prev) => [
      ...prev,
      { role: "model", text: "", isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeId, messages: updatedMessages, recommendations }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Chat failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setDisplayMessages((prev) => {
          const updated = [...prev];
          updated[newDisplayCount] = { role: "model", text: fullText, isStreaming: true };
          return updated;
        });
      }

      setDisplayMessages((prev) => {
        const updated = [...prev];
        updated[newDisplayCount] = { role: "model", text: fullText, isStreaming: false };
        return updated;
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: fullText }] },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setDisplayMessages((prev) => {
        const updated = [...prev];
        updated[newDisplayCount] = {
          role: "model",
          text: `Sorry, I encountered an error: ${message}`,
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="font-playfair text-xl flex items-center gap-2">
          <span>💬</span> Ask Your Wedding Planner
        </CardTitle>
        <p className="text-sm text-gray-500">
          Ask anything about your wedding plan, budget, or vendor advice
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[480px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
              </div>
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <span className="text-4xl mb-3">🌺</span>
              <p className="text-gray-500 text-sm font-medium">
                Ask me anything about your wedding plan!
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  "How can I reduce photography costs?",
                  "Best decor ideas for my budget?",
                  "When should I book vendors?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            displayMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "model" && (
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5">
                    💍
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-[#1C1917] rounded-tl-sm shadow-sm"
                  )}
                >
                  {msg.role === "model" && msg.text === "" && msg.isStreaming ? (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    </span>
                  ) : msg.role === "model" ? (
                    <div className="prose prose-sm max-w-none">
                      <MarkdownMessage text={msg.text} />
                      {msg.isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your wedding plan..."
            disabled={isLoading || historyLoading}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || historyLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 shrink-0"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
