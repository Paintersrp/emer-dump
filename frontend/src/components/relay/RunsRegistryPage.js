import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  TriangleAlert,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Status config
───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  intake_review: {
    label: "Intake Review",
    cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30",
  },
  validation_failed: {
    label: "Validation Failed",
    cls: "bg-red-500/15 text-red-400 border border-red-600/30",
  },
  executor_blocked: {
    label: "Executor Blocked",
    cls: "bg-red-500/15 text-red-400 border border-red-600/30",
  },
  audit_ready: {
    label: "Audit Ready",
    cls: "bg-cyan-500/15 text-cyan-400 border border-cyan-600/30",
  },
  running: {
    label: "Running",
    cls: "bg-blue-500/15 text-blue-400 border border-blue-600/30",
  },
  accepted: {
    label: "Accepted",
    cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-600/30",
  },
  complete: {
    label: "Complete",
    cls: "bg-emerald-500/10 text-emerald-500/70 border border-emerald-700/25",
  },
};

/* ─────────────────────────────────────────────────────
   Stage labels + routes
───────────────────────────────────────────────────── */
const STAGE_LABELS = {
  intake: "INTAKE",
  compile_render: "COMPILE / RENDER",
  execute: "EXECUTE",
  audit: "AUDIT",
};

const STAGE_ROUTES = {
  intake: "/intake",
  compile_render: "/",
  execute: "/execute",
  audit: "/audit",
};

/* ─────────────────────────────────────────────────────
   Attention config
───────────────────────────────────────────────────── */
const ATTENTION_CONFIG = {
  review:     { cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30" },
  validation: { cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30" },
  blocked:    { cls: "bg-red-500/15 text-red-400 border border-red-600/30" },
  audit:      { cls: "bg-cyan-500/15 text-cyan-400 border border-cyan-600/30" },
};

function getAttentionLabel(a) {
  if (!a) return null;
  if (a.type === "review")     return "Review";
  if (a.type === "validation") return a.count > 1 ? `${a.count} Validation` : "1 Validation";
  if (a.type === "blocked")    return "Blocked";
  if (a.type === "audit")      return "Audit";
  return null;
}

/* ─────────────────────────────────────────────────────
   Mock runs
───────────────────────────────────────────────────── */
const MOCK_RUNS = [
  {
    id: "run-100", runNumber: 100, packetId: "packet-100",
    title: "Planner Handoff: Relay MCP Plan Submission Action",
    repo: "relay", branch: "main",
    status: "validation_failed", stage: "compile_render", executor: "opencode_go",
    updatedAt: "3 hours ago",
    attention: { type: "validation", count: 1 },
  },
  {
    id: "run-99", runNumber: 99, packetId: "packet-99",
    title: "Planner Handoff: Managed Planner Pass Plan Contract",
    repo: "relay", branch: "main",
    status: "intake_review", stage: "intake", executor: "opencode_go",
    updatedAt: "6 hours ago",
    attention: { type: "review", count: null },
  },
  {
    id: "run-98", runNumber: 98, packetId: "packet-98",
    title: "Fix Antigravity Result Artifacts and Validation Evidence",
    repo: "relay", branch: "main",
    status: "intake_review", stage: "intake", executor: "opencode_go",
    updatedAt: "yesterday",
    attention: { type: "review", count: null },
  },
  {
    id: "run-97", runNumber: 97, packetId: "packet-97",
    title: "Relay Contracts Code-Owned Packet Compiler Schema Repair",
    repo: "relay", branch: "main",
    status: "validation_failed", stage: "compile_render", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "validation", count: 1 },
  },
  {
    id: "run-96", runNumber: 96, packetId: "packet-96",
    title: "Relay Aider Repair Smoke Test Eligible Validation Failure",
    repo: "relay", branch: "main",
    status: "executor_blocked", stage: "execute", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "blocked", count: null },
  },
  {
    id: "run-95", runNumber: 95, packetId: "packet-95",
    title: "Relay Aider Repair Attempt UI",
    repo: "relay", branch: "main",
    status: "audit_ready", stage: "audit", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "validation", count: 1 },
  },
  {
    id: "run-94", runNumber: 94, packetId: "packet-94",
    title: "Validation Repair Aider Allowlist",
    repo: "relay", branch: "main",
    status: "audit_ready", stage: "audit", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "validation", count: 2 },
  },
  {
    id: "run-93", runNumber: 93, packetId: "packet-93",
    title: "Relay Audit UI — Generate Audit After Validation Passed Safe Packet",
    repo: "relay", branch: "main",
    status: "accepted", stage: "audit", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: null,
  },
  {
    id: "run-92", runNumber: 92, packetId: "packet-92",
    title: "Relay Canonical Packet File Targets Correction",
    repo: "relay", branch: "main",
    status: "validation_failed", stage: "compile_render", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "validation", count: 4 },
  },
  {
    id: "run-91", runNumber: 91, packetId: "packet-91",
    title: "Relay Audit UI — Generate Audit After Validation Passed Path Safety Repair",
    repo: "relay", branch: "main",
    status: "audit_ready", stage: "audit", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "audit", count: null },
  },
  {
    id: "run-90", runNumber: 90, packetId: "packet-90",
    title: "Relay Audit UI — Generate Audit After Validation Passed",
    repo: "relay", branch: "main",
    status: "validation_failed", stage: "compile_render", executor: "opencode_go",
    updatedAt: "4 days ago",
    attention: { type: "validation", count: 9 },
  },
  {
    id: "run-89", runNumber: 89, packetId: "packet-89",
    title: "Relay Run State Machine Dispatch Refactor",
    repo: "relay", branch: "feature/dispatch",
    status: "running", stage: "execute", executor: "codex",
    updatedAt: "just now",
    attention: null,
  },
  {
    id: "run-88", runNumber: 88, packetId: "packet-88",
    title: "Antigravity Executor Integration Baseline",
    repo: "relay", branch: "main",
    status: "complete", stage: "audit", executor: "antigravity",
    updatedAt: "5 days ago",
    attention: null,
  },
];

