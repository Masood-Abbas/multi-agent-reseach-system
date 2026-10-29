import React from 'react';
import { Menu, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Header({ 
  onOpenMobileMenu, 
  backendStatus, 
  onRefreshHealth,
  isCheckingHealth 
}) {
  return (
    <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Title and Subtitle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">AI Research Workspace</h2>
          <p className="text-xs text-text-muted hidden sm:block">
            Research smarter &bull; Discover insights &bull; Generate verified reports
          </p>
        </div>
      </div>

      {/* Right Controls: Backend Connectivity Status */}
      <div className="flex items-center gap-3">
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
          ${backendStatus === 'connected' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : backendStatus === 'checking'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}
        `}>
          {backendStatus === 'connected' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backend Online</span>
            </>
          ) : backendStatus === 'checking' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backend Offline</span>
            </>
          )}

          <button 
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            title="Refresh backend status"
            className="hover:text-white transition-opacity disabled:opacity-50 ml-1"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

