import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  TriangleAlert,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Status config
───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  active: {
    label: "Active",
    cls: "bg-blue-500/15 text-blue-400 border border-blue-600/30",
  },
  completion_ready: {
    label: "Completion Ready",
    cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30",
  },
  complete: {
    label: "Complete",
    cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-600/30",
  },
  abandoned: {
    label: "Abandoned",
    cls: "bg-slate-500/10 text-slate-600 border border-slate-700/25",
  },
};

/* ─────────────────────────────────────────────────────
   Attention config
───────────────────────────────────────────────────── */
const ATTENTION_CONFIG = {
  next_pass_ready:  { label: "Next pass ready",  cls: "bg-blue-500/15 text-blue-400 border border-blue-600/30" },
  in_progress:      { label: "In progress",      cls: "bg-blue-500/15 text-blue-400 border border-blue-600/30" },
  completion_ready: { label: "Completion ready", cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30" },
  blocked:          { label: "Blocked",          cls: "bg-red-500/15 text-red-400 border border-red-600/30" },
  no_runs_yet:      { label: "No runs yet",      cls: "bg-slate-500/12 text-slate-500 border border-slate-700/30" },
  review:           { label: "Review",           cls: "bg-amber-500/15 text-amber-400 border border-amber-600/30" },
};

/* ─────────────────────────────────────────────────────
   Mock plans
───────────────────────────────────────────────────── */
const MOCK_PLANS = [
  {
    id: "plan-8",
    planNumber: 8,
    planId: "plan-8",
    title: "Relay Run State Registry and Breadcrumb Navigation",
    repo: "relay",
    branch: "feature/nav",
    status: "active",
    passesTotal: 3,
    passesComplete: 1,
    currentPass: { id: "pass-2", title: "Implement runs list with filter tabs", status: "ready" },
    updatedAt: "5 hours ago",
    attention: { type: "next_pass_ready" },
  },
  {
    id: "plan-7",
    planNumber: 7,
    planId: "plan-7",
    title: "Relay Async Executor Dispatch + Audit Integration",
    repo: "relay",
    branch: "main",
    status: "active",
    passesTotal: 7,
    passesComplete: 3,
    currentPass: { id: "pass-4", title: "Wire executor dispatch to result capture", status: "ready" },
    updatedAt: "2 hours ago",
    attention: { type: "next_pass_ready" },
  },
  {
    id: "plan-6",
    planNumber: 6,
    planId: "plan-6",
    title: "Managed Planner Pass Plan Contract Implementation",
    repo: "relay",
    branch: "main",
    status: "completion_ready",
    passesTotal: 5,
    passesComplete: 5,
    currentPass: null,
    updatedAt: "6 hours ago",
    attention: { type: "completion_ready" },
  },
  {
    id: "plan-5",
    planNumber: 5,
    planId: "plan-5",
    title: "Relay Audit UI and Packet Validation Flow",
    repo: "relay",
    branch: "main",
    status: "active",
    passesTotal: 4,
    passesComplete: 2,
    currentPass: { id: "pass-3", title: "Generate audit after validation passed", status: "running" },
    updatedAt: "1 day ago",
    attention: { type: "in_progress" },
  },
  {
    id: "plan-4",
    planNumber: 4,
    planId: "plan-4",
    title: "Aider Executor Repair and Smoke Test Coverage",
    repo: "relay",
    branch: "main",
    status: "active",
    passesTotal: 6,
    passesComplete: 4,
    currentPass: { id: "pass-5", title: "Eligible validation failure pattern repair", status: "blocked" },
    updatedAt: "4 days ago",
    attention: { type: "blocked" },
  },
  {
    id: "plan-2",
    planNumber: 2,
    planId: "plan-2",
    title: "Antigravity Contracts Code-Owned Schema Repair",
    repo: "relay",
    branch: "main",
    status: "active",
    passesTotal: 8,
    passesComplete: 0,
    currentPass: { id: "pass-1", title: "Bootstrap contracts schema baseline", status: "ready" },
    updatedAt: "2 days ago",
    attention: { type: "no_runs_yet" },
  },
  {
    id: "plan-3",
    planNumber: 3,
    planId: "plan-3",
    title: "Relay Executor Integration Baseline — OpenCode Go",
    repo: "relay",
    branch: "main",
    status: "complete",
    passesTotal: 5,
    passesComplete: 5,
    currentPass: null,
    updatedAt: "1 week ago",
    attention: null,
  },
  {
    id: "plan-1",
    planNumber: 1,
    planId: "plan-1",
    title: "Relay MCP Plan Submission Action Spec",
    repo: "relay",
    branch: "main",
    status: "abandoned",
    passesTotal: 3,
    passesComplete: 1,
    currentPass: null,
    updatedAt: "2 weeks ago",
    attention: null,
  },
];

/* ─────────────────────────────────────────────────────
   Filters
───────────────────────────────────────────────────── */
const FILTERS = [
  { id: "all",              label: "All" },
  { id: "active",           label: "Active" },
  { id: "completion_ready", label: "Completion Ready" },
  { id: "attention",        label: "Needs Attention" },
  { id: "complete",         label: "Complete" },
  { id: "abandoned",        label: "Abandoned" },
];

function getFilterCount(id, plans) {
  if (id === "all")              return plans.length;
  if (id === "active")           return plans.filter((p) => p.status === "active").length;
  if (id === "completion_ready") return plans.filter((p) => p.status === "completion_ready").length;
  if (id === "attention")        return plans.filter((p) => p.attention).length;
  if (id === "complete")         return plans.filter((p) => p.status === "complete").length;
  if (id === "abandoned")        return plans.filter((p) => p.status === "abandoned").length;
  return 0;
}

function applyFilter(plans, id) {
  if (id === "all")              return plans;
  if (id === "active")           return plans.filter((p) => p.status === "active");
  if (id === "completion_ready") return plans.filter((p) => p.status === "completion_ready");
  if (id === "attention")        return plans.filter((p) => p.attention);
  if (id === "complete")         return plans.filter((p) => p.status === "complete");
  if (id === "abandoned")        return plans.filter((p) => p.status === "abandoned");
  return plans;
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
  const cfg = ATTENTION_CONFIG[attention.type] || ATTENTION_CONFIG.review;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium whitespace-nowrap ${cfg.cls}`}
    >
      <TriangleAlert size={9} />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   PassProgressBar
───────────────────────────────────────────────────── */
function PassProgressBar({ complete, total }) {
  const maxSegs = 10;
  const visibleSegs = Math.min(total, maxSegs);
  const filled = total <= maxSegs
    ? complete
    : Math.round((complete / total) * maxSegs);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-px">
        {Array.from({ length: visibleSegs }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-sm ${i < filled ? "bg-blue-500/65" : "bg-slate-800"}`}
            style={{ width: "9px" }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] tabular-nums whitespace-nowrap">
        <span className="text-slate-300">{complete}</span>
        <span className="text-slate-700">/{total}</span>
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CurrentPassCell
───────────────────────────────────────────────────── */
function CurrentPassCell({ plan }) {
  if (plan.status === "complete") {
    return (
      <span className="font-mono text-[10px] text-emerald-600/60 tracking-widest">
        ALL COMPLETE
      </span>
    );
  }
  if (plan.status === "abandoned" || !plan.currentPass) {
    return <span className="text-slate-700 text-sm">—</span>;
  }

  const { currentPass } = plan;
  const dotCls = {
    running: "bg-blue-400",
    ready:   "bg-slate-600",
    blocked: "bg-red-500/60",
  }[currentPass.status] || "bg-slate-600";

  return (
    <div className="flex items-start gap-1.5 max-w-[200px]">
      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 mt-[5px] ${dotCls}`} />
      <div className="min-w-0">
        <div className="font-mono text-[10px] text-slate-700 truncate">{currentPass.id}</div>
        <div className="text-[11px] text-slate-400 leading-snug truncate">
          {currentPass.title}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PlanRow
───────────────────────────────────────────────────── */
function PlanRow({ plan }) {
  const navigate = useNavigate();
  const hasAttention = Boolean(plan.attention);
  return (
    <tr
      data-testid={`plan-row-${plan.planNumber}`}
      className="group border-b border-[#161616] cursor-pointer hover:bg-[#111111] transition-colors duration-100"
      onClick={() => navigate(`/plans/${plan.planId}`)}
    >
      {/* Plan title + meta */}
      <td className="px-6 py-3.5 pr-3">
        <div
          data-testid={`plan-title-${plan.planNumber}`}
          className={`text-sm font-medium leading-snug truncate ${
            hasAttention ? "text-slate-100" : "text-slate-400"
          }`}
        >
          {plan.title}
        </div>
        <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-slate-700">
          <span>{plan.planId}</span>
          <span className="text-slate-800">/</span>
          <span>{plan.repo}</span>
          <span className="text-slate-800">/</span>
          <span>{plan.branch}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusPill status={plan.status} />
      </td>

      {/* Progress */}
      <td className="px-4 py-3.5">
        <PassProgressBar complete={plan.passesComplete} total={plan.passesTotal} />
      </td>

      {/* Current / Next Pass */}
      <td className="px-4 py-3.5">
        <CurrentPassCell plan={plan} />
      </td>

      {/* Updated */}
      <td className="px-4 py-3.5">
        <span className="text-[11px] text-slate-600 whitespace-nowrap">{plan.updatedAt}</span>
      </td>

      {/* Attention */}
      <td className="px-4 py-3.5">
        <AttentionPill attention={plan.attention} />
      </td>

      {/* Chevron */}
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
   Skeleton row (loading state)
───────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-[#161616]">
      <td className="px-6 py-3.5">
        <div className="h-3 w-52 bg-slate-800/60 rounded-sm animate-pulse mb-1.5" />
        <div className="h-2 w-32 bg-slate-800/40 rounded-sm animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-12 bg-slate-800/60 rounded-sm animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-2 w-20 bg-slate-800/50 rounded-sm animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-36 bg-slate-800/40 rounded-sm animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-2 w-14 bg-slate-800/40 rounded-sm animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-20 bg-slate-800/40 rounded-sm animate-pulse" />
      </td>
      <td className="px-3 py-3.5" />
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   Loading state — skeleton rows
───────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────
   Error state
───────────────────────────────────────────────────── */
function ErrorState({ onRetry }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-14 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <AlertCircle size={15} className="text-red-500/50" />
          <span className="text-xs text-slate-500">Plans failed to load.</span>
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
function EmptyState({ onViewRuns }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <Inbox size={18} className="text-slate-700" />
          <div>
            <p className="text-sm text-slate-400">No managed plans yet.</p>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xs mx-auto leading-relaxed">
              Plans are optional. Standalone runs remain available from the Runs registry.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              data-testid="empty-new-plan-btn"
              onClick={() => navigate('/plans/new')}
              className="flex items-center gap-1.5 text-xs text-blue-400 px-3 py-1.5 border border-blue-700/40 rounded-sm hover:border-blue-500/60 hover:text-blue-300 bg-blue-950/30 transition-colors"
            >
              <Plus size={10} />
              New Plan
            </button>
            <button
              data-testid="empty-view-runs-btn"
              onClick={onViewRuns}
              className="text-xs text-slate-500 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-300 transition-colors"
            >
              View Runs
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────
   PlansRegistryPage
───────────────────────────────────────────────────── */
export default function PlansRegistryPage({
  plans = MOCK_PLANS,
  isLoading = false,
  error = null,
  onRetry = null,
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredPlans = applyFilter(plans, activeFilter);
  const attentionCount = plans.filter((p) => p.attention).length;

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      data-testid="plans-registry-page"
    >
      {/* ── Top nav ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0"
        data-testid="plans-top-nav"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">Relay</span>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-[11px] font-mono text-slate-500">v1.0.4-stable</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Plans — active on this page */}
          <button
            data-testid="nav-plans-btn"
            onClick={() => navigate("/plans")}
            className="text-xs text-slate-200 px-3 py-1.5 border border-[#333] rounded-sm bg-[#1a1a1a] transition-colors"
          >
            Plans
          </button>
          <button
            data-testid="nav-runs-btn"
            onClick={() => navigate("/runs")}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Runs
          </button>
          <button
            data-testid="nav-new-plan-btn"
            onClick={() => navigate('/plans/new')}
            className="text-xs text-blue-400 px-3 py-1.5 border border-blue-800/50 rounded-sm hover:border-blue-600/60 hover:text-blue-300 bg-blue-950/30 transition-colors flex items-center gap-1.5"
          >
            <Plus size={10} />
            New Plan
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
              Plans
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Managed multi-pass orchestration plans
            </p>

            {/* Summary row */}
            {!isLoading && !error && (
              <div className="flex items-center gap-3 mt-2.5 text-xs" data-testid="summary-row">
                <span className="text-slate-500">
                  <span className="font-mono font-medium text-slate-300">{plans.length}</span>{" "}
                  plans
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
            data-testid="new-plan-header-btn"
            onClick={() => navigate('/plans/new')}
            className="flex items-center gap-1.5 text-xs text-blue-400 px-3 py-1.5 border border-blue-800/50 rounded-sm hover:border-blue-600/60 hover:text-blue-300 bg-blue-950/30 transition-colors mt-0.5 flex-shrink-0"
          >
            <Plus size={10} />
            New Plan
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="px-6 flex items-center border-b border-[#1a1a1a] flex-shrink-0 overflow-x-auto"
        data-testid="filter-tabs"
      >
        {FILTERS.map((f) => {
          const count = getFilterCount(f.id, plans);
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

      {/* ── Plans table ── */}
      <div className="flex-1 overflow-auto" data-testid="plans-table-container">
        <table
          className="w-full border-collapse"
          style={{ minWidth: "820px" }}
          data-testid="plans-table"
        >
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "23%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "4%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[#1c1c1c]" data-testid="table-header">
              <th className="px-6 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                Current / Next Pass
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
            ) : filteredPlans.length === 0 ? (
              <EmptyState onViewRuns={() => navigate("/runs")} />
            ) : (
              filteredPlans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      {!isLoading && !error && filteredPlans.length > 0 && (
        <div
          className="px-6 py-2 border-t border-[#161616] flex items-center justify-between flex-shrink-0"
          data-testid="table-footer"
        >
          <span className="text-[10px] font-mono text-slate-700">{plans.length} plans</span>
          <span className="text-[10px] text-slate-700">
            Showing {filteredPlans.length}
            {activeFilter !== "all" ? ` of ${plans.length}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
