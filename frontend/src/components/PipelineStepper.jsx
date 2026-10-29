import React from 'react';
import { Globe, BookOpen, PenTool, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';

const STAGES = [
  {
    id: 1,
    name: 'Web Search',
    description: 'Find relevant and reliable sources',
    icon: Globe,
  },
  {
    id: 2,
    name: 'Content Reading',
    description: 'Scrape and extract in-depth pages',
    icon: BookOpen,
  },
  {
    id: 3,
    name: 'Report Writing',
    description: 'Synthesize insights into a report',
    icon: PenTool,
  },
  {
    id: 4,
    name: 'Quality Review',
    description: 'Evaluate & score report out of 10',
    icon: CheckCircle2,
  },
];

export default function PipelineStepper({ status, currentStage = 0 }) {
  // status: 'idle' | 'running' | 'completed' | 'failed'

  if (status === 'idle') return null;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Agentic Pipeline
          </h4>
          <p className="text-sm font-medium text-white mt-0.5">
            {status === 'running' && 'Multi-agent orchestration in progress...'}
            {status === 'completed' && 'Research finished successfully'}
            {status === 'failed' && 'Pipeline encountered an error'}
          </p>
        </div>

        {status === 'running' && (
          <div className="flex items-center gap-2 text-xs text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Autonomous Execution</span>
          </div>
        )}
      </div>

      {/* Stepper (Horizontal on desktop, vertical on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;

          // Compute state for this stage
          let stageState = 'waiting'; // 'waiting' | 'running' | 'completed' | 'failed'

          if (status === 'completed') {
            stageState = 'completed';
          } else if (status === 'failed') {
            if (stage.id < currentStage) stageState = 'completed';
            else if (stage.id === currentStage) stageState = 'failed';
            else stageState = 'waiting';
          } else if (status === 'running') {
            if (stage.id < currentStage) stageState = 'completed';
            else if (stage.id === currentStage) stageState = 'running';
            else stageState = 'waiting';
          }

          return (
            <div
              key={stage.id}
              className={`
                relative p-4 rounded-xl border transition-all duration-300
                ${stageState === 'completed' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : stageState === 'running'
                  ? 'bg-accent-primary/10 border-accent-primary/40 text-accent-primary shadow-lg shadow-accent-primary/10'
                  : stageState === 'failed'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-background/40 border-white/5 text-text-dim'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5">
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  {stageState === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {stageState === 'running' && (
                    <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                  )}
                  {stageState === 'failed' && (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  {stageState === 'waiting' && (
                    <Circle className="w-4 h-4 text-text-dim/40" />
                  )}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                  Stage {stage.id}
                </span>
                <h5 className="text-sm font-semibold text-white mt-0.5">
                  {stage.name}
                </h5>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

