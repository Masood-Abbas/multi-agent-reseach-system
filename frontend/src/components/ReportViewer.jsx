import React, { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReportViewer({ report, topic }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy report', err);
    }
  };

  const handleDownload = () => {
    const filename = `${(topic || 'research-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}.md`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="p-8 text-center text-text-muted">
        No report generated yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <FileText className="w-4 h-4 text-accent-primary" />
          <span>Markdown Research Report</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-xs font-medium border border-accent-primary/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Rendered Markdown Area */}
      <div className="prose prose-invert prose-indigo max-w-none text-sm leading-relaxed text-text-main/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold text-white tracking-tight mt-6 mb-4 pb-2 border-b border-white/10" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold text-white tracking-tight mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold text-accent-secondary mt-5 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="my-3 text-text-main/85 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside pl-5 my-3 space-y-1.5 text-text-main/80" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside pl-5 my-3 space-y-1.5 text-text-main/80" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-accent-primary pl-4 py-1 my-4 italic text-text-muted bg-white/[0.02] rounded-r-lg" {...props} />
            ),
            code: ({ node, inline, ...props }) => (
              inline ? (
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-accent-primary font-mono text-xs" {...props} />
              ) : (
                <code className="block p-3 rounded-xl bg-background/80 border border-white/10 font-mono text-xs overflow-x-auto my-3 text-emerald-300" {...props} />
              )
            ),
            a: ({ node, ...props }) => (
              <a className="text-accent-primary hover:underline font-medium break-all" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 border border-white/10 rounded-xl">
                <table className="min-w-full divide-y divide-white/10 text-left text-xs" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 bg-white/5 font-semibold text-white" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 border-t border-white/5 text-text-muted" {...props} />
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}

