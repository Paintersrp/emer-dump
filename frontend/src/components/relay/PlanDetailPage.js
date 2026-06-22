import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Plus, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Status configs
───────────────────────────────────────────────────── */
const PLAN_STATUS = {
  active:           { label: 'Active',          cls: 'bg-blue-500/15 text-blue-400 border border-blue-600/30' },
  completion_ready: { label: 'Completion Ready', cls: 'bg-amber-500/15 text-amber-400 border border-amber-600/30' },
  complete:         { label: 'Complete',         cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-600/30' },
  abandoned:        { label: 'Abandoned',        cls: 'bg-slate-500/10 text-slate-600 border border-slate-700/25' },
};

const PASS_STATUS = {
  completed:   { label: 'Completed',   dotCls: 'bg-emerald-600',   badgeCls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-800/30' },
  in_progress: { label: 'In Progress', dotCls: 'bg-blue-400',      badgeCls: 'bg-blue-500/10 text-blue-400 border border-blue-600/30' },
  planned:     { label: 'Planned',     dotCls: 'bg-slate-700',     badgeCls: 'bg-slate-500/10 text-slate-500 border border-slate-700/30' },
  skipped:     { label: 'Skipped',     dotCls: 'bg-slate-800',     badgeCls: 'bg-slate-900 text-slate-700 border border-slate-800/50' },
};

const PLAN_CARD = {
  active:           { eyebrow: 'PLAN ACTIVE',      eyebrowCls: 'text-blue-400',    accentCls: 'bg-blue-500' },
  completion_ready: { eyebrow: 'COMPLETION READY', eyebrowCls: 'text-amber-400',   accentCls: 'bg-amber-400' },
  complete:         { eyebrow: 'PLAN COMPLETE',    eyebrowCls: 'text-emerald-400', accentCls: 'bg-emerald-500' },
  abandoned:        { eyebrow: 'PLAN ABANDONED',   eyebrowCls: 'text-slate-600',   accentCls: 'bg-slate-700' },
};

/* ─────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────── */
function copyText(text) {
  navigator.clipboard.writeText(text);
}

function getBlockingDeps(pass, passes) {
  if (!pass.dependencies?.length) return [];
  return pass.dependencies
    .map((id) => passes.find((p) => p.passId === id))
    .filter((dep) => dep && dep.status !== 'completed');
}

/* ─────────────────────────────────────────────────────
   PassRow
───────────────────────────────────────────────────── */
function PassRow({ pass, index, passes, onNavigateToPass, onCreateRun }) {
  const blockingDeps = getBlockingDeps(pass, passes);
  const blocked      = blockingDeps.length > 0;
  const isCurrent    = pass.status === 'in_progress';
  const isCompleted  = pass.status === 'completed';
  const isPlanned    = pass.status === 'planned';
  const passStatusCfg = PASS_STATUS[pass.status] || PASS_STATUS.planned;

  // Left accent strip color
  let accentCls = '';
  if (isCurrent)         accentCls = 'bg-blue-500';
  else if (blocked)      accentCls = 'bg-red-700/50';
  else if (isCompleted)  accentCls = 'bg-emerald-800/40';

  // Contextual primary action
  let actionBtn = null;
  if (isCompleted) {
    actionBtn = (
      <button
        onClick={() => onNavigateToPass(pass.passId)}
        className="flex items-center gap-1 text-[11px] text-slate-600 px-2.5 py-1 border border-[#1e1e1e] rounded-sm hover:border-[#2a2a2a] hover:text-slate-400 transition-colors whitespace-nowrap"
        data-testid={`pass-view-button-${index + 1}`}
      >
        <ExternalLink size={9} />
        View
      </button>
    );
  } else if (isCurrent) {
    actionBtn = (
      <button
        onClick={() => onNavigateToPass(pass.passId)}
        className="flex items-center gap-1 text-[11px] text-blue-400 px-2.5 py-1 border border-blue-700/40 rounded-sm hover:border-blue-500/60 hover:text-blue-300 bg-blue-950/30 transition-colors whitespace-nowrap"
        data-testid={`pass-view-button-${index + 1}`}
      >
        <ExternalLink size={9} />
        Open
      </button>
    );
  } else if (isPlanned && !blocked) {
    actionBtn = (
      <button
        onClick={() => onCreateRun(pass.passId)}
        className="flex items-center gap-1 text-[11px] text-slate-400 px-2.5 py-1 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors whitespace-nowrap"
        data-testid={`pass-run-button-${index + 1}`}
      >
        <Plus size={9} />
        Create run
      </button>
    );
  } else if (isPlanned && blocked) {
    actionBtn = (
      <span
        className="text-[11px] text-slate-800 px-2.5 py-1 border border-[#191919] rounded-sm cursor-not-allowed select-none whitespace-nowrap"
        data-testid={`pass-run-button-${index + 1}`}
      >
        Waiting
      </span>
    );
  }

  return (
    <div
      className={`relative border-b border-[#161616] last:border-b-0 transition-colors ${
        isCurrent ? 'bg-[#0c1118]' : ''
      }`}
      data-testid={`pass-row-${index + 1}`}
    >
      {/* Left accent strip */}
      {accentCls && (
        <div className={`absolute inset-y-0 left-0 w-[2px] ${accentCls}`} />
      )}

      <div className={`flex items-start gap-3 py-3 pr-4 ${accentCls ? 'pl-5' : 'pl-5'}`}>
        {/* Sequence + status dot */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5 flex-shrink-0" style={{ width: '20px' }}>
          <span
            className="text-[10px] font-mono text-slate-700 leading-none"
            data-testid={`pass-sequence-${index + 1}`}
          >
            {index + 1}
          </span>
          <div className={`h-1.5 w-1.5 rounded-full ${passStatusCfg.dotCls}`} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name row: name + passId + status badge */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-0.5">
            <span
              className={`text-[13px] font-medium leading-snug ${
                isCurrent ? 'text-slate-100' : isCompleted ? 'text-slate-500' : 'text-slate-300'
              }`}
              data-testid={`pass-name-${index + 1}`}
            >
              {pass.name}
            </span>
            <span
              className="font-mono text-[10px] text-slate-700"
              data-testid={`pass-id-${index + 1}`}
            >
              {pass.passId}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-px rounded-sm text-[9px] font-medium tracking-wide border ${passStatusCfg.badgeCls}`}
              data-testid={`pass-status-${index + 1}`}
            >
              {passStatusCfg.label}
            </span>
          </div>

          {/* Goal — hide for completed (calmer) */}
          {!isCompleted && pass.goal && (
            <div
              className="text-[11px] text-slate-500 truncate leading-snug mb-1"
              data-testid={`pass-goal-${index + 1}`}
            >
              {pass.goal}
            </div>
          )}

          {/* Scope — only for current pass */}
          {isCurrent && pass.executionScope && (
            <div
              className="font-mono text-[10px] text-slate-700 truncate mb-1"
              data-testid={`pass-scope-${index + 1}`}
            >
              {pass.executionScope}
            </div>
          )}

          {/* Dependency pills */}
          {pass.dependencies && pass.dependencies.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1 mt-1"
              data-testid={`pass-dependencies-${index + 1}`}
            >
              {blocked ? (
                blockingDeps.map((dep) => (
                  <span
                    key={dep.passId}
                    className="inline-flex items-center gap-0.5 font-mono text-[10px] px-1.5 py-px rounded-sm bg-red-500/10 text-red-400 border border-red-800/40"
                  >
                    <AlertCircle size={8} />
                    Blocked by {dep.passId}
                  </span>
                ))
              ) : (
                pass.dependencies.map((depId) => (
                  <span
                    key={depId}
                    className="inline-flex items-center font-mono text-[10px] px-1.5 py-px rounded-sm bg-slate-900 text-slate-700 border border-[#1e1e1e]"
                  >
                    {depId}
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: run hint + action + copy */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <span
            className="font-mono text-[10px] min-w-[68px] text-right"
            data-testid={`pass-run-hint-${index + 1}`}
          >
            {pass.runId ? (
              <span className="text-slate-600">{pass.runId}</span>
            ) : (
              <span className="text-slate-800">No run yet</span>
            )}
          </span>

          {actionBtn}

          <button
            onClick={() => copyText(pass.passId)}
            className="text-slate-800 hover:text-slate-500 transition-colors p-0.5 flex-shrink-0"
            data-testid={`copy-pass-id-button-${index + 1}`}
            title={`Copy ${pass.passId}`}
          >
            <Copy size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PlanDetailPage
───────────────────────────────────────────────────── */
export default function PlanDetailPage({ plan, onBack, onNavigateToPass, onCreateRun }) {
  const navigate = useNavigate();

  const passes      = plan.passes || [];
  const currentPass = passes.find((p) => p.status === 'in_progress') || null;
  const statusCfg   = PLAN_STATUS[plan.status] || PLAN_STATUS.active;
  const cardCfg     = PLAN_CARD[plan.status]   || PLAN_CARD.active;

  // Progress counts
  const total     = passes.length;
  const completed = passes.filter((p) => p.status === 'completed').length;
  const inProg    = passes.filter((p) => p.status === 'in_progress').length;
  const planned   = passes.filter((p) => p.status === 'planned').length;
  const skipped   = passes.filter((p) => p.status === 'skipped').length;

  // Segmented bar geometry
  const BAR_SEGS   = Math.min(total, 12);
  const filledSegs = total <= 12 ? completed : Math.round((completed / total) * 12);
  const activeSegs = total <= 12 ? inProg    : Math.round((inProg    / total) * 12);

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      data-testid="plan-detail-page"
    >
      {/* ── Top nav ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0"
        data-testid="top-nav"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">Relay</span>
          <span className="text-slate-700 text-xs hidden sm:inline">·</span>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">v1.0.4-stable</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            data-testid="nav-plans-btn"
            onClick={() => navigate('/plans')}
            className="text-xs text-slate-200 px-3 py-1.5 border border-[#333] rounded-sm bg-[#1a1a1a] transition-colors"
          >
            Plans
          </button>
          <button
            data-testid="nav-runs-btn"
            onClick={() => navigate('/runs')}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Runs
          </button>
        </div>
      </div>

      {/* ── Page header ── */}
      <div
        className="px-6 pt-4 pb-4 border-b border-[#1a1a1a] flex-shrink-0"
        data-testid="page-header"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3" data-testid="plan-breadcrumb">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={11} />
            Plans
          </button>
          <span className="text-slate-800 text-[11px]">·</span>
          <span className="text-[11px] text-slate-600 truncate max-w-xs">{plan.title}</span>
        </div>

        {/* Title + status badge */}
        <div className="flex items-start gap-3 mb-2.5">
          <h1
            className="text-xl font-semibold text-slate-100 tracking-tight leading-snug"
            data-testid="plan-title"
          >
            {plan.title}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide whitespace-nowrap mt-0.5 flex-shrink-0 ${statusCfg.cls}`}
            data-testid="plan-status-badge"
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Compact metadata bar */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
          data-testid="plan-meta-bar"
        >
          {/* planId — copyable on hover */}
          <button
            onClick={() => copyText(plan.planId)}
            className="flex items-center gap-1 font-mono text-[11px] text-slate-600 hover:text-slate-400 transition-colors group"
            data-testid="plan-id-copy-btn"
            title="Copy plan ID"
          >
            <span data-testid="plan-id">{plan.planId}</span>
            <Copy size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="font-mono text-[11px] text-slate-600" data-testid="plan-repo">
            {plan.repo}
          </span>
          <span className="text-slate-800 text-[10px]">/</span>
          <span className="font-mono text-[11px] text-slate-600" data-testid="plan-branch">
            {plan.branch}
          </span>
          {plan.sourceArtifactPath && (
            <>
              <span className="text-slate-800 text-[10px]">·</span>
              <span
                className="font-mono text-[11px] text-slate-700 truncate max-w-[260px]"
                data-testid="plan-artifact-path"
              >
                {plan.sourceArtifactPath}
              </span>
            </>
          )}
          {plan.updatedAt && (
            <>
              <span className="text-slate-800 text-[10px]">·</span>
              <span className="text-[11px] text-slate-700" data-testid="plan-updated-at">
                {plan.updatedAt}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto" data-testid="plan-detail-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-4">

          {/* ── State card ── */}
          <div
            className="relative border border-[#1e1e1e] bg-[#111111] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 px-5 py-4"
            data-testid="plan-summary-card"
          >
            {/* Colored left accent */}
            <div className={`absolute inset-y-0 left-0 w-[2px] ${cardCfg.accentCls}`} />

            <div className="pl-1 flex flex-col gap-1 min-w-0 flex-1">
              <div className={`text-[10px] font-mono uppercase tracking-[0.18em] ${cardCfg.eyebrowCls}`}>
                {cardCfg.eyebrow}
              </div>
              {plan.status === 'active' && currentPass ? (
                <>
                  <div className="text-sm font-medium text-slate-100 leading-snug">
                    {currentPass.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-xl">
                    {currentPass.goal}
                  </div>
                </>
              ) : plan.status === 'active' ? (
                <div className="text-sm text-slate-400">No pass currently in progress</div>
              ) : plan.status === 'completion_ready' ? (
                <div className="text-sm text-slate-300">All passes complete — plan ready for review</div>
              ) : plan.status === 'complete' ? (
                <div className="text-sm text-slate-400">All planned passes completed successfully</div>
              ) : (
                <div className="text-sm text-slate-600">This plan is no longer active</div>
              )}
            </div>

            {/* Card actions — shown only for active plan with current pass */}
            {plan.status === 'active' && currentPass && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    copyText(
                      `passId: ${currentPass.passId}\ngoal: ${currentPass.goal}\nscope: ${currentPass.executionScope}`
                    )
                  }
                  className="text-[11px] text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors whitespace-nowrap"
                  data-testid="copy-pass-context-btn"
                >
                  Copy context
                </button>
                <button
                  onClick={() => onNavigateToPass(currentPass.passId)}
                  className="text-[11px] text-slate-200 px-3 py-1.5 border border-[#3a3a3a] rounded-sm bg-[#1a1a1a] hover:bg-[#222] hover:text-white transition-colors whitespace-nowrap"
                  data-testid="plan-summary-action-button"
                >
                  Open current pass
                </button>
              </div>
            )}
          </div>

          {/* ── Progress strip ── */}
          {passes.length > 0 && (
            <div
              className="flex items-center gap-4 px-5 py-3 border border-[#1a1a1a] bg-[#0d0d0d]"
              data-testid="progress-summary-strip"
            >
              {/* Segmented bar */}
              <div className="flex gap-px flex-shrink-0">
                {Array.from({ length: BAR_SEGS }).map((_, i) => {
                  let cls = 'bg-slate-800';
                  if (i < filledSegs) cls = 'bg-emerald-600/50';
                  else if (i < filledSegs + activeSegs) cls = 'bg-blue-500/65';
                  return (
                    <div
                      key={i}
                      className={`h-1.5 rounded-[1px] ${cls}`}
                      style={{ width: '8px' }}
                    />
                  );
                })}
              </div>

              {/* Counts */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono">
                <span className="text-slate-600">{total} passes</span>
                {completed > 0 && (
                  <>
                    <span className="text-slate-800">·</span>
                    <span className="text-emerald-600">{completed} completed</span>
                  </>
                )}
                {inProg > 0 && (
                  <>
                    <span className="text-slate-800">·</span>
                    <span className="text-blue-400">{inProg} in progress</span>
                  </>
                )}
                {planned > 0 && (
                  <>
                    <span className="text-slate-800">·</span>
                    <span className="text-slate-600">{planned} planned</span>
                  </>
                )}
                {skipped > 0 && (
                  <>
                    <span className="text-slate-800">·</span>
                    <span className="text-slate-700">{skipped} skipped</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Pass timeline ── */}
          <div data-testid="pass-timeline-list">
            <div className="mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
                Passes — {passes.length}
              </span>
            </div>
            <div className="border border-[#1a1a1a] overflow-hidden">
              {passes.length > 0 ? (
                passes.map((pass, index) => (
                  <PassRow
                    key={pass.passId}
                    pass={pass}
                    index={index}
                    passes={passes}
                    onNavigateToPass={onNavigateToPass}
                    onCreateRun={onCreateRun}
                  />
                ))
              ) : (
                <div className="px-5 py-8 text-center text-xs text-slate-600">
                  No passes defined
                </div>
              )}
            </div>
          </div>

          {/* ── Plan context ── */}
          <div className="border border-[#1a1a1a]" data-testid="artifacts-section">
            <div className="px-5 py-2.5 border-b border-[#1a1a1a]">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
                Plan Context
              </span>
            </div>
            {plan.sourceIntentSummary && (
              <div className="px-5 py-3 border-b border-[#1a1a1a]">
                <div className="text-[10px] text-slate-600 mb-1.5">Source intent</div>
                <div className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {plan.sourceIntentSummary}
                </div>
              </div>
            )}
            <div className="px-5 py-3 flex flex-wrap gap-x-8 gap-y-3">
              {plan.sourceArtifactPath && (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-slate-700">Artifact</div>
                  <div className="font-mono text-[11px] text-slate-500">{plan.sourceArtifactPath}</div>
                </div>
              )}
              {plan.repo && (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-slate-700">Repo</div>
                  <div className="font-mono text-[11px] text-slate-500">{plan.repo}</div>
                </div>
              )}
              {plan.branch && (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-slate-700">Branch</div>
                  <div className="font-mono text-[11px] text-slate-500">{plan.branch}</div>
                </div>
              )}
              {plan.planId && (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-slate-700">Plan ID</div>
                  <div className="font-mono text-[11px] text-slate-500">{plan.planId}</div>
                </div>
              )}
              {plan.updatedAt && (
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-slate-700">Updated</div>
                  <div className="text-[11px] text-slate-500">{plan.updatedAt}</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
