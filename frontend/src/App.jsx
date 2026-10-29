import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ResearchForm from './components/ResearchForm';
import PipelineStepper from './components/PipelineStepper';
import ResearchResults from './components/ResearchResults';
import HistoryView from './components/HistoryView';
import { checkApiHealth, runResearch } from './services/researchApi';
import { loadHistoryFromStorage, saveHistoryItem, deleteHistoryItem, clearAllHistory } from './utils/historyStorage';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'saved' | 'settings'

  // Backend Health
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Research State
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed'
  const [pipelineStage, setPipelineStage] = useState(1);
  const [researchData, setResearchData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // History State
  const [history, setHistory] = useState([]);

  // Check health on mount & load history
  useEffect(() => {
    handleCheckHealth();
    setHistory(loadHistoryFromStorage());
  }, []);

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    setBackendStatus('checking');
    const res = await checkApiHealth();
    if (res.ok) {
      setBackendStatus('connected');
    } else {
      setBackendStatus('offline');
    }
    setIsCheckingHealth(false);
  };

  // Stepper simulation timer while the synchronous backend runs
  useEffect(() => {
    let timer1, timer2, timer3;
    if (isLoading && pipelineStatus === 'running') {
      setPipelineStage(1);
      // Progressive visual feedback across expected multi-step durations
      timer1 = setTimeout(() => setPipelineStage(2), 6000);
      timer2 = setTimeout(() => setPipelineStage(3), 16000);
      timer3 = setTimeout(() => setPipelineStage(4), 26000);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isLoading, pipelineStatus]);

  const handleStartResearch = async (topic) => {
    setIsLoading(true);
    setErrorMessage('');
    setPipelineStatus('running');
    setPipelineStage(1);
    setResearchData(null);
    setActiveTab('dashboard');

    const result = await runResearch(topic);

    if (result.ok) {
      setResearchData(result.data);
      setPipelineStatus('completed');
      setPipelineStage(4);

      // Save to local browser history
      const updated = saveHistoryItem(result.data);
      setHistory(updated);
    } else {
      setErrorMessage(result.error);
      setPipelineStatus('failed');
    }

    setIsLoading(false);
  };

  const handleSelectHistoryItem = (item) => {
    setResearchData(item);
    setPipelineStatus('completed');
    setErrorMessage('');
    setActiveTab('dashboard');
  };

  const handleDeleteHistory = (id) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved research history?')) {
      const updated = clearAllHistory();
      setHistory(updated);
    }
  };

  const handleNewResearch = () => {
    setResearchData(null);
    setPipelineStatus('idle');
    setErrorMessage('');
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-text-main font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewResearch={handleNewResearch}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <Header
          onOpenMobileMenu={() => setSidebarOpen(true)}
          backendStatus={backendStatus}
          onRefreshHealth={handleCheckHealth}
          isCheckingHealth={isCheckingHealth}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Research Input Form */}
              <ResearchForm
                onSubmit={handleStartResearch}
                isLoading={isLoading}
                disabled={backendStatus === 'offline'}
              />

              {/* Offline Warning Banner */}
              {backendStatus === 'offline' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Backend Offline:</strong> Ensure the Python FastAPI server is running with <code className="bg-black/30 px-1 py-0.5 rounded">python main.py</code> on port 8000.
                    </span>
                  </div>
                  <button
                    onClick={handleCheckHealth}
                    className="flex items-center gap-1 underline hover:text-white shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Connection</span>
                  </button>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Research Pipeline Execution Failed</p>
                    <p className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Pipeline Stepper */}
              <PipelineStepper
                status={pipelineStatus}
                currentStage={pipelineStage}
              />

              {/* Research Results Workspace */}
              <ResearchResults data={researchData} />
            </>
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          )}

          {activeTab === 'saved' && (
            <div className="p-12 text-center bg-card border border-card-border rounded-2xl max-w-lg mx-auto">
              <h3 className="text-base font-semibold text-white">Saved Reports Collection</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Save reports directly from your research history or download them as standard Markdown files (.md).
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 bg-card border border-card-border rounded-2xl max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Settings & Configuration</h3>
                <p className="text-xs text-text-muted mt-0.5">Manage API endpoints and local preferences.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                <div>
                  <label className="block text-text-muted font-medium mb-1.5">FastAPI Backend URL</label>
                  <input
                    type="text"
                    disabled
                    value={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                    className="w-full bg-background border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                  <p className="text-[11px] text-text-dim mt-1">Configured via VITE_API_URL in frontend/.env</p>
                </div>

                <div>
                  <label className="block text-text-muted font-medium mb-1.5">Model Provider</label>
                  <div className="p-3 bg-background border border-white/5 rounded-xl text-text-main flex items-center justify-between">
                    <span>Google Gemini 2.5 Flash / Pro</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

