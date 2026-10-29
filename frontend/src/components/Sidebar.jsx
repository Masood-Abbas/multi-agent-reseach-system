import React from 'react';
import { 
  Bot, 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  Bookmark, 
  Settings, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  onNewResearch,
  historyCount = 0 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard },
    { id: 'history', label: 'Research History', icon: History, badge: historyCount > 0 ? historyCount : null },
    { id: 'saved', label: 'Saved Reports', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-sidebar border-r border-white/5 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header & Navigation */}
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-base text-white tracking-tight flex items-center gap-1.5">
                  ResearchAI
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary font-medium">v1.0</span>
                </h1>
                <p className="text-xs text-text-muted">Multi-Agent System</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Research Action Button */}
          <button
            onClick={() => {
              onNewResearch();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium text-sm hover:opacity-95 shadow-md shadow-accent-primary/25 transition-all duration-200 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Research</span>
          </button>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive 
                      ? 'bg-accent-primary/15 text-white border border-accent-primary/30' 
                      : 'text-text-muted hover:text-white hover:bg-white/5'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-text-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted font-normal">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Info */}
        <div className="p-5 border-t border-white/5">
          <div className="p-3 rounded-xl bg-card border border-white/5 text-xs">
            <div className="flex items-center justify-between text-text-muted mb-1.5">
              <span>Orchestrator</span>
              <span className="text-emerald-400 font-medium">LangChain</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>LLM Engine</span>
              <span className="text-accent-primary font-medium">Gemini 2.5</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-center text-text-dim">
            ResearchAI Studio &bull; 2026
          </p>
        </div>
      </aside>
    </>
  );
}

