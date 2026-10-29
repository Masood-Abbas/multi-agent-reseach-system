import React, { useState } from 'react';
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const SUGGESTIONS = [
  "Latest breakthroughs in Quantum Computing in 2026",
  "Current petrol and diesel price trends in Pakistan",
  "Google Search Core Update impact on organic SEO traffic",
  "Next-generation solid-state battery commercialization"
];

export default function ResearchForm({ onSubmit, isLoading, disabled }) {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = topic.trim();
    if (!clean) {
      setError('Please enter a research topic to proceed.');
      return;
    }
    if (clean.length < 5) {
      setError('Topic is too short. Please provide at least 5 characters for meaningful research.');
      return;
    }
    setError('');
    onSubmit(clean);
  };

  const handleSuggestionClick = (text) => {
    setTopic(text);
    setError('');
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent-primary" />
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
          What do you want to research?
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading || disabled}
            rows={3}
            placeholder="e.g., Current petrol prices in Pakistan, AI trends in healthcare, or renewable energy breakthroughs..."
            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-dim text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-text-dim">Try:</span>
            {SUGGESTIONS.slice(0, 2).map((sugg, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSuggestionClick(sugg)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all text-left truncate max-w-[200px]"
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !topic.trim() || disabled}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium text-sm hover:opacity-95 shadow-md shadow-accent-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Start Research</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

