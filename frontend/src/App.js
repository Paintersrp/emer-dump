import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import IntakePage from "@/components/relay/IntakePage";
import CompileRenderPage from "@/components/relay/CompileRenderPage";
import ExecutePage from "@/components/relay/ExecutePage";
import AuditPage from "@/components/relay/AuditPage";
import RunsRegistryPage from "@/components/relay/RunsRegistryPage";

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
  { id: "intake",         label: "Intake",          path: "/intake" },
  { id: "compile-render", label: "Compile / Render", path: "/" },
  { id: "execute",        label: "Execute",          path: "/execute" },
  { id: "audit",          label: "Audit",            path: "/audit" },
];

/* ─────────────────────────────────────────────────────
   Intake mock states — switch via ?state=<intakeStatus>
───────────────────────────────────────────────────── */
const INTAKE_MOCKS = {
  intake_needs_review: {
    intakeStatus: "intake_needs_review",
    blockingReason: null,
    handoffTitle: "Planner Handoff: Managed Planner Pass Plan Contract",
    handoffArtifact: "runs/99/handoff.json",
    handoffSummary:
      "Refactor the relay run pipeline to support async executor dispatch with result capture and audit integration.",
    handoffSource: "react_workbench",
    createdBy: "intake_endpoint",
    readinessChecks: [
      { id: "repo-reachable",      label: "Repo reachable",                  status: "ok"   },
      { id: "branch-exists",       label: "Branch exists",                   status: "ok"   },
      { id: "uncommitted-changes", label: "No uncommitted changes",          status: "warn" },
      { id: "validation-commands", label: "Validation commands extractable", status: "ok"   },
    ],
    currentIssues: [
      { id: "w1", message: "No frontmatter block found",             type: "warning", category: "validation" },
      { id: "w2", message: "No repository specified in frontmatter", type: "warning", category: "validation" },
      { id: "w3", message: "No branch specified in frontmatter",     type: "warning", category: "validation" },
    ],
    intakeArtifacts: [],
    recentLogs: [
      { timestamp: "09:14:02", message: "Handoff loaded from intake endpoint",       level: "info" },
      { timestamp: "09:14:03", message: "Run configuration resolved from run value", level: "info" },
      { timestamp: "09:14:04", message: "Preflight: 3/4 checks passed",             level: "warn" },
      { timestamp: "09:14:05", message: "Frontmatter validation: 3 warnings found", level: "warn" },
    ],
  },
  approved: {
    intakeStatus: "approved",
    blockingReason: null,
    handoffTitle: "Planner Handoff: Managed Planner Pass Plan Contract",
    handoffArtifact: "runs/99/handoff.json",
    handoffSummary:
      "Refactor the relay run pipeline to support async executor dispatch with result capture and audit integration.",
    handoffSource: "react_workbench",
    createdBy: "intake_endpoint",
    readinessChecks: [
      { id: "repo-reachable",      label: "Repo reachable",                  status: "ok" },
      { id: "branch-exists",       label: "Branch exists",                   status: "ok" },
      { id: "uncommitted-changes", label: "No uncommitted changes",          status: "ok" },
      { id: "validation-commands", label: "Validation commands extractable", status: "ok" },
    ],
    currentIssues: [],
    intakeArtifacts: [
      { path: "runs/99/intake_packet.json", type: "intake"  },
      { path: "runs/99/handoff.json",       type: "handoff" },
    ],
    recentLogs: [
      { timestamp: "09:14:02", message: "Handoff loaded from intake endpoint",          level: "info" },
      { timestamp: "09:14:03", message: "Run configuration resolved",                   level: "info" },
      { timestamp: "09:14:10", message: "Preflight: 4/4 checks passed",                level: "info" },
      { timestamp: "09:15:30", message: "Intake approved — proceeding to Compile / Render", level: "info" },
    ],
  },
  blocked: {
    intakeStatus: "blocked",
    blockingReason: "Handoff artifact missing or unreadable",
    handoffTitle: null,
    handoffArtifact: null,
    handoffSummary: null,
    handoffSource: null,
    createdBy: null,
    readinessChecks: [],
    currentIssues: [
      { id: "e1", message: "Handoff artifact missing or unreadable", type: "error", category: "intake" },
    ],
    intakeArtifacts: [],
    recentLogs: [
      { timestamp: "09:13:59", message: "Handoff load failed: artifact not found", level: "error" },
      { timestamp: "09:14:00", message: "Intake blocked — cannot proceed",          level: "error" },
    ],
  },
};

