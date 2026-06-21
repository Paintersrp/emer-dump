import React from 'react';
import { ArrowLeft, Copy, ExternalLink, PlayCircle, AlertCircle } from 'lucide-react';

const PlanDetailPage = ({ plan, onBack, onNavigateToPass, onCreateRun }) => {
  // Utility: Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Determine plan state
  const planState = plan.status || 'active';

  // Calculate progress metrics
  const totalPasses = plan.passes?.length || 0;
  const completedPasses = plan.passes?.filter(p => p.status === 'completed').length || 0;
  const inProgressPasses = plan.passes?.filter(p => p.status === 'in_progress').length || 0;
  const plannedPasses = plan.passes?.filter(p => p.status === 'planned').length || 0;
  const skippedPasses = plan.passes?.filter(p => p.status === 'skipped').length || 0;
  const completionReadyPasses = plan.passes?.filter(p => p.status === 'completion_ready').length || 0;

  // Find current/next pass
  const currentPass = plan.passes?.find(p => p.status === 'in_progress');
  const nextPass = plan.passes?.find(p => p.status === 'planned' && !p.blockedBy);

  // Check if pass is blocked
  const isPassBlocked = (pass) => {
    if (!pass.dependencies || pass.dependencies.length === 0) return false;
    return pass.dependencies.some(depId => {
      const depPass = plan.passes?.find(p => p.passId === depId);
      return depPass && depPass.status !== 'completed';
    });
  };

  // Get blocking dependency
  const getBlockingDependency = (pass) => {
    if (!pass.dependencies) return null;
    for (const depId of pass.dependencies) {
      const depPass = plan.passes?.find(p => p.passId === depId);
      if (depPass && depPass.status !== 'completed') {
        return depPass;
      }
    }
    return null;
  };

  // Status badge color helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'completion_ready':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'complete':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'abandoned':
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getPassStatusBadgeClass = (status) => {
    switch (status) {
      case 'in_progress':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'completed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'skipped':
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      case 'planned':
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  // Render plan summary card based on state
  const renderPlanSummary = () => {
    switch (planState) {
      case 'active':
        return (
          <div className="border border-zinc-800 bg-zinc-900/50 p-5 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-testid="plan-summary-card">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">PLAN ACTIVE</div>
              <div className="text-lg font-medium text-zinc-100">
                {currentPass ? `Current pass in progress: ${currentPass.name}` : nextPass ? `Next pass ready: ${nextPass.name}` : 'No current pass'}
              </div>
              <div className="text-sm text-zinc-400">
                {currentPass ? currentPass.goal : nextPass ? nextPass.goal : 'All passes are terminal or blocked'}
              </div>
            </div>
            {(currentPass || nextPass) && (
              <button
                onClick={() => onNavigateToPass(currentPass?.passId || nextPass?.passId)}
                className="bg-zinc-100 text-zinc-950 hover:bg-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                data-testid="plan-summary-action-button"
              >
                {currentPass ? 'Open current pass' : 'Open next pass'}
              </button>
            )}
          </div>
        );
      case 'completion_ready':
        return (
          <div className="border border-zinc-800 bg-zinc-900/50 p-5 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-testid="plan-summary-card">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-yellow-400">COMPLETION READY</div>
              <div className="text-lg font-medium text-zinc-100">All passes are terminal</div>
              <div className="text-sm text-zinc-400">Manual final review is ready.</div>
            </div>
            <button
              onClick={() => console.log('Review completion evidence')}
              className="bg-zinc-100 text-zinc-950 hover:bg-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              data-testid="plan-summary-action-button"
            >
              Review completion evidence
            </button>
          </div>
        );
      case 'complete':
        return (
          <div className="border border-zinc-800 bg-zinc-900/50 p-5 rounded-md flex flex-col gap-2" data-testid="plan-summary-card">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">PLAN COMPLETE</div>
            <div className="text-lg font-medium text-zinc-100">Plan complete</div>
            <div className="text-sm text-zinc-400">All planned passes are complete.</div>
          </div>
        );
      case 'abandoned':
        return (
          <div className="border border-zinc-800 bg-zinc-900/50 p-5 rounded-md flex flex-col gap-2" data-testid="plan-summary-card">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">PLAN ABANDONED</div>
            <div className="text-lg font-medium text-zinc-100">Plan abandoned</div>
            <div className="text-sm text-zinc-400">This plan is no longer active.</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header / Breadcrumb */}
        <div className="flex flex-col gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-sm text-zinc-400" data-testid="plan-breadcrumb">
              Plans / <span className="text-zinc-200">{plan.title}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100" data-testid="plan-title">
                {plan.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusBadgeClass(planState)}`}
                  data-testid="plan-status-badge"
                >
                  {planState === 'active' ? 'Active' : planState === 'completion_ready' ? 'Completion Ready' : planState === 'complete' ? 'Complete' : 'Abandoned'}
                </span>
                <span className="text-xs font-mono text-zinc-500" data-testid="plan-id">
                  {plan.planId}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-zinc-500">
              {plan.repo && (
                <div className="font-mono" data-testid="plan-repo">
                  {plan.repo} / {plan.branch || 'main'}
                </div>
              )}
              {plan.sourceArtifactPath && (
                <div className="font-mono" data-testid="plan-artifact-path">
                  {plan.sourceArtifactPath}
                </div>
              )}
              {plan.updatedAt && (
                <div data-testid="plan-updated-at">{plan.updatedAt}</div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Summary/Current State Card */}
        {renderPlanSummary()}

        {/* Progress Summary Strip */}
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border border-zinc-800 rounded-md bg-zinc-950 overflow-hidden" data-testid="progress-summary-strip">
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">Total passes</div>
            <div className="text-xl font-mono text-zinc-100">{totalPasses}</div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">Completed</div>
            <div className="text-xl font-mono text-emerald-400">{completedPasses}</div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">In progress</div>
            <div className="text-xl font-mono text-cyan-400">{inProgressPasses}</div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">Planned</div>
            <div className="text-xl font-mono text-zinc-400">{plannedPasses}</div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">Skipped</div>
            <div className="text-xl font-mono text-zinc-500">{skippedPasses}</div>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col gap-1">
            <div className="text-xs text-zinc-500">Completion ready</div>
            <div className="text-xl font-mono text-yellow-400">{completionReadyPasses}</div>
          </div>
        </div>

        {/* Pass Timeline/List */}
        <div className="space-y-3">
          <h2 className="text-xl font-medium tracking-tight text-zinc-100">Pass Timeline</h2>
          <div className="border border-zinc-800 rounded-md divide-y divide-zinc-800 bg-zinc-950" data-testid="pass-timeline-list">
            {plan.passes && plan.passes.length > 0 ? (
              plan.passes.map((pass, index) => {
                const blocked = isPassBlocked(pass);
                const blockingDep = blocked ? getBlockingDependency(pass) : null;
                const canCreateRun = (pass.status === 'planned' || pass.status === 'in_progress') && !blocked;

                return (
                  <div
                    key={pass.passId}
                    className="py-3 px-4 hover:bg-zinc-900/50 transition-colors"
                    data-testid={`pass-row-${index + 1}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Sequence */}
                      <div className="text-xs font-mono text-zinc-500 w-8" data-testid={`pass-sequence-${index + 1}`}>
                        {index + 1}
                      </div>

                      {/* Name and ID */}
                      <div className="flex flex-col gap-0.5 min-w-[200px]">
                        <div className="text-zinc-200 font-medium text-sm" data-testid={`pass-name-${index + 1}`}>
                          {pass.name}
                        </div>
                        <div className="text-xs font-mono text-zinc-500" data-testid={`pass-id-${index + 1}`}>
                          {pass.passId}
                        </div>
                      </div>

                      {/* Status Pill */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium border ${getPassStatusBadgeClass(pass.status)} whitespace-nowrap`}
                        data-testid={`pass-status-${index + 1}`}
                      >
                        {pass.status === 'in_progress' ? 'In Progress' : pass.status === 'completed' ? 'Completed' : pass.status === 'skipped' ? 'Skipped' : 'Planned'}
                      </span>

                      {/* Goal and Scope */}
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="text-zinc-300 text-sm" data-testid={`pass-goal-${index + 1}`}>
                          {pass.goal || 'No goal specified'}
                        </div>
                        <div className="text-xs text-zinc-500 truncate max-w-sm" data-testid={`pass-scope-${index + 1}`}>
                          {pass.executionScope || 'No execution scope'}
                        </div>
                      </div>

                      {/* Dependencies */}
                      <div className="flex gap-2 items-center flex-wrap" data-testid={`pass-dependencies-${index + 1}`}>
                        {blocked && blockingDep ? (
                          <span className="text-xs font-mono rounded-full px-2 py-0.5 border text-red-400 bg-red-400/10 border-red-400/20 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Blocked by {blockingDep.passId}
                          </span>
                        ) : pass.dependencies && pass.dependencies.length > 0 ? (
                          pass.dependencies.map(depId => (
                            <span key={depId} className="text-xs font-mono rounded-full px-2 py-0.5 border text-zinc-400 bg-zinc-400/10 border-zinc-400/20">
                              {depId}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No dependencies</span>
                        )}
                      </div>

                      {/* Associated Run Hint */}
                      <div className="text-xs text-zinc-500 min-w-[120px]" data-testid={`pass-run-hint-${index + 1}`}>
                        {pass.runId ? (
                          <span className="font-mono">{pass.runId}</span>
                        ) : (
                          <span className="italic">No run created yet</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 items-center" data-testid={`pass-actions-${index + 1}`}>
                        <button
                          onClick={() => onNavigateToPass(pass.passId)}
                          className="hover:bg-zinc-800 text-zinc-300 hover:text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                          data-testid={`pass-view-button-${index + 1}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => canCreateRun && onCreateRun(pass.passId)}
                          disabled={!canCreateRun}
                          className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                            canCreateRun
                              ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                              : 'text-zinc-600 cursor-not-allowed'
                          }`}
                          data-testid={`pass-run-button-${index + 1}`}
                        >
                          <PlayCircle className="w-3 h-3" />
                          Run
                        </button>
                        <button
                          onClick={() => copyToClipboard(pass.passId)}
                          className="hover:bg-zinc-800 text-zinc-300 hover:text-white px-2 py-1 rounded text-xs transition-colors"
                          data-testid={`copy-pass-id-button-${index + 1}`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-zinc-500 italic">No passes available</div>
            )}
          </div>
        </div>

        {/* Plan Artifacts/Source Context */}
        <div className="space-y-3">
          <h2 className="text-xl font-medium tracking-tight text-zinc-100">Plan Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-zinc-800 rounded-md p-4 bg-zinc-900/30" data-testid="artifacts-section">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Source Intent Summary</div>
              <div className="text-sm font-mono text-zinc-300">{plan.sourceIntentSummary || 'No source intent summary'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Source Artifact Path</div>
              <div className="text-sm font-mono text-zinc-300">{plan.sourceArtifactPath || 'Source artifact unavailable'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Repository</div>
              <div className="text-sm font-mono text-zinc-300">{plan.repo || 'No repository'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Branch</div>
              <div className="text-sm font-mono text-zinc-300">{plan.branch || 'No branch'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Plan ID</div>
              <div className="text-sm font-mono text-zinc-300">{plan.planId}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500">Plan Status</div>
              <div className="text-sm font-mono text-zinc-300">{planState}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailPage;