/* ─────────────────────────────────────────────────────
   Filters
───────────────────────────────────────────────────── */
const FILTERS = [
  { id: "all",              label: "All Runs" },
  { id: "attention",        label: "Needs Attention" },
  { id: "running",          label: "Running" },
  { id: "executor_blocked", label: "Executor Blocked" },
  { id: "audit_required",   label: "Audit Required" },
  { id: "complete",         label: "Complete" },
];

function getFilterCount(id, runs) {
  if (id === "all")              return runs.length;
  if (id === "attention")        return runs.filter((r) => r.attention).length;
  if (id === "running")          return runs.filter((r) => r.status === "running").length;
  if (id === "executor_blocked") return runs.filter((r) => r.status === "executor_blocked").length;
  if (id === "audit_required")   return runs.filter((r) => r.status === "audit_ready").length;
  if (id === "complete")         return runs.filter((r) => r.status === "accepted" || r.status === "complete").length;
  return 0;
}

function applyFilter(runs, id) {
  if (id === "all")              return runs;
  if (id === "attention")        return runs.filter((r) => r.attention);
  if (id === "running")          return runs.filter((r) => r.status === "running");
  if (id === "executor_blocked") return runs.filter((r) => r.status === "executor_blocked");
  if (id === "audit_required")   return runs.filter((r) => r.status === "audit_ready");
  if (id === "complete")         return runs.filter((r) => r.status === "accepted" || r.status === "complete");
  return runs;
}

