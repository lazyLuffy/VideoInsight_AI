'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatAssistantProps {
  notes: string;
  sourceUrl: string;
  onSeekTimestamp?: (seconds: number) => void;
}

const SUGGESTIONS = [
  '💡 Quiz me on 3 key points',
  '🔍 Explain the most complex concept in simple terms',
  '⚡ What are the top 3 critical takeaways?',
  '📋 Formulate a step-by-step implementation checklist',
];

export default function ChatAssistant({ notes, sourceUrl, onSeekTimestamp }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "👋 I've analyzed your notes and video! Ask me anything about the content, request a quiz, or ask for clarifications.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend(textToSend?: string) {
    const question = (textToSend ?? input).trim();
    if (!question || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: question }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          question,
          url: sourceUrl,
          history: messages.slice(1).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get answer');

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ **Error:** ${err instanceof Error ? err.message : 'Could not answer. Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-[#272727] bg-white dark:bg-[#181818] shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-neutral-50 dark:bg-[#1e1e1e] hover:bg-neutral-100 dark:hover:bg-[#252525] border-b border-neutral-100 dark:border-[#282828] transition text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Chat with Video
              <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                Interactive Q&A
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ask clarifying questions, get practice quizzes, or dive deeper</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
      </button>

      {isOpen && (
        <div className="p-5 flex flex-col h-[480px]">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-xs'
                      : 'bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-[#303030] text-neutral-800 dark:text-neutral-100 rounded-bl-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownViewer content={msg.text} onSeekTimestamp={onSeekTimestamp} />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 text-sm justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mt-0.5 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-xs bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-[#303030] px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600 dark:text-red-500" />
                  Thinking and analyzing video context...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSend(sug)}
                disabled={isLoading}
                className="text-[11px] font-medium rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-[#272727] px-3 py-1 text-neutral-700 dark:text-neutral-300 hover:border-red-400 hover:bg-neutral-200 dark:hover:bg-[#383838] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this video or notes..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#121212] px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-[#181818] focus:ring-4 focus:ring-red-100 dark:focus:ring-red-950/40 transition-all duration-200 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