/* ─────────────────────────────────────────────────────
   Audit mock states — switch via ?state=<auditStatus>
───────────────────────────────────────────────────── */
const AUDIT_MOCKS = {
  blocked: {
    auditStatus: "blocked",
    blockingReason: null,
    executorResultArtifact: null,
    validationStatus: "not_reviewed",
    validationReportPath: null,
    changedFilesCount: null,
    diffSummary: null,
    scopeStatus: "not_reviewed",
    scopeNotes: null,
    blockers: [],
    warnings: [],
    auditNotes: null,
    auditDecision: "pending",
    acceptedAt: null,
    completedAt: null,
    auditArtifacts: [],
    recentLogs: [],
  },
  ready: {
    auditStatus: "ready",
    blockingReason: null,
    executorResultArtifact: { path: "runs/99/executor_result.json", exitCode: 0 },
    validationStatus: "passed",
    validationReportPath: "runs/99/validation_report.json",
    changedFilesCount: 7,
    diffSummary: { additions: 142, deletions: 38 },
    scopeStatus: "in_scope",
    scopeNotes: null,
    blockers: [],
    warnings: [{ id: "w1", message: "2 test files skipped during validation" }],
    auditNotes: null,
    auditDecision: "pending",
    acceptedAt: null,
    completedAt: null,
    auditArtifacts: [],
    recentLogs: [
      { timestamp: "14:32:01", message: "Executor result captured", level: "info" },
      { timestamp: "14:32:15", message: "Validation passed with 1 warning", level: "warn" },
      { timestamp: "14:32:16", message: "Scope: all changes within declared boundaries", level: "info" },
      { timestamp: "14:32:17", message: "Audit ready — awaiting decision", level: "info" },
    ],
  },
  passed: {
    auditStatus: "passed",
    blockingReason: null,
    executorResultArtifact: { path: "runs/99/executor_result.json", exitCode: 0 },
    validationStatus: "passed",
    validationReportPath: "runs/99/validation_report.json",
    changedFilesCount: 7,
    diffSummary: { additions: 142, deletions: 38 },
    scopeStatus: "in_scope",
    scopeNotes: null,
    blockers: [],
    warnings: [],
    auditNotes: null,
    auditDecision: "accepted",
    acceptedAt: "2026-06-21T14:35:22Z",
    completedAt: "2026-06-21T14:35:22Z",
    auditArtifacts: [
      { path: "runs/99/audit_packet.json", type: "audit" },
      { path: "runs/99/validation_report.json", type: "validation" },
      { path: "runs/99/executor_result.json", type: "result" },
    ],
    recentLogs: [
      { timestamp: "14:32:01", message: "Executor result captured", level: "info" },
      { timestamp: "14:32:15", message: "Validation passed", level: "info" },
      { timestamp: "14:32:16", message: "Scope: all changes within declared boundaries", level: "info" },
      { timestamp: "14:35:20", message: "Audit decision: accepted", level: "info" },
      { timestamp: "14:35:22", message: "Run accepted — audit complete", level: "info" },
    ],
  },
  warning: {
    auditStatus: "warning",
    blockingReason: null,
    executorResultArtifact: { path: "runs/99/executor_result.json", exitCode: 0 },
    validationStatus: "warning",
    validationReportPath: "runs/99/validation_report.json",
    changedFilesCount: 7,
    diffSummary: { additions: 142, deletions: 38 },
    scopeStatus: "in_scope",
    scopeNotes: null,
    blockers: [],
    warnings: [
      { id: "w1", message: "2 test files skipped during validation" },
      { id: "w2", message: "Optional assertion skipped: coverage threshold not enforced" },
    ],
    auditNotes: null,
    auditDecision: "accepted_with_warnings",
    acceptedAt: "2026-06-21T15:02:44Z",
    completedAt: "2026-06-21T15:02:44Z",
    auditArtifacts: [
      { path: "runs/99/audit_packet.json", type: "audit" },
      { path: "runs/99/validation_report.json", type: "validation" },
    ],
    recentLogs: [
      { timestamp: "15:01:10", message: "Executor result captured", level: "info" },
      { timestamp: "15:01:25", message: "Validation passed with 2 warnings", level: "warn" },
      { timestamp: "15:02:40", message: "Audit decision: accepted with warnings", level: "warn" },
      { timestamp: "15:02:44", message: "Run accepted with non-blocking warnings", level: "warn" },
    ],
  },
  revision_required: {
    auditStatus: "revision_required",
    blockingReason: null,
    executorResultArtifact: { path: "runs/99/executor_result.json", exitCode: 1 },
    validationStatus: "warning",
    validationReportPath: "runs/99/validation_report.json",
    changedFilesCount: 12,
    diffSummary: { additions: 304, deletions: 87 },
    scopeStatus: "warning",
    scopeNotes: "Changes detected in files outside the declared scope boundary",
    blockers: [
      { id: "b1", message: "Modified files outside declared scope boundary" },
    ],
    warnings: [
      { id: "w1", message: "Executor exit code 1 — non-zero exit detected" },
    ],
    auditNotes: null,
    auditDecision: "revision_required",
    acceptedAt: null,
    completedAt: null,
    auditArtifacts: [],
    recentLogs: [
      { timestamp: "16:10:05", message: "Executor result captured (exit 1)", level: "warn" },
      { timestamp: "16:10:20", message: "Scope check: changes outside boundary detected", level: "error" },
      { timestamp: "16:11:00", message: "Audit decision: revision required", level: "error" },
    ],
  },
  rejected: {
    auditStatus: "rejected",
    blockingReason: null,
    executorResultArtifact: { path: "runs/99/executor_result.json", exitCode: 2 },
    validationStatus: "failed",
    validationReportPath: "runs/99/validation_report.json",
    changedFilesCount: 5,
    diffSummary: { additions: 88, deletions: 22 },
    scopeStatus: "out_of_scope",
    scopeNotes: null,
    blockers: [
      { id: "b1", message: "Executor output does not match expected schema" },
      { id: "b2", message: "Validation failed: 3 critical assertions failed" },
      { id: "b3", message: "Scope violation: executor modified restricted path" },
    ],
    warnings: [],
    auditNotes: null,
    auditDecision: "rejected",
    acceptedAt: null,
    completedAt: "2026-06-21T17:45:11Z",
    auditArtifacts: [
      { path: "runs/99/rejection_report.json", type: "audit" },
    ],
    recentLogs: [
      { timestamp: "17:44:00", message: "Executor result captured (exit 2)", level: "error" },
      { timestamp: "17:44:15", message: "Validation failed: 3 critical assertions", level: "error" },
      { timestamp: "17:44:30", message: "Scope violation: restricted path modified", level: "error" },
      { timestamp: "17:45:10", message: "Audit decision: rejected", level: "error" },
      { timestamp: "17:45:11", message: "Run rejected — blocking issues found", level: "error" },
    ],
  },
};

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
            onClick={() => navigate("/runs")}
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
   Route: Runs Registry
