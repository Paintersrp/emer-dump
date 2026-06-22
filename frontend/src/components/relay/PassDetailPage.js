import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Plus, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Status configs
───────────────────────────────────────────────────── */
const PASS_STATUS = {
  completed:   { label: 'Completed',   dotCls: 'bg-emerald-600',   badgeCls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-800/30' },
  in_progress: { label: 'In Progress', dotCls: 'bg-blue-400',      badgeCls: 'bg-blue-500/10 text-blue-400 border border-blue-600/30' },
  planned:     { label: 'Planned',     dotCls: 'bg-slate-700',     badgeCls: 'bg-slate-500/10 text-slate-500 border border-slate-700/30' },
  skipped:     { label: 'Skipped',     dotCls: 'bg-slate-800',     badgeCls: 'bg-slate-900 text-slate-700 border border-slate-800/50' },
  blocked:     { label: 'Blocked',     dotCls: 'bg-red-700/80',    badgeCls: 'bg-red-500/10 text-red-400 border border-red-700/30' },
};

const PLAN_STATUS = {
  active:           { label: 'Active',          cls: 'bg-blue-500/15 text-blue-400 border border-blue-600/30' },
  completion_ready: { label: 'Completion Ready', cls: 'bg-amber-500/15 text-amber-400 border border-amber-600/30' },
  complete:         { label: 'Complete',         cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-600/30' },
  abandoned:        { label: 'Abandoned',        cls: 'bg-slate-500/10 text-slate-600 border border-slate-700/25' },
};

/* ─────────────────────────────────────────────────────
   State card configs (by derived pass state)
───────────────────────────────────────────────────── */
const PASS_CARD = {
  ready: {
    eyebrow:    'PASS READY',
    eyebrowCls: 'text-amber-400',
    accentCls:  'bg-amber-400',
    title:      'Ready for run creation',
    message:    'This pass can be used to create a pass-associated Relay run.',
  },
  blocked: {
    eyebrow:    'PASS BLOCKED',
    eyebrowCls: 'text-red-400',
    accentCls:  'bg-red-600',
    title:      'Waiting on dependency',
    message:    null, // set dynamically
  },
  in_progress: {
    eyebrow:    'PASS IN PROGRESS',
    eyebrowCls: 'text-blue-400',
    accentCls:  'bg-blue-500',
    title:      'Run in progress for this pass',
    message:    'This pass has an associated run currently in progress.',
  },
  completed: {
    eyebrow:    'PASS COMPLETE',
    eyebrowCls: 'text-emerald-400',
    accentCls:  'bg-emerald-500',
    title:      'Pass completed',
    message:    'Audit acceptance completed this pass.',
  },
  skipped: {
    eyebrow:    'PASS SKIPPED',
    eyebrowCls: 'text-slate-500',
    accentCls:  'bg-slate-700',
    title:      'Pass skipped',
    message:    'This pass is terminal and will not create a run.',
  },
};

/* ─────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────── */
function copyText(t) { navigator.clipboard.writeText(t); }

function getBlockingDeps(pass, allPasses) {
  if (!pass.dependencies?.length) return [];
  return pass.dependencies
    .map((id) => allPasses.find((p) => p.passId === id))
    .filter((dep) => dep && dep.status !== 'completed');
}

function getPassCardState(pass, allPasses) {
  if (pass.status === 'in_progress') return 'in_progress';
  if (pass.status === 'completed')   return 'completed';
  if (pass.status === 'skipped')     return 'skipped';
  const blocking = getBlockingDeps(pass, allPasses);
  return blocking.length > 0 ? 'blocked' : 'ready';
}

function buildCopyContext(pass, planId) {
  const lines = [
    `planId: ${planId || ''}`,
    `passId: ${pass.passId}`,
    `name: ${pass.name}`,
    `goal: ${pass.goal || ''}`,
    `scope: ${pass.executionScope || ''}`,
  ];
  if (pass.nonGoals) lines.push(`nonGoals: ${pass.nonGoals}`);
  if (pass.dependencies?.length) lines.push(`dependencies: ${pass.dependencies.join(', ')}`);
  return lines.join('\n');
}

/* ─────────────────────────────────────────────────────
   StateCard — dominant current-state element
───────────────────────────────────────────────────── */
function StateCard({ pass, plan, allPasses, onCreateRun, onOpenRun, onNavigateToDep, onBackToPlan }) {
  const cardState    = getPassCardState(pass, allPasses);
  const blockingDeps = getBlockingDeps(pass, allPasses);
  const cfg          = PASS_CARD[cardState];

  const blockedMessage =
    blockingDeps.length === 1
      ? `This pass depends on ${blockingDeps[0].passId}, which has not completed.`
      : `This pass depends on ${blockingDeps.map((d) => d.passId).join(', ')}, which have not completed.`;

  const message = cardState === 'blocked' ? blockedMessage : cfg.message;

  return (
    <div
      className="relative border border-[#1e1e1e] bg-[#111111] flex items-start justify-between gap-4 px-5 py-4"
      data-testid="pass-state-card"
    >
      <div className={`absolute inset-y-0 left-0 w-[2px] ${cfg.accentCls}`} />

      <div className="pl-1 flex flex-col gap-1 min-w-0 flex-1">
        <div className={`text-[10px] font-mono uppercase tracking-[0.18em] ${cfg.eyebrowCls}`}>
          {cfg.eyebrow}
        </div>
        <div className="text-sm font-medium text-slate-100 leading-snug">{cfg.title}</div>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </div>

      {/* Contextual actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {cardState === 'ready' && (
          <>
            <button
              onClick={() => copyText(buildCopyContext(pass, plan.planId))}
              className="text-[11px] text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors whitespace-nowrap"
              data-testid="copy-pass-context-btn"
            >
              Copy context
            </button>
            <button
              onClick={() => onCreateRun(pass.passId)}
              className="flex items-center gap-1.5 text-[11px] text-slate-200 px-3 py-1.5 border border-[#3a3a3a] rounded-sm bg-[#1a1a1a] hover:bg-[#222] hover:text-white transition-colors whitespace-nowrap"
              data-testid="create-run-btn"
            >
              <Plus size={10} />
              Create run for this pass
            </button>
          </>
        )}

        {cardState === 'blocked' && blockingDeps[0] && (
          <button
            onClick={() => onNavigateToDep(blockingDeps[0].passId)}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors whitespace-nowrap"
            data-testid="open-blocking-pass-btn"
          >
            <ExternalLink size={10} />
            Open blocking pass
          </button>
        )}

        {cardState === 'in_progress' && (
          <>
            <button
              onClick={() => copyText(buildCopyContext(pass, plan.planId))}
              className="text-[11px] text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors whitespace-nowrap"
              data-testid="copy-pass-context-btn"
            >
              Copy context
            </button>
            {pass.runId && (
              <button
                onClick={() => onOpenRun(pass.runId)}
                className="flex items-center gap-1.5 text-[11px] text-blue-400 px-3 py-1.5 border border-blue-700/40 rounded-sm hover:border-blue-500/60 hover:text-blue-300 bg-blue-950/30 transition-colors whitespace-nowrap"
                data-testid="open-run-btn"
              >
                <ExternalLink size={10} />
                Open associated run
              </button>
            )}
          </>
        )}

        {cardState === 'completed' && (
          <>
            <button
              onClick={onBackToPlan}
              className="text-[11px] text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors whitespace-nowrap"
              data-testid="back-to-plan-btn"
            >
              Back to plan
            </button>
            {pass.runId && (
              <button
                onClick={() => onOpenRun(pass.runId)}
                className="flex items-center gap-1.5 text-[11px] text-emerald-400 px-3 py-1.5 border border-emerald-700/40 rounded-sm hover:border-emerald-500/60 hover:text-emerald-300 bg-emerald-950/20 transition-colors whitespace-nowrap"
                data-testid="open-run-btn"
              >
                <ExternalLink size={10} />
                Open result run
              </button>
            )}
          </>
        )}

        {cardState === 'skipped' && (
          <button
            onClick={onBackToPlan}
            className="text-[11px] text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors whitespace-nowrap"
            data-testid="back-to-plan-btn"
          >
            Back to plan
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ParentPlanCard
───────────────────────────────────────────────────── */
function ParentPlanCard({ plan, onBackToPlan }) {
  const planStatusCfg = PLAN_STATUS[plan.status] || PLAN_STATUS.active;

  return (
    <div className="border border-[#1a1a1a]" data-testid="parent-plan-card">
      <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
          Parent Plan
        </span>
        <button
          onClick={onBackToPlan}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          data-testid="back-to-plan-link"
        >
          <ArrowLeft size={9} />
          Back to plan
        </button>
      </div>
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-sm font-medium text-slate-300 leading-snug"
            data-testid="parent-plan-title"
          >
            {plan.title}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-px rounded-sm text-[9px] font-medium whitespace-nowrap border ${planStatusCfg.cls}`}
          >
            {planStatusCfg.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="font-mono text-[10px] text-slate-600" data-testid="parent-plan-id">
            {plan.planId}
          </span>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="font-mono text-[10px] text-slate-600">
            {plan.repo} / {plan.branch}
          </span>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="font-mono text-[10px] text-slate-600">
            {plan.completedPasses} / {plan.totalPasses} completed
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ExecutionContract
───────────────────────────────────────────────────── */
function ExecutionContract({ pass }) {
  const scopePaths = pass.executionScope
    ? pass.executionScope.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="border border-[#1a1a1a]" data-testid="execution-contract">
      <div className="px-5 py-2.5 border-b border-[#1a1a1a]">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
          Pass Execution Contract
        </span>
      </div>
      <div className="divide-y divide-[#161616]">
        {pass.goal && (
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 mb-1.5">Goal</div>
            <div className="text-xs text-slate-300 leading-relaxed" data-testid="pass-goal">
              {pass.goal}
            </div>
          </div>
        )}
        {scopePaths.length > 0 && (
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 mb-1.5">Scope</div>
            <div className="flex flex-col gap-0.5" data-testid="pass-scope">
              {scopePaths.map((path) => (
                <span key={path} className="font-mono text-[11px] text-slate-500 leading-snug">
                  {path}
                </span>
              ))}
            </div>
          </div>
        )}
        {pass.nonGoals && (
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 mb-1.5">Non-goals</div>
            <div className="text-xs text-slate-500 leading-relaxed" data-testid="pass-nongoals">
              {pass.nonGoals}
            </div>
          </div>
        )}
        {pass.expectedOutput && (
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 mb-1.5">Expected output</div>
            <div className="text-xs text-slate-500 leading-relaxed" data-testid="pass-expected-output">
              {pass.expectedOutput}
            </div>
          </div>
        )}
        {pass.acceptanceNotes && (
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 mb-1.5">Acceptance</div>
            <div className="text-xs text-slate-500 leading-relaxed" data-testid="pass-acceptance">
              {pass.acceptanceNotes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   DependenciesSection
───────────────────────────────────────────────────── */
function DependenciesSection({ pass, allPasses, onNavigateToDep }) {
  const blockingDeps = getBlockingDeps(pass, allPasses);

  if (!pass.dependencies?.length) {
    return (
      <div className="border border-[#1a1a1a]" data-testid="dependencies-section">
        <div className="px-5 py-2.5 border-b border-[#1a1a1a]">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
            Dependencies
          </span>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] text-slate-700">No dependencies</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#1a1a1a]" data-testid="dependencies-section">
      <div className="px-5 py-2.5 border-b border-[#1a1a1a]">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
          Dependencies — {pass.dependencies.length}
        </span>
      </div>
      <div className="divide-y divide-[#161616]">
        {pass.dependencies.map((depId) => {
          const dep        = allPasses.find((p) => p.passId === depId);
          const isBlocking = dep && dep.status !== 'completed';
          const depCfg     = dep ? (PASS_STATUS[dep.status] || PASS_STATUS.planned) : null;

          return (
            <div
              key={depId}
              className="px-5 py-2.5 flex items-center gap-3"
              data-testid={`dep-row-${depId}`}
            >
              {dep && (
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${depCfg.dotCls}`} />
              )}

              <button
                onClick={() => onNavigateToDep(depId)}
                className="font-mono text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {depId}
              </button>

              {dep && (
                <span
                  className={`inline-flex items-center px-1.5 py-px rounded-sm text-[9px] font-medium tracking-wide border ${depCfg.badgeCls}`}
                >
                  {depCfg.label}
                </span>
              )}

              {isBlocking && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500/80">
                  <AlertCircle size={9} />
                  blocking
                </span>
              )}

              {dep?.runId && (
                <span className="font-mono text-[10px] text-slate-700 ml-auto">{dep.runId}</span>
              )}

              <button
                onClick={() => onNavigateToDep(depId)}
                className="text-slate-700 hover:text-slate-400 transition-colors p-0.5 flex-shrink-0 ml-auto"
                title={`Open ${depId}`}
              >
                <ExternalLink size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Blocking notice */}
      {blockingDeps.length > 0 && (
        <div className="px-5 py-2 border-t border-red-900/20 bg-red-950/10">
          <span className="text-[10px] text-red-600/80">
            Run creation is blocked until all dependencies are completed.
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   RunsSection
───────────────────────────────────────────────────── */
const RUN_DOT = {
  completed:            'bg-emerald-500',
  in_progress:          'bg-blue-400',
  intake_needs_review:  'bg-amber-400',
  approved:             'bg-amber-400',
  blocked:              'bg-red-600',
};
const RUN_TEXT = {
  completed:            'text-emerald-600',
  in_progress:          'text-blue-400',
  intake_needs_review:  'text-amber-400',
  approved:             'text-amber-400',
  blocked:              'text-red-400',
};

function RunsSection({ pass, runs, allPasses, onCreateRun, onOpenRun }) {
  const blockingDeps = getBlockingDeps(pass, allPasses);
  const canCreateRun = pass.status === 'planned' && blockingDeps.length === 0;
  const isSkipped    = pass.status === 'skipped';

  return (
    <div className="border border-[#1a1a1a]" data-testid="runs-section">
      <div className="px-5 py-2.5 border-b border-[#1a1a1a]">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
          Associated Runs{runs.length > 0 ? ` — ${runs.length}` : ''}
        </span>
      </div>

      {runs.length === 0 ? (
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-[11px] text-slate-600">
            {isSkipped
              ? 'No run will be created for this pass.'
              : 'No run created for this pass yet.'}
          </span>
          {canCreateRun && (
            <button
              onClick={() => onCreateRun(pass.passId)}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors whitespace-nowrap flex-shrink-0"
              data-testid="create-run-link-btn"
            >
              <Plus size={10} />
              Create run for this pass
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#161616]">
          {runs.map((run) => (
            <div
              key={run.runId}
              className="px-5 py-3 flex items-start justify-between gap-3"
              data-testid={`run-row-${run.runId}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${RUN_DOT[run.status] || 'bg-slate-700'}`}
                  />
                  <span className="font-mono text-[11px] text-slate-500">{run.runId}</span>
                  <span className={`text-[10px] ${RUN_TEXT[run.status] || 'text-slate-600'}`}>
                    {run.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {run.title && (
                  <div className="text-[11px] text-slate-400 truncate">{run.title}</div>
                )}
                <div className="flex items-center gap-2">
                  {run.stage && (
                    <span className="text-[10px] text-slate-700">{run.stage}</span>
                  )}
                  {run.updatedAt && (
                    <>
                      <span className="text-slate-800 text-[10px]">·</span>
                      <span className="text-[10px] text-slate-700">
                        {run.updatedAt.split('T')[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => onOpenRun(run.runId)}
                className="flex items-center gap-1 text-[11px] text-slate-500 px-2.5 py-1 border border-[#1e1e1e] rounded-sm hover:border-[#2a2a2a] hover:text-slate-300 transition-colors whitespace-nowrap flex-shrink-0 mt-0.5"
                data-testid={`open-run-btn-${run.runId}`}
              >
                <ExternalLink size={9} />
                Open run
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Inspector rail (right side)
───────────────────────────────────────────────────── */
function Inspector({ pass, plan, allPasses, runs, sequence, totalPasses }) {
  const [activeTab, setActiveTab] = useState('details');

  const blockingDeps  = getBlockingDeps(pass, allPasses);
  const passStatusCfg = PASS_STATUS[pass.status] || PASS_STATUS.planned;

  const detailGroups = [
    {
      label: 'Pass',
      rows: [
        { key: 'Pass ID',   val: pass.passId,                     mono: true,  copyable: true  },
        { key: 'Status',    val: passStatusCfg.label,             mono: false, copyable: false },
        { key: 'Sequence',  val: `${sequence} of ${totalPasses}`, mono: true,  copyable: false },
      ],
    },
    {
      label: 'Plan',
      rows: [
        { key: 'Plan ID', val: plan.planId,                    mono: true, copyable: true  },
        { key: 'Repo',    val: `${plan.repo} / ${plan.branch}`, mono: true, copyable: false },
      ],
    },
    {
      label: 'Dependencies',
      rows: [
        { key: 'Count',    val: String(pass.dependencies?.length || 0), mono: true, copyable: false },
        ...(blockingDeps.length > 0
          ? [{ key: 'Blocking', val: blockingDeps.map((d) => d.passId).join(', '), mono: true, copyable: false, isRed: true }]
          : [{ key: 'Blocking', val: 'none', mono: true, copyable: false }]),
      ],
    },
    {
      label: 'Run',
      rows: [
        { key: 'Associated', val: pass.runId || 'none', mono: true, copyable: false },
      ],
    },
  ];

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'runs',    label: runs.length > 0 ? `Runs (${runs.length})` : 'Runs' },
  ];

  return (
    <div
      className="w-full lg:w-[268px] flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-[#1a1a1a] bg-[#0a0a0a] lg:overflow-hidden"
      data-testid="inspector-rail"
    >
      {/* Tab bar */}
      <div className="flex border-b border-[#1a1a1a] flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
            data-testid={`inspector-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="lg:flex-1 lg:overflow-auto" data-testid="inspector-content">

        {/* ── Details tab ── */}
        {activeTab === 'details' && (
          <div className="py-1" data-testid="inspector-details">
            {detailGroups.map(({ label, rows }) => (
              <div key={label} className="mb-0.5">
                <div className="px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.16em] text-slate-700 bg-[#0e0e0e]">
                  {label}
                </div>
                {rows.map(({ key, val, mono, copyable, isRed }) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 px-4 py-1.5 hover:bg-[#111111] transition-colors"
                  >
                    <span className="text-[10px] text-slate-700 w-[72px] flex-shrink-0 pt-px leading-snug">
                      {key}
                    </span>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span
                        className={`text-[11px] leading-snug break-all ${
                          mono ? 'font-mono' : ''
                        } ${isRed ? 'text-red-500' : 'text-slate-500'}`}
                      >
                        {val}
                      </span>
                      {copyable && (
                        <button
                          onClick={() => copyText(val)}
                          className="text-slate-700 hover:text-slate-400 transition-colors p-0.5 flex-shrink-0"
                          title="Copy"
                        >
                          <Copy size={9} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Copy context action */}
            <div className="px-4 py-3 mt-2 border-t border-[#161616]">
              <button
                onClick={() => copyText(buildCopyContext(pass, plan.planId))}
                className="flex items-center gap-1.5 text-[11px] text-slate-500 px-3 py-1.5 border border-[#222] rounded-sm hover:border-[#333] hover:text-slate-300 transition-colors w-full justify-center"
                data-testid="inspector-copy-context-btn"
              >
                <Copy size={9} />
                Copy pass context
              </button>
            </div>
          </div>
        )}

        {/* ── Runs tab ── */}
        {activeTab === 'runs' && (
          <div className="py-1" data-testid="inspector-runs">
            {runs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-[11px] text-slate-700">No runs for this pass</span>
              </div>
            ) : (
              runs.map((run) => (
                <div
                  key={run.runId}
                  className="px-4 py-3 border-b border-[#161616] last:border-b-0"
                  data-testid={`inspector-run-${run.runId}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        RUN_DOT[run.status] || 'bg-slate-700'
                      }`}
                    />
                    <span className="font-mono text-[10px] text-slate-500">{run.runId}</span>
                  </div>
                  {run.title && (
                    <div className="text-[11px] text-slate-500 leading-snug mb-0.5 line-clamp-2">
                      {run.title}
                    </div>
                  )}
                  <div className={`text-[10px] ${RUN_TEXT[run.status] || 'text-slate-700'}`}>
                    {run.stage} · {run.status.replace(/_/g, ' ')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PassDetailPage — main component
───────────────────────────────────────────────────── */
export default function PassDetailPage({
  pass,
  plan,
  allPasses,
  runs,
  sequence,
  totalPasses,
  onBack,
  onOpenRun,
  onCreateRun,
  onNavigateToDep,
}) {
  const navigate = useNavigate();

  const blockingDeps   = getBlockingDeps(pass, allPasses);
  const displayStatus  = pass.status === 'planned' && blockingDeps.length > 0 ? 'blocked' : pass.status;
  const displayCfg     = PASS_STATUS[displayStatus] || PASS_STATUS[pass.status] || PASS_STATUS.planned;

  const onBackToPlan = () => navigate(`/plans/${plan.planId}`);

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      data-testid="pass-detail-page"
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
        {/* Three-level breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap" data-testid="pass-breadcrumb">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            data-testid="back-to-plans-btn"
          >
            <ArrowLeft size={11} />
            Plans
          </button>
          <span className="text-slate-800 text-[11px]">·</span>
          <button
            onClick={onBackToPlan}
            className="text-[11px] text-slate-600 hover:text-slate-300 transition-colors truncate max-w-[200px]"
            data-testid="back-to-plan-breadcrumb"
          >
            {plan.title}
          </button>
          <span className="text-slate-800 text-[11px]">·</span>
          <span className="text-[11px] text-slate-600 truncate max-w-[180px]">
            {pass.name}
          </span>
        </div>

        {/* Pass name + status badge */}
        <div className="flex items-start gap-3 mb-2.5">
          <h1
            className="text-xl font-semibold text-slate-100 tracking-tight leading-snug"
            data-testid="pass-title"
          >
            {pass.name}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide whitespace-nowrap mt-0.5 flex-shrink-0 ${displayCfg.badgeCls}`}
            data-testid="pass-status-badge"
          >
            {displayCfg.label}
          </span>
        </div>

        {/* Compact metadata bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" data-testid="pass-meta-bar">
          <button
            onClick={() => copyText(pass.passId)}
            className="flex items-center gap-1 font-mono text-[11px] text-slate-600 hover:text-slate-400 transition-colors group"
            data-testid="pass-id-copy-btn"
            title="Copy pass ID"
          >
            <span data-testid="pass-id">{pass.passId}</span>
            <Copy size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
          <span className="text-slate-800 text-[10px]">·</span>
          <button
            onClick={() => copyText(plan.planId)}
            className="font-mono text-[11px] text-slate-600 hover:text-slate-400 transition-colors group flex items-center gap-1"
            data-testid="plan-id-copy-btn"
            title="Copy plan ID"
          >
            <span>{plan.planId}</span>
            <Copy size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="font-mono text-[11px] text-slate-600">
            {plan.repo} / {plan.branch}
          </span>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="font-mono text-[11px] text-slate-600" data-testid="pass-sequence">
            Pass {sequence} of {totalPasses}
          </span>
        </div>
      </div>

      {/* ── Two-column content ── */}
      <div
        className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden"
        data-testid="pass-detail-content"
      >
        {/* Main scrollable column */}
        <div className="w-full lg:flex-1 lg:overflow-auto min-w-0" data-testid="main-column">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
            <StateCard
              pass={pass}
              plan={plan}
              allPasses={allPasses}
              onCreateRun={onCreateRun}
              onOpenRun={onOpenRun}
              onNavigateToDep={onNavigateToDep}
              onBackToPlan={onBackToPlan}
            />
            <ParentPlanCard plan={plan} onBackToPlan={onBackToPlan} />
            <ExecutionContract pass={pass} />
            <DependenciesSection
              pass={pass}
              allPasses={allPasses}
              onNavigateToDep={onNavigateToDep}
            />
            <RunsSection
              pass={pass}
              runs={runs}
              allPasses={allPasses}
              onCreateRun={onCreateRun}
              onOpenRun={onOpenRun}
            />
          </div>
        </div>

        {/* Right inspector rail */}
        <Inspector
          pass={pass}
          plan={plan}
          allPasses={allPasses}
          runs={runs}
          sequence={sequence}
          totalPasses={totalPasses}
        />
      </div>
    </div>
  );
}
