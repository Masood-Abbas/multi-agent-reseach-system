import React from 'react';
import { ExternalLink, Globe, FileSearch } from 'lucide-react';

function getDomain(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.replace('www.', '');
  } catch (e) {
    return 'source link';
  }
}

export default function SourceList({ sources = [] }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-8 text-center text-text-muted bg-background/40 border border-white/5 rounded-xl">
        <FileSearch className="w-8 h-8 mx-auto mb-2 text-text-dim" />
        <p className="text-sm">No individual web sources were parsed from this research run.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Verified Sources ({sources.length})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((src, index) => {
          const domain = getDomain(src.url);

          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-background/50 border border-white/5 hover:border-accent-primary/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent-primary bg-accent-primary/10 px-2.5 py-0.5 rounded-full border border-accent-primary/20">
                    <Globe className="w-3 h-3" />
                    {domain}
                  </span>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-dim hover:text-white transition-colors"
                    title="Open external source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h5 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-accent-primary transition-colors">
                  {src.title || domain}
                </h5>

                {src.content && (
                  <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                    {src.content}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-text-dim">
                <span className="truncate max-w-[220px]">{src.url}</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-secondary hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

