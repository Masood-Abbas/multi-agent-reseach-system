import React from 'react';
import { History as HistoryIcon, Trash2, ArrowUpRight, Calendar, AlertCircle } from 'lucide-react';

export default function HistoryView({ history = [], onSelect, onDelete, onClearAll }) {
  if (history.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-12 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4">
          <HistoryIcon className="w-6 h-6 text-text-dim" />
        </div>
        <h3 className="text-base font-semibold text-white">No research history yet</h3>
        <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
          Completed research topics and generated reports are stored locally in your browser for easy re-access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Research History</h3>
          <p className="text-xs text-text-muted">
            {history.length} saved {history.length === 1 ? 'report' : 'reports'} stored locally
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="grid grid-cols-1 gap-3">
        {history.map((item) => {
          const dateStr = item.timestamp
            ? new Date(item.timestamp).toLocaleString()
            : 'Recent';

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-card border border-card-border hover:border-accent-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full border border-accent-primary/20">
                    Completed
                  </span>
                  <span className="text-xs text-text-dim flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dateStr}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white truncate group-hover:text-accent-primary transition-colors">
                  {item.topic}
                </h4>

                {item.report && (
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {item.report.replace(/[#*`_]/g, '').slice(0, 160)}...
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onSelect(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-primary/15 hover:bg-accent-primary/25 text-white text-xs font-medium border border-accent-primary/30 transition-colors"
                >
                  <span>Open Report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  title="Delete from history"
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-text-muted hover:text-rose-400 border border-white/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