───────────────────────────────────────────────────── */
function RunsRoute() {
  return <RunsRegistryPage />;
}

/* ─────────────────────────────────────────────────────
   Route: Intake
───────────────────────────────────────────────────── */
function IntakeRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "intake_needs_review";
  const mock = INTAKE_MOCKS[state] || INTAKE_MOCKS.intake_needs_review;

  return (
    <RelayShell activeStageId="intake">
      <IntakePage
        {...MOCK_RUN}
        {...mock}
        onApprove={() => console.log("intake: approve")}
        onNeedsRevision={() => console.log("intake: needs revision")}
        onBlockRun={() => console.log("intake: block run")}
        onProceedToCompileRender={() => navigate("/")}
      />
    </RelayShell>
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
   Route: Audit
───────────────────────────────────────────────────── */
function AuditRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "blocked";
  const mock = AUDIT_MOCKS[state] || AUDIT_MOCKS.blocked;

  return (
    <RelayShell activeStageId="audit">
      <AuditPage
        {...MOCK_RUN}
        {...mock}
        onReturnToExecute={() => navigate("/execute")}
        onAccept={() => console.log("audit: accept")}
        onAcceptWithWarning={() => console.log("audit: accept with warning")}
        onRequestRevision={() => console.log("audit: request revision")}
        onReject={() => console.log("audit: reject")}
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
        <Route path="/runs"   element={<RunsRoute />} />
        <Route path="/intake"  element={<IntakeRoute />} />
        <Route path="/"        element={<CompileRenderRoute />} />
        <Route path="/execute" element={<ExecuteRoute />} />
        <Route path="/audit"   element={<AuditRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
