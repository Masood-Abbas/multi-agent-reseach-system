import React from 'react';
import { Award, CheckCircle, AlertCircle, Quote } from 'lucide-react';

export default function QualityReview({ review }) {
  if (!review) {
    return (
      <div className="p-8 text-center text-text-muted">
        No critic review data available.
      </div>
    );
  }

  const { score, strengths = [], areas_to_improve = [], verdict, raw } = review;

  // Determine score color badges
  let scoreBadge = {
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    label: 'High Quality',
  };
  if (score !== null && score !== undefined) {
    if (score < 6) {
      scoreBadge = {
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        label: 'Needs Revision',
      };
    } else if (score < 8) {
      scoreBadge = {
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        label: 'Satisfactory',
      };
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="p-5 rounded-xl bg-background/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Critic Evaluation
            </h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {score !== null ? `${score}/10` : 'Evaluated'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>
          </div>
        </div>

        {verdict && (
          <div className="sm:max-w-md bg-white/[0.02] p-3 rounded-lg border border-white/5">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-accent-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-text-main italic leading-relaxed">
                "{verdict}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Improvements Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-xl bg-background/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Identified Strengths</span>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-main/80 leading-relaxed">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted">No specific strengths listed.</p>
          )}
        </div>

        {/* Areas to Improve */}
        <div className="p-5 rounded-xl bg-background/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Areas to Improve</span>
          </div>

          {areas_to_improve.length > 0 ? (
            <ul className="space-y-2">
              {areas_to_improve.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-main/80 leading-relaxed">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted">No specific areas to improve noted.</p>
          )}
        </div>
      </div>

      {/* Raw Fallback Output if regex parsing did not catch fields */}
      {strengths.length === 0 && areas_to_improve.length === 0 && raw && (
        <div className="p-4 rounded-xl bg-background border border-white/5 text-xs font-mono text-text-muted whitespace-pre-wrap">
          {raw}
        </div>
      )}
    </div>
  );
}

