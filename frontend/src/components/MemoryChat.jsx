import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from '../services/researchApi';

export default function MemoryChat({ researchData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Build research context from report & findings
  const researchContext = `
Topic: ${researchData?.topic || ''}

Report:
${researchData?.report || ''}

Search Snippets:
${(researchData?.search_results || '').slice(0, 2000)}

Scraped Content:
${(researchData?.scraped_content || '').slice(0, 2000)}
  `.trim();

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    // Append user message immediately
    const updatedMessages = [...messages, { role: 'user', content: query }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Call memory chat endpoint with current history
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await sendChatMessage(query, researchContext, historyPayload);

    if (result.ok) {
      setMessages([...updatedMessages, { role: 'assistant', content: result.data.answer }]);
    } else {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: `⚠️ *Error: ${result.error}*`,
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[560px] bg-background/50 rounded-xl border border-white/5 overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-card/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Interactive Chat with Memory
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            Multi-Turn Context
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-[11px] text-text-dim hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Memory</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-accent-primary" />
            </div>
            <h5 className="text-sm font-semibold text-white">Ask Follow-Up Questions</h5>
            <p className="text-xs text-text-dim max-w-sm mt-1 leading-relaxed">
              The assistant remembers your conversation history. Ask to summarize points, expand on specific topics, or refine sections of the report.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md">
              {[
                'Summarize key finding #1 in simpler terms',
                'What are the main risks mentioned?',
                'Draft a 3-point executive summary',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-accent-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                      : 'bg-card border border-white/5 text-text-main/90 shadow-md'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="bg-card border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs text-text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-primary" />
              <span>Thinking with context memory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-card/80 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up or request modifications..."
          disabled={isLoading}
          className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent-primary transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs sm:text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

