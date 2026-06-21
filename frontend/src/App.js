import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import CompileRenderPage from "@/components/relay/CompileRenderPage";
import ExecutePage from "@/components/relay/ExecutePage";

/* ─────────────────────────────────────────────────────
   Shared run context
───────────────────────────────────────────────────── */
const MOCK_RUN = {
  runState: "intake_needs_review",
  packetId: "packet-99",
  repo: "relay",
  branch: "main",
  worktree: "default",
  executionProfile: "opencode_go",
  targetModel: "deepseek-v4-flash",
};

/* ─────────────────────────────────────────────────────
   Compile / Render mock — blocked state
───────────────────────────────────────────────────── */
const MOCK_PREPARE = {
  compileStatus: "blocked",
  packetValidationStatus: "waiting",
  repairStatus: "na",
  briefStatus: "waiting",
  briefValidationStatus: "waiting",
  approvalStatus: "waiting",
  artifacts: [],
};

/* ─────────────────────────────────────────────────────
   Execute mock — blocked state (intake_needs_review)
───────────────────────────────────────────────────── */
const MOCK_EXECUTE = {
  executeStatus: "blocked",
  blockingReason: null,
  dispatchState: "not_dispatched",
  startedAt: null,
  completedAt: null,
  resultArtifact: null,
  recentLogs: [],
  artifacts: [],
};

/* ─────────────────────────────────────────────────────
   Stage navigation config
───────────────────────────────────────────────────── */
const STAGES = [
  { id: "intake",         label: "Intake",          path: null },
  { id: "compile-render", label: "Compile / Render", path: "/" },
  { id: "execute",        label: "Execute",          path: "/execute" },
  { id: "audit",          label: "Audit",            path: null },
];

/* ─────────────────────────────────────────────────────
   Relay demo shell — shared chrome wrapper
───────────────────────────────────────────────────── */
function RelayShell({ activeStageId, children }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      data-testid="relay-shell"
    >
      {/* ── Top nav ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0"
        data-testid="top-nav"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">Relay</span>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-[11px] font-mono text-slate-500">v1.0.4-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="nav-runs-btn"
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Runs
          </button>
          <button
            data-testid="nav-new-run-btn"
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Plus size={10} />
            New Run
          </button>
        </div>
      </div>

      {/* ── Run header + stage tabs ── */}
      <div
        className="px-4 pt-3 border-b border-[#1e1e1e] flex-shrink-0"
        data-testid="run-header"
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              data-testid="back-to-runs-btn"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={11} />
              Runs
            </button>
            <span className="text-slate-700 flex-shrink-0">·</span>
            <span
              className="text-sm font-medium text-slate-200 truncate"
              data-testid="run-title"
            >
              Planner Handoff: Managed Planner Pass Plan Contract
            </span>
            <span
              data-testid="run-status-badge"
              className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-700/40 rounded-sm flex-shrink-0"
            >
              Intake Review
            </span>
          </div>
          <span className="text-[11px] text-slate-600 ml-4 flex-shrink-0 hidden sm:block">
            opencode_go · Updated 5 hours ago
          </span>
        </div>

        {/* Breadcrumb */}
        <div
          className="flex items-center gap-1.5 mb-3 text-[11px] font-mono text-slate-600"
          data-testid="breadcrumb"
        >
          <span>99</span>
          <span className="text-slate-700">·</span>
          <span>{MOCK_RUN.packetId}</span>
          <span className="text-slate-700">·</span>
          <span>{MOCK_RUN.repo}</span>
          <span className="text-slate-700">·</span>
          <span>{MOCK_RUN.branch}</span>
        </div>

        {/* Stage navigation — clickable between demo pages */}
        <div className="flex items-center" data-testid="stage-tabs">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              data-testid={`stage-tab-${stage.id}`}
              onClick={() => stage.path && navigate(stage.path)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                stage.id === activeStageId
                  ? "border-blue-500 text-blue-400"
                  : stage.path
                  ? "border-transparent text-slate-500 hover:text-slate-300 cursor-pointer"
                  : "border-transparent text-slate-700 cursor-default"
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Route: Compile / Render
───────────────────────────────────────────────────── */
function CompileRenderRoute() {
  const navigate = useNavigate();
  return (
    <RelayShell activeStageId="compile-render">
      <CompileRenderPage
        {...MOCK_RUN}
        {...MOCK_PREPARE}
        onReturnToIntake={() => console.log("navigate → Intake")}
      />
    </RelayShell>
  );
}

/* ─────────────────────────────────────────────────────
   Route: Execute
───────────────────────────────────────────────────── */
function ExecuteRoute() {
  const navigate = useNavigate();
  return (
    <RelayShell activeStageId="execute">
      <ExecutePage
        {...MOCK_RUN}
        {...MOCK_EXECUTE}
        onReturnToCompileRender={() => navigate("/")}
        onDispatch={() => console.log("dispatch executor")}
        onProceedToAudit={() => console.log("navigate → Audit")}
      />
    </RelayShell>
  );
}

/* ─────────────────────────────────────────────────────
   App root
───────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<CompileRenderRoute />} />
        <Route path="/execute" element={<ExecuteRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
