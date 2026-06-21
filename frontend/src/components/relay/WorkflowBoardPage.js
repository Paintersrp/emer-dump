import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  ChevronRight,
  Copy,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  ExternalLink,
  Check,
  Loader2,
  FileText,
  Circle,
  Minus,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Shared mini-screen primitives
───────────────────────────────────────────────────── */

function MiniNav({ activePage = 'plans', showNewPlanPrimary = false, showNewRunSecondary = false }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#222] flex-shrink-0" style={{ background: '#0e0e0e' }}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-100">Relay</span>
        <span className="text-slate-700 text-[8px]">·</span>
        <span className="text-[8px] font-mono text-slate-600">v1.0.4</span>
      </div>
      <div className="flex items-center gap-1.5">
        {showNewPlanPrimary && (
          <span className="text-[8px] px-2 py-0.5 rounded-sm bg-blue-600 text-white flex items-center gap-0.5">
            <Plus size={7} />New Plan
          </span>
        )}
        {showNewRunSecondary && (
          <span className="text-[8px] text-slate-400 px-2 py-0.5 border border-[#2a2a2a] rounded-sm flex items-center gap-0.5">
            <Plus size={7} />New Run
          </span>
        )}
        <span className={`text-[9px] px-2 py-0.5 border rounded-sm cursor-default ${activePage === 'plans' ? 'border-[#3a3a3a] text-slate-200' : 'border-[#252525] text-slate-500'}`}>Plans</span>
        <span className={`text-[9px] px-2 py-0.5 border rounded-sm cursor-default ${activePage === 'runs' ? 'border-[#3a3a3a] text-slate-200' : 'border-[#252525] text-slate-500'}`}>Runs</span>
      </div>
    </div>
  );
}

function MiniBadge({ label, variant = 'blue' }) {
  const v = {
    blue:   'bg-blue-500/15 text-blue-400 border-blue-600/30',
    amber:  'bg-amber-500/15 text-amber-400 border-amber-600/30',
    emerald:'bg-emerald-500/15 text-emerald-400 border-emerald-600/30',
    red:    'bg-red-500/15 text-red-400 border-red-600/30',
    cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-600/30',
    slate:  'bg-slate-500/10 text-slate-500 border-slate-700/30',
  }[variant] || 'bg-slate-500/10 text-slate-500 border-slate-700/30';
  return (
    <span className={`text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-sm border ${v}`}>
      {label}
    </span>
  );
}

function MiniStateCard({ eyebrow, eyebrowCls, accentCls, title, message, children }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-[#1e1e1e] bg-[#111111]">
      <div className={`absolute inset-y-0 left-0 w-[2px] ${accentCls}`} />
      <div className="pl-3 pr-3 py-2.5">
        <p className={`text-[8px] font-mono font-semibold tracking-widest ${eyebrowCls}`}>{eyebrow}</p>
        <p className="text-[11px] font-medium text-slate-100 mt-0.5 leading-tight">{title}</p>
        {message && <p className="text-[9px] text-slate-500 mt-1 leading-snug">{message}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

function MiniSegBar({ completed, total }) {
  const segs = 8;
  const filled = total > 0 ? Math.round((completed / total) * segs) : 0;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} className={`h-1 rounded-sm flex-1 ${i < filled ? 'bg-blue-500/60' : 'bg-slate-800'}`} />
      ))}
    </div>
  );
}