/* ─────────────────────────────────────────────────────
   StatusPill
───────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    cls: "bg-slate-500/15 text-slate-400 border border-slate-600/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide whitespace-nowrap ${cfg.cls}`}
      data-testid={`status-pill-${status}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   AttentionPill
───────────────────────────────────────────────────── */
function AttentionPill({ attention }) {
  if (!attention) return null;
  const label = getAttentionLabel(attention);
  const cfg = ATTENTION_CONFIG[attention.type] || ATTENTION_CONFIG.review;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium whitespace-nowrap ${cfg.cls}`}
    >
      <TriangleAlert size={9} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   RunRow
───────────────────────────────────────────────────── */
function RunRow({ run, onClick }) {
  const hasAttention = Boolean(run.attention);
  return (
    <tr
      data-testid={`run-row-${run.runNumber}`}
      className="group border-b border-[#161616] cursor-pointer hover:bg-[#111111] transition-colors duration-100"
      onClick={onClick}
    >
      {/* Run title + compact meta */}
      <td className="px-6 py-3.5 pr-3">
        <div
          data-testid={`run-title-${run.runNumber}`}
          className={`text-sm font-medium leading-snug truncate ${
            hasAttention ? "text-slate-100" : "text-slate-400"
          }`}
        >
          {run.title}
        </div>
        <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-slate-700">
          <span>{run.runNumber}</span>
          <span className="text-slate-800">/</span>
          <span>{run.packetId}</span>
          <span className="text-slate-800">/</span>
          <span>{run.repo}</span>
          <span className="text-slate-800">/</span>
          <span>{run.branch}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusPill status={run.status} />
      </td>

      {/* Stage */}
      <td className="px-4 py-3.5">
        <span
          className={`font-mono text-[10px] tracking-widest ${
            hasAttention ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {STAGE_LABELS[run.stage] || run.stage.toUpperCase()}
        </span>
      </td>

      {/* Executor */}
      <td className="px-4 py-3.5">
        <span className="font-mono text-[11px] text-slate-500">{run.executor}</span>
      </td>

      {/* Updated */}
      <td className="px-4 py-3.5">
        <span className="text-[11px] text-slate-600 whitespace-nowrap">{run.updatedAt}</span>
      </td>

      {/* Attention */}
      <td className="px-4 py-3.5">
        <AttentionPill attention={run.attention} />
      </td>

      {/* Open chevron */}
      <td className="px-3 py-3.5 text-right">
        <ChevronRight
          size={13}
          className="text-slate-800 group-hover:text-slate-500 transition-colors inline-block"
        />
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   Loading state
───────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 size={16} className="text-slate-700 animate-spin" data-testid="loading-spinner" />
          <span className="text-xs text-slate-600">Loading runs...</span>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   Error state
───────────────────────────────────────────────────── */
function ErrorState({ onRetry }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <AlertCircle size={16} className="text-red-500/50" />
          <span className="text-xs text-slate-500">Failed to load runs.</span>
          {onRetry && (
            <button
              data-testid="error-retry-btn"
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw size={11} />
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────── */
function EmptyState() {
  const navigate = useNavigate();

  return (
    <tr>
      <td colSpan={7} className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <Inbox size={18} className="text-slate-700" />
          <div>
            <p className="text-sm text-slate-500">No runs found.</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Create a new run to start Relay orchestration.
            </p>
          </div>
          <button
            data-testid="empty-new-run-btn"
            onClick={() => navigate("/runs/new")}
            className="flex items-center gap-1.5 mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus size={11} />
            New Run
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   RunsRegistryPage
───────────────────────────────────────────────────── */
export default function RunsRegistryPage({
  runs = MOCK_RUNS,
  isLoading = false,
  error = null,
  onRetry = null,
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRuns = applyFilter(runs, activeFilter);
  const attentionCount = runs.filter((r) => r.attention).length;

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      data-testid="runs-registry-page"
    >
      {/* ── Top nav ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0"
        data-testid="runs-top-nav"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">Relay</span>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-[11px] font-mono text-slate-500">v1.0.4-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="nav-plans-btn"
            onClick={() => navigate("/plans")}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Plans
          </button>
          {/* Active: Runs button looks selected on this page */}
          <button
            data-testid="nav-runs-btn"
            onClick={() => navigate("/runs")}
            className="text-xs text-slate-200 px-3 py-1.5 border border-[#333] rounded-sm bg-[#1a1a1a] transition-colors"
          >
            Runs
          </button>
          <button
            data-testid="nav-new-run-btn"
            onClick={() => navigate("/runs/new")}
            className="text-xs text-blue-400 px-3 py-1.5 border border-blue-800/50 rounded-sm hover:border-blue-600/60 hover:text-blue-300 bg-blue-950/30 transition-colors flex items-center gap-1.5"
          >
            <Plus size={10} />
            New Run
          </button>
        </div>
      </div>

      {/* ── Page header ── */}
      <div
        className="px-6 pt-5 pb-4 border-b border-[#1a1a1a] flex-shrink-0"
        data-testid="page-header"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-xl font-semibold text-slate-100 tracking-tight"
              data-testid="page-title"
            >
              Runs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Handoff orchestration runs</p>

            {/* Summary row */}
            {!isLoading && !error && (
              <div className="flex items-center gap-3 mt-2.5 text-xs" data-testid="summary-row">
                <span className="text-slate-500">
                  <span className="font-mono font-medium text-slate-300">{runs.length}</span>{" "}
                  runs
                </span>
                {attentionCount > 0 && (
                  <span
                    className="flex items-center gap-1 text-amber-400"
                    data-testid="attention-count"
                  >
                    <TriangleAlert size={10} />
                    <span className="font-medium">{attentionCount}</span> need attention
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            data-testid="new-run-header-btn"
            onClick={() => navigate("/runs/new")}
            className="flex items-center gap-1.5 text-xs text-blue-400 px-3 py-1.5 border border-blue-800/50 rounded-sm hover:border-blue-600/60 hover:text-blue-300 bg-blue-950/30 transition-colors mt-0.5 flex-shrink-0"
          >
            <Plus size={10} />
            New Run
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="px-6 flex items-center border-b border-[#1a1a1a] flex-shrink-0 overflow-x-auto"
        data-testid="filter-tabs"
      >
        {FILTERS.map((f) => {
          const count = getFilterCount(f.id, runs);
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              data-testid={`filter-${f.id}`}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "border-blue-500 text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label}
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm ${
                  isActive
                    ? "bg-blue-500/20 text-blue-300"
                    : count > 0
                    ? "bg-[#1c1c1c] text-slate-500"
                    : "bg-[#181818] text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Runs table ── */}
      <div className="flex-1 overflow-auto" data-testid="runs-table-container">
        <table
          className="w-full border-collapse"
          style={{ minWidth: "760px" }}
          data-testid="runs-table"
        >
          <colgroup>
            <col style={{ width: "38%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "5%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[#1c1c1c]" data-testid="table-header">
              <th className="px-6 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Run
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Executor
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Attention
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState onRetry={onRetry} />
            ) : filteredRuns.length === 0 ? (
              <EmptyState />
            ) : (
              filteredRuns.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  onClick={() => navigate(STAGE_ROUTES[run.stage] || "/intake")}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      {!isLoading && !error && filteredRuns.length > 0 && (
        <div
          className="px-6 py-2 border-t border-[#161616] flex items-center justify-between flex-shrink-0"
          data-testid="table-footer"
        >
          <span className="text-[10px] font-mono text-slate-700">{runs.length} runs</span>
          <span className="text-[10px] text-slate-700">
            Showing {filteredRuns.length}
            {activeFilter !== "all" ? ` of ${runs.length}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
