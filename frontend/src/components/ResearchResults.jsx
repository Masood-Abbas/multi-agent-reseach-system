import React, { useState } from 'react';
import { 
  FileText, 
  Globe, 
  Award, 
  Layout, 
  ExternalLink, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import ReportViewer from './ReportViewer';
import SourceList from './SourceList';
import QualityReview from './QualityReview';

export default function ResearchResults({ data }) {
  const [activeTab, setActiveTab] = useState('report'); // 'overview' | 'report' | 'sources' | 'review'

  if (!data) return null;

  const { topic, report, sources = [], review, search_results, scraped_content } = data;

  const tabs = [
    { id: 'report', label: 'Final Report', icon: FileText },
    { id: 'sources', label: `Sources (${sources.length})`, icon: Globe },
    { id: 'review', label: 'Quality Review', icon: Award },
    { id: 'overview', label: 'Research Overview', icon: Layout },
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header Topic Banner */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-card to-background">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified Autonomous Research
          </span>
          <span className="text-xs text-text-dim flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
          {topic}
        </h3>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap
                ${isActive 
                  ? 'border-accent-primary text-white' 
                  : 'border-transparent text-text-muted hover:text-white'}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-text-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === 'report' && (
          <ReportViewer report={report} topic={topic} />
        )}

        {activeTab === 'sources' && (
          <SourceList sources={sources} />
        )}

        {activeTab === 'review' && (
          <QualityReview review={review} />
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <span className="text-xs text-text-muted">Total Sources</span>
                <p className="text-xl font-bold text-white mt-1">{sources.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <span className="text-xs text-text-muted">Critic Evaluation</span>
                <p className="text-xl font-bold text-accent-primary mt-1">
                  {review?.score !== null && review?.score !== undefined ? `${review.score}/10` : 'Complete'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <span className="text-xs text-text-muted">Report Word Count</span>
                <p className="text-xl font-bold text-white mt-1">
                  {report ? report.split(/\s+/).length : 0}
                </p>
              </div>
            </div>

            {/* Raw Extraction Details Accordion / Preview */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Raw Agent Extraction Trace
              </h4>

              <div className="p-4 rounded-xl bg-background border border-white/5">
                <span className="text-xs font-medium text-accent-secondary">Step 1 Search Snippets</span>
                <pre className="mt-2 text-[11px] font-mono text-text-muted max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {search_results || 'No search logs available'}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-background border border-white/5">
                <span className="text-xs font-medium text-emerald-400">Step 2 Scraped Deep Content</span>
                <pre className="mt-2 text-[11px] font-mono text-text-muted max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {scraped_content || 'No scraped logs available'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