function MiniPassRow({ seq, name, passId, status = 'planned', deps = [], actionLabel, actionVariant = 'default' }) {
  const sc = {
    completed:   { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 border border-emerald-800/30', label: 'Completed', accent: 'bg-emerald-800/40' },
    in_progress: { dot: 'bg-blue-400 animate-pulse', badge: 'bg-blue-500/10 text-blue-400 border border-blue-600/30', label: 'In Progress', accent: 'bg-blue-500' },
    planned:     { dot: 'bg-slate-700', badge: 'bg-slate-500/10 text-slate-500 border border-slate-700/30', label: 'Planned', accent: '' },
  }[status] || { dot: 'bg-slate-700', badge: 'bg-slate-500/10 text-slate-500 border border-slate-700/30', label: status, accent: '' };

  const actCls = {
    primary: 'bg-blue-950/30 text-blue-400 border-blue-700/40',
    muted:   'text-slate-600 border-[#1e1e1e]',
    action:  'text-slate-400 border-[#2a2a2a]',
    default: 'text-slate-600 border-[#191919]',
  }[actionVariant] || 'text-slate-600 border-[#191919]';

  return (
    <div className={`relative border-b border-[#161616] last:border-b-0 ${status === 'in_progress' ? 'bg-[#0c1118]' : ''}`}>
      {sc.accent && <div className={`absolute inset-y-0 left-0 w-[2px] ${sc.accent}`} />}
      <div className="flex items-start justify-between gap-2 py-1.5 pl-4 pr-2.5">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          <div className="flex flex-col items-center gap-1 pt-px flex-shrink-0" style={{ width: '14px' }}>
            <span className="text-[7px] text-slate-700 leading-none font-mono">{seq}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-300 leading-snug truncate pr-1">{name}</p>
            <p className="text-[7px] font-mono text-slate-600 mt-0.5">{passId}</p>
            {deps.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {deps.map((d) => (
                  <span key={d.id} className={`text-[7px] px-1 py-px rounded-sm border ${d.blocking ? 'bg-red-500/10 text-red-400 border-red-700/30' : 'bg-slate-500/10 text-slate-600 border-slate-700/30'}`}>
                    {d.blocking ? '⊘ ' : '✓ '}{d.id}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-[7px] px-1 py-px rounded-sm border ${sc.badge}`}>{sc.label}</span>
          {actionLabel && (
            <span className={`text-[7px] px-1.5 py-px rounded-sm border ${actCls}`}>{actionLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStageTabs({ active }) {
  const tabs = ['Intake', 'Compile/Render', 'Execute', 'Audit'];
  return (
    <div className="flex items-center border-b border-[#1e1e1e]">
      {tabs.map((t) => (
        <span key={t} className={`px-3 py-1.5 text-[8px] font-medium border-b-2 ${t === active ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600'}`}>
          {t}
        </span>
      ))}
    </div>
  );
}

function MiniRunHeader({ title, statusLabel, statusVariant = 'amber', meta, breadcrumbs = [], showPlanCtx = false, planCtx = null }) {
  const bv = {
    amber:  'bg-amber-500/10 text-amber-400 border-amber-700/40',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-700/40',
    cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-700/40',
    slate:  'bg-slate-500/10 text-slate-500 border-slate-700/40',
  }[statusVariant] || 'bg-amber-500/10 text-amber-400 border-amber-700/40';

  return (
    <div className="px-3 pt-2.5 pb-0 border-b border-[#1e1e1e] flex-shrink-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[8px] text-slate-600 flex items-center gap-1"><ArrowLeft size={8} />Runs</span>
        <span className="text-slate-700 text-[8px]">·</span>
        <span className="text-[10px] font-medium text-slate-200 truncate">{title}</span>
        <span className={`text-[8px] font-mono px-1.5 py-px rounded-sm border flex-shrink-0 ${bv}`}>{statusLabel}</span>
      </div>
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 mb-1.5 text-[7px] font-mono text-slate-700">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-800">·</span>}
              <span>{b}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      {showPlanCtx && planCtx && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-slate-700">Plan Context</span>
          <span className="inline-flex items-center gap-1.5 text-[8px] border border-[#252525] bg-[#101010] px-2 py-0.5 rounded-sm">
            <span className="text-[7px] uppercase text-slate-700">Plan</span>
            <span className="text-slate-300">{planCtx.planTitle}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[8px] border border-[#252525] bg-[#101010] px-2 py-0.5 rounded-sm">
            <span className="text-[7px] uppercase text-slate-700">Pass</span>
            <span className="text-slate-300">{planCtx.passName}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function MiniSectionLabel({ children }) {
  return <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-600 mb-1.5">{children}</p>;
}

function MiniKeyValue({ label, value, valueCls = 'text-slate-400', mono = true }) {
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="text-[8px] text-slate-600 w-16 flex-shrink-0">{label}</span>
      <span className={`text-[9px] ${mono ? 'font-mono' : ''} ${valueCls} truncate`}>{value}</span>
    </div>
  );
}

function MiniButton({ label, variant = 'primary', icon = null }) {
  const cls = {
    primary:   'bg-blue-600 text-white border-blue-700',
    secondary: 'bg-transparent text-slate-300 border-[#2a2a2a] hover:border-[#3a3a3a]',
    amber:     'bg-amber-500/10 text-amber-400 border-amber-600/30',
    ghost:     'bg-transparent text-slate-500 border-[#1e1e1e]',
    emerald:   'bg-emerald-600/10 text-emerald-400 border-emerald-700/30',
  }[variant] || 'bg-blue-600 text-white border-blue-700';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-2.5 py-1 rounded-sm border ${cls}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 1 — Plans Registry with active plans
───────────────────────────────────────────────────── */
function Screen1() {
  const filters = [
    { label: 'All', count: 8, active: true },
    { label: 'Active', count: 3 },
    { label: 'Completion Ready', count: 1 },
    { label: 'Needs Attention', count: 4 },
    { label: 'Complete', count: 2 },
    { label: 'Abandoned', count: 2 },
  ];

  const rows = [
    {
      planId: 'plan-8', title: 'Relay Run State Registry and Breadcrumb Nav',
      repo: 'relay', branch: 'feature/nav',
      status: 'active', statusV: 'blue',
      total: 3, done: 1,
      currentPass: 'pass-2 · Implement runs list…',
      updated: '5h ago', attLabel: 'Next pass ready', attV: 'blue',
    },
    {
      planId: 'plan-7', title: 'Relay Async Executor Dispatch + Audit Integration',
      repo: 'relay', branch: 'main',
      status: 'active', statusV: 'blue',
      total: 7, done: 3,
      currentPass: 'pass-4 · Wire executor dispatch…',
      updated: '2h ago', attLabel: 'Next pass ready', attV: 'blue',
    },
    {
      planId: 'plan-6', title: 'Relay Run Pipeline End-to-End Validation Suite',
      repo: 'relay', branch: 'feat/api',
      status: 'active', statusV: 'blue',
      total: 6, done: 4,
      currentPass: 'pass-5 · Update run state…',
      updated: '1d ago', attLabel: 'In progress', attV: 'blue',
    },
    {
      planId: 'plan-5', title: 'Planner Handoff Schema + MCP Action Registration',
      repo: 'relay/mcp', branch: 'feat/planner-schema',
      status: 'completion_ready', statusV: 'amber',
      total: 5, done: 5,
      currentPass: '—',
      updated: '3d ago', attLabel: 'Completion ready', attV: 'amber',
    },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" showNewPlanPrimary />

      {/* Page header */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <h1 className="text-[13px] font-semibold text-slate-100">Plans</h1>
        <p className="text-[9px] text-slate-600 mt-0.5">Managed multi-pass orchestration plans</p>
        <p className="text-[8px] text-slate-700 mt-1 font-mono">8 plans · 4 need attention ⚠</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 border-b border-[#1a1a1a] px-3 flex-shrink-0 overflow-x-auto">
        {filters.map(f => (
          <div key={f.label} className={`flex items-center gap-1 px-2 py-1.5 border-b-2 whitespace-nowrap ${f.active ? 'border-blue-500' : 'border-transparent'}`}>
            <span className={`text-[8px] font-medium ${f.active ? 'text-blue-400' : 'text-slate-600'}`}>{f.label}</span>
            <span className={`text-[7px] font-mono px-1 py-px rounded-sm ${f.active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/80 text-slate-600'}`}>{f.count}</span>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div className="grid border-b border-[#1a1a1a] px-3 py-1.5 flex-shrink-0" style={{ gridTemplateColumns: '1fr 60px 70px 80px 45px 55px 12px' }}>
        {['Plan', 'Status', 'Progress', 'Current Pass', 'Updated', 'Attention', ''].map(h => (
          <span key={h} className="text-[7px] uppercase tracking-wide text-slate-700 font-semibold">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-hidden">
        {rows.map((r, i) => {
          const segs = 8;
          const filled = Math.round((r.done / r.total) * segs);
          const isAtt = r.attLabel !== undefined;
          return (
            <div key={r.planId} className="grid items-center border-b border-[#141414] px-3 py-1.5 hover:bg-[#111] transition-colors" style={{ gridTemplateColumns: '1fr 60px 70px 80px 45px 55px 12px' }}>
              {/* Plan */}
              <div className="min-w-0 pr-2">
                <p className={`text-[9px] font-medium truncate ${isAtt ? 'text-slate-200' : 'text-slate-500'}`}>{r.title}</p>
                <p className="text-[7px] font-mono text-slate-700 mt-0.5">{r.planId} · {r.repo} · {r.branch}</p>
              </div>
              {/* Status */}
              <MiniBadge label={r.status === 'active' ? 'Active' : 'Completion Ready'} variant={r.statusV} />
              {/* Progress */}
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: segs }).map((_, si) => (
                    <div key={si} className={`h-0.5 flex-1 rounded-sm ${si < filled ? 'bg-blue-500/60' : 'bg-slate-800'}`} />
                  ))}
                </div>
                <span className="text-[7px] font-mono text-slate-700">{r.done}/{r.total}</span>
              </div>
              {/* Current pass */}
              <p className="text-[8px] text-slate-500 truncate pr-1">{r.currentPass}</p>
              {/* Updated */}
              <span className="text-[8px] text-slate-700">{r.updated}</span>
              {/* Attention */}
              <MiniBadge label={r.attLabel} variant={r.attV} />
              {/* Chevron */}
              <ChevronRight size={8} className="text-slate-700" />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#1a1a1a] flex-shrink-0">
        <span className="text-[7px] font-mono text-slate-700">8 plans · Showing 4 of 8</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 2 — New Plan: JSON pasted, not validated
───────────────────────────────────────────────────── */
function Screen2() {
  const jsonSnippet = `{
  "planId": "plan-9a3f",
  "title": "Relay Route Patcher Service
    + Audit Pipeline",
  "goal": "Add managed plan context
    to all run stage pages and
    integrate audit hook.",
  "repo": "relay",
  "branch": "feat/plan-ctx",
  "passes": [
    {
      "passId": "pass-001",
      "name": "Extract route registry
        logic",
      "goal": "Isolate route config",
      "dependencies": []
    },
    {
      "passId": "pass-002",
      "name": "Add audit pipeline hook",
      "dependencies": ["pass-001"]
    },
    ...
  ]
}`;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      {/* Breadcrumb + title */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />Plans</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500">New Plan</span>
          <MiniBadge label="Draft" variant="slate" />
        </div>
        <h1 className="text-[12px] font-semibold text-slate-100">New Plan</h1>
        <p className="text-[9px] text-slate-500 mt-0.5">Submit a reviewed Plan of Passes JSON artifact</p>
      </div>

      {/* Notice bar */}
      <div className="flex items-start gap-1.5 mx-3 mt-2 px-2 py-1.5 border-l-2 border-amber-500/60 bg-amber-500/5 rounded-sm flex-shrink-0">
        <TriangleAlert size={9} className="text-amber-500 flex-shrink-0 mt-px" />
        <p className="text-[8px] text-amber-400/80 leading-snug">Submitting creates plan and pass records only. No runs are created. No executor is dispatched.</p>
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-1 min-h-0 mt-2 gap-2 px-3 pb-3">
        {/* Left: JSON textarea */}
        <div className="flex flex-col" style={{ width: '190px', flexShrink: 0 }}>
          <MiniSectionLabel>Plan JSON</MiniSectionLabel>
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 rounded-sm border border-[#222] bg-[#0c0c0c] overflow-hidden">
              <pre className="p-2 text-[7px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">{jsonSnippet}</pre>
            </div>
          </div>
          {/* Microbar */}
          <div className="flex items-center justify-between mt-1.5 px-0.5">
            <span className="text-[7px] font-mono text-slate-700">1,847 chars · JSON</span>
          </div>
          {/* Actions */}
          <div className="flex gap-1.5 mt-1.5">
            <MiniButton label="Validate Plan" variant="secondary" />
            <MiniButton label="Clear" variant="ghost" />
          </div>
        </div>

        {/* Right: draft state */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <MiniSectionLabel>Inspection</MiniSectionLabel>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-[#222] rounded-sm p-4">
            <FileText size={16} className="text-slate-700 mb-2" />
            <p className="text-[9px] text-slate-600">Run validation to inspect and submit this plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 3 — New Plan: validated, extracted preview
───────────────────────────────────────────────────── */
function Screen3() {
  const passes = [
    { seq: 1, id: 'pass-001', name: 'Extract route registry logic', deps: '—' },
    { seq: 2, id: 'pass-002', name: 'Add audit pipeline hook', deps: 'pass-001' },
    { seq: 3, id: 'pass-003', name: 'Integrate plan context to run stages', deps: 'pass-001, pass-002' },
    { seq: 4, id: 'pass-004', name: 'Integration test and validation', deps: 'pass-003' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      {/* Header */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />Plans</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500">New Plan</span>
          <MiniBadge label="Validated" variant="emerald" />
        </div>
        <h1 className="text-[12px] font-semibold text-slate-100">New Plan</h1>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-1.5 mx-3 mt-2 px-2 py-1.5 border-l-2 border-amber-500/60 bg-amber-500/5 rounded-sm flex-shrink-0">
        <TriangleAlert size={9} className="text-amber-500 flex-shrink-0 mt-px" />
        <p className="text-[8px] text-amber-400/80 leading-snug">Submitting creates plan and pass records only. No runs are created. No executor is dispatched.</p>
      </div>

      {/* Two pane */}
      <div className="flex flex-1 min-h-0 mt-2 gap-2 px-3 pb-3">
        {/* Left: JSON (validated state) */}
        <div className="flex flex-col" style={{ width: '140px', flexShrink: 0 }}>
          <MiniSectionLabel>Plan JSON</MiniSectionLabel>
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 rounded-sm border border-[#1a1a1a] bg-[#0c0c0c] overflow-hidden opacity-60">
              <pre className="p-2 text-[6.5px] font-mono text-slate-500 leading-relaxed">{`{
  "planId": "plan-9a3f",
  "title": "Relay Route
    Patcher…",
  "passes": [
    { "passId":"pass-001",
      "name": "Extract…" },
    { "passId":"pass-002",
      "name": "Add audit…",
      "deps":["pass-001"]},
    …
  ]
}`}</pre>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 px-0.5">
            <Check size={9} className="text-emerald-500" />
            <span className="text-[7px] font-mono text-emerald-600">Validated</span>
          </div>
          <div className="mt-1.5">
            <MiniButton label="Submit Reviewed Plan" variant="primary" />
          </div>
        </div>

        {/* Right: validated content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[8px] font-medium text-emerald-400">Plan JSON is valid</p>
          </div>

          {/* Plan preview table */}
          <div className="border border-[#1e1e1e] rounded-sm bg-[#111111] mb-2 flex-shrink-0">
            {[
              { l: 'Title', v: 'Relay Route Patcher + Audit Pipeline', mono: false, vc: 'text-slate-200' },
              { l: 'Plan ID', v: 'plan-9a3f', mono: true, vc: 'text-blue-400' },
              { l: 'Repo', v: 'relay · feat/plan-ctx', mono: true, vc: 'text-slate-400' },
              { l: 'Passes', v: '4 passes', mono: false, vc: 'text-slate-300' },
            ].map(row => (
              <div key={row.l} className="flex items-start gap-2 px-2 py-1 border-b border-[#161616] last:border-b-0">
                <span className="text-[7px] text-slate-600 w-10 flex-shrink-0">{row.l}</span>
                <span className={`text-[8px] ${row.mono ? 'font-mono' : ''} ${row.vc} truncate`}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Derived pass list */}
          <MiniSectionLabel>Derived Passes</MiniSectionLabel>
          <div className="flex-1 overflow-hidden border border-[#1e1e1e] rounded-sm">
            {passes.map(p => (
              <div key={p.id} className="flex items-start justify-between gap-1 px-2 py-1 border-b border-[#161616] last:border-b-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-mono text-slate-700 flex-shrink-0">{p.seq}</span>
                    <span className="text-[8px] text-slate-300 truncate">{p.name}</span>
                  </div>
                  <span className="text-[7px] text-slate-700 ml-3 font-mono">deps: {p.deps}</span>
                </div>
                <MiniBadge label="Planned" variant="slate" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 4 — Plan Detail: after submission, all passes planned
───────────────────────────────────────────────────── */
function Screen4() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      {/* Header */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />Plans</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500 truncate">Relay Route Patcher + Audit Pipeline</span>
          <MiniBadge label="Active" variant="blue" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[7px] font-mono text-slate-700">plan-9a3f</span>
          <span className="text-slate-800 text-[7px]">·</span>
          <span className="text-[7px] font-mono text-slate-700">relay · feat/plan-ctx</span>
        </div>
      </div>

      {/* State card */}
      <div className="px-3 mt-2 flex-shrink-0">
        <MiniStateCard
          eyebrow="PLAN ACTIVE"
          eyebrowCls="text-blue-400"
          accentCls="bg-blue-500"
          title="No runs yet — start with pass 1"
          message="Goal: Add managed plan context to all run stage pages and integrate audit hook."
        >
          <div className="flex gap-1.5 mt-1">
            <MiniButton label="Copy context" variant="ghost" />
            <MiniButton label="Open pass 1" variant="secondary" icon={<ExternalLink size={8} />} />
          </div>
        </MiniStateCard>
      </div>

      {/* Progress */}
      <div className="px-3 mt-2 flex-shrink-0">
        <MiniSegBar completed={0} total={4} />
        <p className="text-[7px] font-mono text-slate-700 mt-1">4 passes · 0 completed · 0 in progress · 4 planned</p>
      </div>

      {/* Pass timeline */}
      <div className="flex-1 overflow-hidden mx-3 mt-2 border border-[#1a1a1a] rounded-sm">
        <MiniPassRow seq={1} name="Extract route registry logic" passId="pass-001" status="planned" deps={[]} actionLabel="Create run" actionVariant="action" />
        <MiniPassRow seq={2} name="Add audit pipeline hook" passId="pass-002" status="planned" deps={[{ id: 'pass-001', blocking: true }]} actionLabel="Waiting" actionVariant="default" />
        <MiniPassRow seq={3} name="Integrate plan context to run stages" passId="pass-003" status="planned" deps={[{ id: 'pass-001', blocking: true }, { id: 'pass-002', blocking: true }]} actionLabel="Waiting" actionVariant="default" />
        <MiniPassRow seq={4} name="Integration test and validation" passId="pass-004" status="planned" deps={[{ id: 'pass-003', blocking: true }]} actionLabel="Waiting" actionVariant="default" />
      </div>

      <div className="px-3 py-2 flex-shrink-0">
        <span className="text-[7px] font-mono text-slate-700">plan-9a3f · Updated just now</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 5 — Pass Detail: dependency-satisfied, ready
───────────────────────────────────────────────────── */
function Screen5() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      {/* Header */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />plan-9a3f</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500">pass-001</span>
          <MiniBadge label="Ready" variant="amber" />
        </div>
        <h1 className="text-[12px] font-semibold text-slate-100">Extract route registry logic</h1>
        <p className="text-[8px] font-mono text-slate-700 mt-0.5">Pass 1 of 4 · plan-9a3f · feat/plan-ctx</p>
      </div>

      {/* State card */}
      <div className="px-3 mt-2 flex-shrink-0">
        <MiniStateCard
          eyebrow="PASS READY"
          eyebrowCls="text-amber-400"
          accentCls="bg-amber-400"
          title="Ready for run creation"
          message="This pass can be used to create a pass-associated Relay run. All dependencies satisfied."
        >
          <div className="flex gap-1.5 mt-1.5">
            <MiniButton label="Copy context" variant="ghost" />
            <MiniButton label="Create Run" variant="primary" icon={<Plus size={8} />} />
          </div>
        </MiniStateCard>
      </div>

      {/* Pass details */}
      <div className="px-3 mt-2.5 flex-shrink-0">
        <MiniSectionLabel>Pass Details</MiniSectionLabel>
        <div className="border border-[#1a1a1a] rounded-sm bg-[#111111]">
          <MiniKeyValue label="Goal" value="Isolate route config module with clean interfaces" mono={false} valueCls="text-slate-300" />
          <MiniKeyValue label="Scope" value="backend/routes/registry.py, backend/routes/__init__.py" />
          <MiniKeyValue label="Plan" value="plan-9a3f · Relay Route Patcher + Audit Pipeline" valueCls="text-slate-300" />
        </div>
      </div>

      {/* Dependencies */}
      <div className="px-3 mt-2.5 flex-shrink-0">
        <MiniSectionLabel>Dependencies</MiniSectionLabel>
        <div className="flex items-center gap-1.5 px-2 py-1.5 border border-[#1a1a1a] rounded-sm bg-[#111111]">
          <Check size={9} className="text-emerald-500" />
          <span className="text-[9px] text-slate-500">No dependencies — this pass is unblocked.</span>
        </div>
      </div>

      {/* Runs */}
      <div className="px-3 mt-2.5 flex-1">
        <MiniSectionLabel>Runs for this Pass</MiniSectionLabel>
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#1a1a1a] rounded-sm py-3 text-center">
          <p className="text-[9px] text-slate-600">No runs yet.</p>
          <MiniButton label="+ Create Run" variant="secondary" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 6 — New Run: planId/passId association prefilled
───────────────────────────────────────────────────── */
function Screen6() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="runs" showNewRunSecondary />

      {/* Run header */}
      <MiniRunHeader
        title="New Run"
        statusLabel="Pass Context"
        statusVariant="slate"
        breadcrumbs={['runs', 'new', 'plan-9a3f', 'pass-001']}
        showPlanCtx
        planCtx={{ planTitle: 'Relay Route Patcher + Audit Pipeline', passName: 'Pass 1 · Extract route registry logic' }}
      />

      <MiniStageTabs active="Intake" />

      {/* Intake content */}
      <div className="flex-1 overflow-hidden px-3 pt-2.5 pb-2 flex flex-col gap-2">
        <div>
          <h2 className="text-[11px] font-medium text-slate-200">New Run</h2>
          <p className="text-[8px] text-slate-500 mt-0.5">Create a standalone Relay run or associate it with a managed plan and pass.</p>
        </div>

        {/* Association section */}
        <div>
          <MiniSectionLabel>Plan Association</MiniSectionLabel>
          <div className="border border-[#1e2733] bg-[#0d1014] rounded-sm overflow-hidden">
            {[
              { label: 'PLAN', value: 'Relay Route Patcher + Audit Pipeline', id: 'plan-9a3f', ok: true },
              { label: 'PASS', value: 'Extract route registry logic', id: 'pass-001', ok: true },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2 px-2 py-1.5 border-b border-[#1d2430] last:border-b-0">
                <span className="text-[7px] font-semibold uppercase tracking-wide text-cyan-400/70 w-8 flex-shrink-0">{row.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-slate-200 truncate">{row.value}</p>
                  <p className="text-[7px] font-mono text-slate-600">{row.id}</p>
                </div>
                {row.ok && <Check size={9} className="text-emerald-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Readiness */}
        <div>
          <MiniSectionLabel>Preflight</MiniSectionLabel>
          <div className="border border-[#1a1a1a] rounded-sm bg-[#111111] overflow-hidden">
            {[
              { label: 'Repo reachable', status: 'ok' },
              { label: 'Branch exists', status: 'ok' },
              { label: 'No uncommitted changes', status: 'warn' },
              { label: 'Validation commands extractable', status: 'ok' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2 px-2 py-1 border-b border-[#161616] last:border-b-0">
                {c.status === 'ok' && <Check size={8} className="text-emerald-500 flex-shrink-0" />}
                {c.status === 'warn' && <TriangleAlert size={8} className="text-amber-500 flex-shrink-0" />}
                <span className="text-[8px] text-slate-400">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <MiniButton label="Create Run" variant="primary" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 7 — Run Workbench: plan/pass context visible
───────────────────────────────────────────────────── */
function Screen7() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="runs" />

      <MiniRunHeader
        title="Relay Route Patcher — pass-001"
        statusLabel="Running"
        statusVariant="blue"
        breadcrumbs={['run-9010', 'packet-9010', 'relay', 'feat/plan-ctx']}
        showPlanCtx
        planCtx={{ planTitle: 'Relay Route Patcher + Audit Pipeline', passName: 'Pass 1 · Extract route registry logic' }}
      />

      <MiniStageTabs active="Execute" />

      <div className="flex-1 overflow-hidden px-3 pt-2.5 pb-2 flex flex-col gap-2">
        {/* State card */}
        <MiniStateCard
          eyebrow="EXECUTION RUNNING"
          eyebrowCls="text-blue-400"
          accentCls="bg-blue-500"
          title="Executor is active — awaiting result"
          message="opencode_go · deepseek-v4-flash · relay · feat/plan-ctx"
        >
          <MiniButton label="View logs" variant="ghost" />
        </MiniStateCard>

        {/* Execution pipeline */}
        <div>
          <MiniSectionLabel>Execution Pipeline</MiniSectionLabel>
          <div className="border border-[#1a1a1a] rounded-sm bg-[#111111] overflow-hidden">
            {[
              { label: 'Brief approved',      icon: 'check',   cls: 'text-emerald-500' },
              { label: 'Executor dispatched',  icon: 'check',   cls: 'text-emerald-500' },
              { label: 'Execution running',    icon: 'running', cls: 'text-blue-400' },
              { label: 'Result captured',      icon: 'circle',  cls: 'text-slate-700' },
              { label: 'Audit ready',          icon: 'circle',  cls: 'text-slate-700' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1.5 border-b border-[#161616] last:border-b-0 ${s.icon === 'running' ? 'bg-blue-950/20' : ''}`}>
                {s.icon === 'check'   && <Check size={9} className={s.cls} />}
                {s.icon === 'running' && <Loader2 size={9} className={`${s.cls} animate-spin`} />}
                {s.icon === 'circle'  && <Circle size={9} className={s.cls} />}
                <span className={`text-[8px] ${s.icon === 'running' ? 'text-blue-300 font-medium' : 'text-slate-500'}`}>{s.label}</span>
                {s.icon === 'running' && <span className="text-[7px] font-mono text-blue-500 ml-auto">active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent logs preview */}
        <div className="flex-1">
          <MiniSectionLabel>Activity</MiniSectionLabel>
          <div className="border border-[#1a1a1a] rounded-sm bg-[#0c0c0c] overflow-hidden">
            {[
              { t: '14:22:01', m: 'Intake approved — proceeding', l: 'info' },
              { t: '14:22:15', m: 'Brief compiled and validated', l: 'info' },
              { t: '14:22:16', m: 'Executor dispatched: opencode_go', l: 'info' },
              { t: '14:22:40', m: 'Execution started on branch feat/plan-ctx', l: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-1.5 px-2 py-0.5 border-b border-[#141414] last:border-b-0">
                <span className="text-[7px] font-mono text-slate-700 flex-shrink-0">{log.t}</span>
                <span className="text-[7px] text-slate-500 leading-snug">{log.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 8 — Audit acceptance completing the pass
───────────────────────────────────────────────────── */
function Screen8() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="runs" />

      <MiniRunHeader
        title="Relay Route Patcher — pass-001"
        statusLabel="Audit Ready"
        statusVariant="cyan"
        breadcrumbs={['run-9010', 'packet-9010', 'relay', 'feat/plan-ctx']}
        showPlanCtx
        planCtx={{ planTitle: 'Relay Route Patcher + Audit Pipeline', passName: 'Pass 1 · Extract route registry logic' }}
      />

      <MiniStageTabs active="Audit" />

      <div className="flex-1 overflow-hidden px-3 pt-2.5 pb-2 flex flex-col gap-2">
        {/* Audit state card */}
        <MiniStateCard
          eyebrow="AUDIT READY"
          eyebrowCls="text-cyan-400"
          accentCls="bg-cyan-500"
          title="Awaiting audit decision"
          message="Executor result captured. Validation passed. Scope checks complete."
        >
          {/* Decision buttons */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <MiniButton label="Accept" variant="emerald" />
            <MiniButton label="Accept with warning" variant="ghost" />
            <MiniButton label="Request revision" variant="ghost" />
            <MiniButton label="Reject" variant="ghost" />
          </div>
        </MiniStateCard>

        {/* Evidence summary */}
        <div>
          <MiniSectionLabel>Evidence Summary</MiniSectionLabel>
          <div className="border border-[#1a1a1a] rounded-sm bg-[#111111] overflow-hidden">
            {[
              { label: 'Executor result', value: 'Exit 0 · runs/9010/executor_result.json', status: 'ok' },
              { label: 'Validation',      value: 'Passed · runs/9010/validation_report.json', status: 'ok' },
              { label: 'Changed files',   value: '3 files · +47 / −12', status: 'ok' },
              { label: 'Scope',           value: 'In scope — all changes within boundary', status: 'ok' },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-2 px-2 py-1.5 border-b border-[#161616] last:border-b-0">
                <span className="text-[8px] text-slate-600 w-20 flex-shrink-0">{row.label}</span>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <Check size={7} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-[8px] text-slate-400 truncate">{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit pipeline */}
        <div className="flex-1">
          <MiniSectionLabel>Audit Pipeline</MiniSectionLabel>
          <div className="border border-[#1a1a1a] rounded-sm bg-[#111111] overflow-hidden">
            {[
              { label: 'Executor result captured', done: true },
              { label: 'Validation reviewed',       done: true },
              { label: 'Scope reviewed',            done: true },
              { label: 'Evidence reviewed',         done: true },
              { label: 'Audit decision',            done: false, active: true },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1 border-b border-[#161616] last:border-b-0 ${s.active ? 'bg-cyan-950/20' : ''}`}>
                {s.done ? <Check size={8} className="text-emerald-500" /> : <Circle size={8} className="text-cyan-500" />}
                <span className={`text-[8px] ${s.active ? 'text-cyan-300' : s.done ? 'text-slate-500' : 'text-slate-600'}`}>{s.label}</span>
                {s.active && <span className="text-[7px] font-mono text-cyan-500 ml-auto">pending</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 9 — Plan Detail: updated pass progress
───────────────────────────────────────────────────── */
function Screen9() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />Plans</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500 truncate">Relay Route Patcher + Audit Pipeline</span>
          <MiniBadge label="Active" variant="blue" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[7px] font-mono text-slate-700">plan-9a3f · relay · feat/plan-ctx</span>
        </div>
      </div>

      {/* State card */}
      <div className="px-3 mt-2 flex-shrink-0">
        <MiniStateCard
          eyebrow="PLAN ACTIVE"
          eyebrowCls="text-blue-400"
          accentCls="bg-blue-500"
          title="Current: pass-002 · Add audit pipeline hook"
          message="1 pass completed · run-9010 accepted"
        >
          <div className="flex gap-1.5 mt-1">
            <MiniButton label="Copy context" variant="ghost" />
            <MiniButton label="Open current pass" variant="secondary" icon={<ExternalLink size={8} />} />
          </div>
        </MiniStateCard>
      </div>

      {/* Progress */}
      <div className="px-3 mt-2 flex-shrink-0">
        <div className="flex gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-1 rounded-sm flex-1 ${i < 2 ? 'bg-emerald-500/60' : i < 4 ? 'bg-blue-500/60' : 'bg-slate-800'}`} />
          ))}
        </div>
        <p className="text-[7px] font-mono text-slate-700 mt-1">4 passes · 1 completed · 1 in progress · 2 planned</p>
      </div>

      {/* Pass timeline */}
      <div className="flex-1 overflow-hidden mx-3 mt-2 border border-[#1a1a1a] rounded-sm">
        <MiniPassRow seq={1} name="Extract route registry logic" passId="pass-001" status="completed" deps={[]} actionLabel="View" actionVariant="muted" />
        <MiniPassRow seq={2} name="Add audit pipeline hook" passId="pass-002" status="in_progress" deps={[{ id: 'pass-001', blocking: false }]} actionLabel="Open" actionVariant="primary" />
        <MiniPassRow seq={3} name="Integrate plan context to run stages" passId="pass-003" status="planned" deps={[{ id: 'pass-001', blocking: false }, { id: 'pass-002', blocking: true }]} actionLabel="Waiting" actionVariant="default" />
        <MiniPassRow seq={4} name="Integration test and validation" passId="pass-004" status="planned" deps={[{ id: 'pass-003', blocking: true }]} actionLabel="Waiting" actionVariant="default" />
      </div>

      <div className="px-3 py-2 flex-shrink-0">
        <span className="text-[7px] font-mono text-slate-700">Updated 8 minutes ago</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Screen 10 — Plan Detail: completion-ready state
───────────────────────────────────────────────────── */
function Screen10() {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0e0e0e' }}>
      <MiniNav activePage="plans" />

      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[8px] text-slate-600 flex items-center gap-0.5"><ArrowLeft size={8} />Plans</span>
          <span className="text-slate-700 text-[8px]">·</span>
          <span className="text-[8px] text-slate-500 truncate">Relay Route Patcher + Audit Pipeline</span>
          <MiniBadge label="Completion Ready" variant="amber" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[7px] font-mono text-slate-700">plan-9a3f · relay · feat/plan-ctx</span>
        </div>
      </div>

      {/* State card */}
      <div className="px-3 mt-2 flex-shrink-0">
        <MiniStateCard
          eyebrow="COMPLETION READY"
          eyebrowCls="text-amber-400"
          accentCls="bg-amber-400"
          title="All 4 passes accepted — ready to mark plan complete"
          message="All required passes have been accepted and run outcomes confirmed."
        >
          <div className="flex gap-1.5 mt-1.5">
            <MiniButton label="Complete Plan" variant="amber" icon={<CheckCircle2 size={8} />} />
          </div>
        </MiniStateCard>
      </div>

      {/* Progress */}
      <div className="px-3 mt-2 flex-shrink-0">
        <div className="flex gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-1 rounded-sm flex-1 bg-emerald-500/60" />
          ))}
        </div>
        <p className="text-[7px] font-mono text-slate-700 mt-1">4/4 passes completed · plan is complete-eligible</p>
      </div>

      {/* Pass timeline */}
      <div className="flex-1 overflow-hidden mx-3 mt-2 border border-[#1a1a1a] rounded-sm">
        <MiniPassRow seq={1} name="Extract route registry logic" passId="pass-001" status="completed" deps={[]} actionLabel="View" actionVariant="muted" />
        <MiniPassRow seq={2} name="Add audit pipeline hook" passId="pass-002" status="completed" deps={[{ id: 'pass-001', blocking: false }]} actionLabel="View" actionVariant="muted" />
        <MiniPassRow seq={3} name="Integrate plan context to run stages" passId="pass-003" status="completed" deps={[{ id: 'pass-001', blocking: false }, { id: 'pass-002', blocking: false }]} actionLabel="View" actionVariant="muted" />
        <MiniPassRow seq={4} name="Integration test and validation" passId="pass-004" status="completed" deps={[{ id: 'pass-003', blocking: false }]} actionLabel="View" actionVariant="muted" />
      </div>

      <div className="px-3 py-2 flex-shrink-0">
        <span className="text-[7px] font-mono text-slate-700">All passes accepted · Updated 2 minutes ago</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Board step metadata
───────────────────────────────────────────────────── */
const STEPS = [
  {
    step: 1,
    title: 'Plans Registry',
    subtitle: 'Active plans',
    stateBadge: { label: 'Active Plans', variant: 'blue' },
    primaryAction: '+ New Plan',
    copy: 'Registry surface with filter tabs. Attention rows brought forward. Entry point to plan and pass orchestration.',
    Screen: Screen1,
    route: '/plans',
  },
  {
    step: 2,
    title: 'New Plan',
    subtitle: 'JSON pasted, not validated',
    stateBadge: { label: 'Draft', variant: 'slate' },
    primaryAction: 'Validate Plan',
    copy: 'Plan of Passes JSON pasted in left pane. Right pane awaits validation run. No records created yet.',
    Screen: Screen2,
    route: '/plans/new',
  },
  {
    step: 3,
    title: 'New Plan',
    subtitle: 'Validation success',
    stateBadge: { label: 'Validated', variant: 'emerald' },
    primaryAction: 'Submit Reviewed Plan',
    copy: 'Extracted plan preview and derived pass list. All passes shown as Planned before any submission.',
    Screen: Screen3,
    route: '/plans/new',
  },
  {
    step: 4,
    title: 'Plan Detail',
    subtitle: 'After submission — passes derived',
    stateBadge: { label: 'Active', variant: 'blue' },
    primaryAction: 'Open pass 1',
    copy: 'Newly submitted plan. All 4 passes in Planned state. Only pass 1 unblocked; passes 2–4 show Waiting.',
    Screen: Screen4,
    route: '/plans/plan-9a3f',
  },
  {
    step: 5,
    title: 'Pass Detail',
    subtitle: 'Dependency-satisfied, ready',
    stateBadge: { label: 'Ready', variant: 'amber' },
    primaryAction: 'Create Run',
    copy: 'Pass 1 has no dependencies — unblocked. State card confirms readiness. One-click run creation armed.',
    Screen: Screen5,
    route: '/plans/plan-9a3f/passes/pass-001',
  },
  {
    step: 6,
    title: 'New Run',
    subtitle: 'planId/passId prefilled',
    stateBadge: { label: 'Pass Context', variant: 'cyan' },
    primaryAction: 'Create Run',
    copy: 'Run creation form with plan/pass association resolved. Plan context strip confirms linked pass. Preflight checks visible.',
    Screen: Screen6,
    route: '/runs/new?planId=plan-9a3f&passId=pass-001',
  },
  {
    step: 7,
    title: 'Run Workbench',
    subtitle: 'Execute stage · plan/pass context',
    stateBadge: { label: 'Running', variant: 'blue' },
    primaryAction: 'View logs',
    copy: 'Execute stage with plan context strip persisted in run header. Execution pipeline stepper shows active step.',
    Screen: Screen7,
    route: '/execute?planId=plan-9a3f&passId=pass-001',
  },
  {
    step: 8,
    title: 'Audit Decision',
    subtitle: 'Acceptance completing the pass',
    stateBadge: { label: 'Audit Ready', variant: 'cyan' },
    primaryAction: 'Accept',
    copy: 'Audit ready state with all evidence positive. Decision buttons surfaced. Accepting this run completes pass-001.',
    Screen: Screen8,
    route: '/audit?planId=plan-9a3f&passId=pass-001',
  },
  {
    step: 9,
    title: 'Plan Detail',
    subtitle: 'Updated pass progress',
    stateBadge: { label: 'Active', variant: 'blue' },
    primaryAction: 'Open current pass',
    copy: 'Pass 1 now Completed. Pass 2 moves to In Progress (deps satisfied). Plan state card updates with current pass.',
    Screen: Screen9,
    route: '/plans/plan-9a3f',
  },
  {
    step: 10,
    title: 'Plan Detail',
    subtitle: 'Completion-ready state',
    stateBadge: { label: 'Completion Ready', variant: 'amber' },
    primaryAction: 'Complete Plan',
    copy: 'All 4 passes accepted. Progress bar fully filled. Plan enters Completion Ready — final action available.',
    Screen: Screen10,
    route: '/plans/plan-9a3f',
  },
];

/* ─────────────────────────────────────────────────────
   Board frame wrapper
───────────────────────────────────────────────────── */
function BoardFrame({ stepData, isLast }) {
  const { step, title, subtitle, stateBadge, primaryAction, copy, Screen } = stepData;

  return (
    <div className="flex-shrink-0" style={{ width: '360px' }}>
      {/* Step label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-semibold text-slate-700 w-5 text-right">{step}</span>
          <div>
            <p className="text-[10px] font-semibold text-slate-300 leading-tight">{title}</p>
            <p className="text-[8px] text-slate-600">{subtitle}</p>
          </div>
        </div>
        <MiniBadge label={stateBadge.label} variant={stateBadge.variant} />
      </div>

      {/* Screen frame */}
      <div
        className="border border-[#252525] rounded-sm overflow-hidden"
        style={{ height: '472px', background: '#0a0a0a' }}
      >
        <Screen />
      </div>

      {/* Annotation strip */}
      <div className="mt-2 border border-[#1a1a1a] rounded-sm bg-[#0d0d0d] px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] text-slate-700 uppercase tracking-[0.12em] font-semibold">Primary action</span>
          <span className="text-[8px] font-medium text-blue-400 font-mono">{primaryAction}</span>
        </div>
        <p className="text-[8px] text-slate-600 leading-snug">{copy}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Flow connector arrow
───────────────────────────────────────────────────── */
function FlowArrow() {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center pt-12" style={{ width: '32px' }}>
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px bg-[#2a2a2a]" style={{ height: '40px' }} />
        <ArrowRight size={12} className="text-[#2a2a2a]" style={{ transform: 'rotate(90deg)' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Flow phase labels
───────────────────────────────────────────────────── */
const FLOW_PHASES = [
  { label: 'PLAN CREATION', steps: [1, 2, 3], color: 'text-blue-400/60' },
  { label: 'PASS DISPATCH',  steps: [4, 5, 6], color: 'text-amber-400/60' },
  { label: 'RUN EXECUTION',  steps: [7, 8],    color: 'text-cyan-400/60' },
  { label: 'PLAN PROGRESS',  steps: [9, 10],   color: 'text-emerald-400/60' },
];

/* ─────────────────────────────────────────────────────
   WorkflowBoardPage — main export
───────────────────────────────────────────────────── */
export default function WorkflowBoardPage({ onBack }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeStep, setActiveStep] = useState(null);

  function handleBack() {
    if (onBack) onBack();
    else navigate('/plans');
  }

  function scrollToStep(stepNum) {
    const el = scrollRef.current;
    if (!el) return;
    // Each frame is 360px + 32px connector = 392px
    const frameWidth = 392;
    const offset = (stepNum - 1) * frameWidth - 16;
    el.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
    setActiveStep(stepNum);
  }

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      data-testid="workflow-board-page"
    >
      {/* ── Top nav ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            data-testid="board-back-btn"
          >
            <ArrowLeft size={11} />
            Plans
          </button>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-sm font-semibold text-slate-100">Relay</span>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-[11px] font-mono text-slate-500">v1.0.4-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/plans')}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Plans
          </button>
          <button
            onClick={() => navigate('/runs')}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Runs
          </button>
        </div>
      </div>

      {/* ── Board header ── */}
      <div className="px-6 pt-4 pb-3 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-700">Screen Reference</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-500/10 text-slate-600 border border-slate-700/30">10 screens</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-100">Managed Plan Flow</h1>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step screen reference for managed plan orchestration — from plan creation through pass completion.</p>
          </div>

          {/* Phase legend */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-8">
            {FLOW_PHASES.map(phase => (
              <div key={phase.label} className="text-right">
                <p className={`text-[8px] font-semibold tracking-[0.12em] ${phase.color}`}>{phase.label}</p>
                <p className="text-[7px] text-slate-700 font-mono">Steps {phase.steps[0]}–{phase.steps[phase.steps.length - 1]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step index pills */}
        <div className="flex items-center gap-1.5 mt-3">
          {STEPS.map(s => (
            <button
              key={s.step}
              onClick={() => scrollToStep(s.step)}
              data-testid={`board-step-pill-${s.step}`}
              className={`flex items-center gap-1.5 text-[8px] px-2 py-1 rounded-sm border transition-colors ${
                activeStep === s.step
                  ? 'border-blue-600/50 bg-blue-950/30 text-blue-400'
                  : 'border-[#252525] text-slate-600 hover:border-[#333] hover:text-slate-400'
              }`}
            >
              <span className="font-mono font-semibold">{s.step}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Board scroll area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto px-6 py-5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a #0e0e0e' }}
        data-testid="board-scroll-area"
      >
        <div className="flex items-start gap-0 min-w-max pb-2">
          {STEPS.map((stepData, idx) => (
            <React.Fragment key={stepData.step}>
              <BoardFrame stepData={stepData} isLast={idx === STEPS.length - 1} />
              {idx < STEPS.length - 1 && <FlowArrow />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
