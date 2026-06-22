import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  CircleDashed,
  CheckCircle2,
  XCircle,
  Loader,
  Play,
  ArrowRight,
  FileCode,
} from "lucide-react";
import { buildRunPlanContextDetailsSection } from "@/components/relay/RunPlanContext";

/* ─────────────────────────────────────────────────────
   Execution pipeline step definitions
───────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    id: "brief-approved",
    label: "Brief approved",
    helperText: "Brief approval required before executor dispatch.",
  },
  {
    id: "dispatched",
    label: "Executor dispatched",
    helperText: "Dispatch the executor to begin execution.",
  },
  {
    id: "running",
    label: "Execution running",
    helperText: "Relay is waiting for executor output.",
  },
  {
    id: "result-captured",
    label: "Result captured",
  },
  {
    id: "audit-ready",
    label: "Audit ready",
    helperText: "Result is captured and ready for audit.",
  },
];

/* ─────────────────────────────────────────────────────
   Derive pipeline step statuses from executeStatus
───────────────────────────────────────────────────── */
function getPipelineStatuses(executeStatus) {
  switch (executeStatus) {
    case "ready":
      return {
        "brief-approved": "success",
        "dispatched":     "active",
        "running":        "waiting",
        "result-captured":"waiting",
        "audit-ready":    "waiting",
      };
    case "running":
      return {
        "brief-approved": "success",
        "dispatched":     "success",
        "running":        "running",
        "result-captured":"waiting",
        "audit-ready":    "waiting",
      };
    case "complete":
      return {
        "brief-approved": "success",
        "dispatched":     "success",
        "running":        "success",
        "result-captured":"success",
        "audit-ready":    "active",
      };
    case "failed":
      return {
        "brief-approved": "success",
        "dispatched":     "success",
        "running":        "failed",
        "result-captured":"waiting",
        "audit-ready":    "waiting",
      };
    default: // blocked
      return {
        "brief-approved": "blocked",
        "dispatched":     "waiting",
        "running":        "waiting",
        "result-captured":"waiting",
        "audit-ready":    "waiting",
      };
  }
}

/* ─────────────────────────────────────────────────────
   Step visual config
───────────────────────────────────────────────────── */
function getStepConfig(status) {
  switch (status) {
    case "success":
      return {
        Icon: CheckCircle2,
        iconCls: "text-cyan-700",
        nameCls: "text-slate-500",
        badge: null,
      };
    case "active":
      return {
        Icon: ArrowRight,
        iconCls: "text-cyan-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Ready",
        badgeCls: "bg-cyan-950/25 text-cyan-400 border border-cyan-800/50",
      };
    case "running":
      return {
        Icon: Loader,
        iconCls: "text-blue-400 animate-spin",
        nameCls: "text-slate-200 font-medium",
        badge: "Running",
        badgeCls: "bg-blue-950/25 text-blue-400 border border-blue-800/50",
      };
    case "blocked":
      return {
        Icon: AlertCircle,
        iconCls: "text-amber-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Blocked",
        badgeCls: "bg-amber-950/25 text-amber-400 border border-amber-800/50",
      };
    case "failed":
      return {
        Icon: XCircle,
        iconCls: "text-red-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Failed",
        badgeCls: "bg-red-950/25 text-red-400 border border-red-900/50",
      };
    default: // waiting
      return {
        Icon: CircleDashed,
        iconCls: "text-slate-700",
        nameCls: "text-slate-600",
        badge: null,
      };
  }
}

function getStepBgCls(status) {
  if (status === "blocked") return "bg-amber-950/5";
  if (status === "active" || status === "running") return "bg-blue-950/5";
  if (status === "failed") return "bg-red-950/5";
  return "";
}

function getHelperCls(status) {
  if (status === "blocked") return "text-amber-600/50";
  if (status === "failed") return "text-red-500/50";
  return "text-blue-500/50";
}

/* ─────────────────────────────────────────────────────
   Current state card config
───────────────────────────────────────────────────── */
const STATE_CONFIG = {
  blocked: {
    border:     "border-amber-600/60",
    bg:         "rgba(120, 53, 15, 0.06)",
    eyebrow:    "Current blocker",
    eyebrowCls: "text-amber-600/60",
    Icon:       AlertTriangle,
    iconCls:    "text-amber-400/80",
    title:      "Execution is blocked",
    titleCls:   "text-amber-200",
    message:    "Approve the executor brief before dispatch can run.",
  },
  ready: {
    border:     "border-cyan-700/50",
    bg:         "rgba(8, 145, 178, 0.05)",
    eyebrow:    "Ready to dispatch",
    eyebrowCls: "text-cyan-600/60",
    Icon:       Play,
    iconCls:    "text-cyan-400/80",
    title:      "Ready to dispatch",
    titleCls:   "text-cyan-100",
    message:    "The executor brief is approved and ready for the selected adapter.",
  },
  running: {
    border:     "border-blue-700/50",
    bg:         "rgba(29, 78, 216, 0.05)",
    eyebrow:    "Execution running",
    eyebrowCls: "text-blue-500/60",
    Icon:       Loader,
    iconCls:    "text-blue-400/80 animate-spin",
    title:      "Execution running",
    titleCls:   "text-blue-100",
    message:    "Relay is waiting for executor output.",
  },
  complete: {
    border:     "border-cyan-700/50",
    bg:         "rgba(6, 182, 212, 0.05)",
    eyebrow:    "Execution complete",
    eyebrowCls: "text-cyan-500/60",
    Icon:       CheckCircle2,
    iconCls:    "text-cyan-400",
    title:      "Execution complete",
    titleCls:   "text-cyan-100",
    message:    "Executor result has been captured.",
  },
  failed: {
    border:     "border-red-800/60",
    bg:         "rgba(127, 29, 29, 0.06)",
    eyebrow:    "Execution failed",
    eyebrowCls: "text-red-600/60",
    Icon:       XCircle,
    iconCls:    "text-red-400/80",
    title:      "Execution failed",
    titleCls:   "text-red-200",
    message:    "The executor could not complete the run.",
  },
};

/* ─────────────────────────────────────────────────────
   Shared inspector KV + section components
───────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
    {children}
  </p>
);

const KVRow = ({ label, value, valueCls, mono = true, isLast = false }) => (
  <div className={`py-2 ${!isLast ? "border-b border-[#1c1c1c]" : ""}`}>
    <p className="text-[10px] text-slate-600 mb-0.5 leading-none tracking-wide">{label}</p>
    <p className={`text-[11px] leading-snug ${mono ? "font-mono" : ""} ${valueCls || "text-slate-400"}`}>
      {value || "—"}
    </p>
  </div>
);

const InspectorSection = ({ title, rows, isLast = false }) => (
  <div className={`px-4 pt-3 pb-2 ${!isLast ? "border-b border-[#1e1e1e]" : ""}`}>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2 pb-1.5 border-b border-[#1c1c1c]">
      {title}
    </p>
    {rows.map((row, i) => (
      <KVRow key={row.label} {...row} isLast={i === rows.length - 1} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────
   Pipeline step row
───────────────────────────────────────────────────── */
const PipelineStep = ({ step, status, isLast }) => {
  const cfg = getStepConfig(status);
  const { Icon } = cfg;
  const isActive = ["running", "active", "blocked", "failed"].includes(status);

  return (
    <div
      data-testid={`pipeline-step-${step.id}`}
      className={`flex items-start gap-3 px-4 ${isActive ? "py-3" : "py-2"} ${
        !isLast ? "border-b border-[#1a1a1a]" : ""
      } ${getStepBgCls(status)}`}
    >
      <Icon size={isActive ? 14 : 13} className={`${cfg.iconCls} flex-shrink-0 mt-[3px]`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <span className={`leading-tight ${isActive ? "text-[13px]" : "text-xs"} ${cfg.nameCls}`}>
            {step.label}
          </span>
          {cfg.badge && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 whitespace-nowrap ${cfg.badgeCls}`}>
              {cfg.badge}
            </span>
          )}
        </div>
        {isActive && step.helperText && (
          <p className={`text-[11px] font-mono mt-1 leading-snug ${getHelperCls(status)}`}>
            {step.helperText}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Current-state card (adapts to executeStatus)
───────────────────────────────────────────────────── */
const StateCard = ({
  executeStatus,
  blockingReason,
  executionProfile,
  targetModel,
  branch,
  repo,
  onDispatch,
  onReturnToCompileRender,
  onProceedToAudit,
}) => {
  const cfg = STATE_CONFIG[executeStatus] || STATE_CONFIG.blocked;
  const { Icon } = cfg;

  return (
    <div
      data-testid="execute-state-card"
      className={`border-l-2 ${cfg.border} rounded-r-sm pl-4 pr-4 py-3`}
      style={{ background: cfg.bg }}
    >
      {/* Eyebrow */}
      <p className={`text-[10px] font-mono uppercase tracking-widest ${cfg.eyebrowCls} mb-1.5`}>
        {cfg.eyebrow}
      </p>

      {/* Body row */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon size={14} className={`${cfg.iconCls} flex-shrink-0 mt-0.5`} />
          <div className="min-w-0">
            <p
              className={`text-[15px] font-semibold leading-tight mb-0.5 ${cfg.titleCls}`}
              data-testid="state-card-title"
            >
              {cfg.title}
            </p>
            <p className="text-xs text-slate-400" data-testid="state-card-message">
              {blockingReason || cfg.message}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0">
          {executeStatus === "blocked" && (
            <Button
              data-testid="return-to-compile-render-btn"
              size="sm"
              variant="outline"
              onClick={onReturnToCompileRender}
              className="border-amber-700/40 text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-300 hover:border-amber-600/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
            >
              Return to Compile / Render
              <ArrowRight size={11} />
            </Button>
          )}
          {executeStatus === "ready" && (
            <Button
              data-testid="dispatch-executor-btn"
              size="sm"
              onClick={onDispatch}
              className="bg-cyan-600/15 border border-cyan-600/50 text-cyan-300 hover:bg-cyan-600/25 hover:text-cyan-200 hover:border-cyan-500/70 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
            >
              Dispatch Executor
              <ArrowRight size={11} />
            </Button>
          )}
          {executeStatus === "failed" && (
            <Button
              data-testid="review-brief-btn"
              size="sm"
              variant="outline"
              onClick={onReturnToCompileRender}
              className="border-red-800/40 text-red-400/80 hover:bg-red-950/20 hover:text-red-300 hover:border-red-700/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
            >
              Review Executor Brief
              <ArrowRight size={11} />
            </Button>
          )}
          {executeStatus === "complete" && (
            <Button
              data-testid="proceed-to-audit-btn"
              size="sm"
              variant="outline"
              onClick={onProceedToAudit}
              className="border-cyan-700/40 text-cyan-400/90 hover:bg-cyan-950/20 hover:text-cyan-300 hover:border-cyan-600/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
            >
              Proceed to Audit
              <ArrowRight size={11} />
            </Button>
          )}
        </div>
      </div>

      {/* Compact metadata — "ready" state only */}
      {executeStatus === "ready" && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-3 border-t border-[#1e1e1e]">
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5">Executor adapter</p>
            <p className="text-[11px] font-mono text-slate-400">{executionProfile}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5">Selected model</p>
            <p className="text-[11px] font-mono text-slate-400">{targetModel}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5">Branch</p>
            <p className="text-[11px] font-mono text-slate-400">{branch}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5">Repo</p>
            <p className="text-[11px] font-mono text-slate-400">{repo}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Activity log preview
───────────────────────────────────────────────────── */
const ActivityLog = ({ logs }) => (
  <div>
    <SectionLabel>Recent Activity</SectionLabel>
    <div
      data-testid="activity-log"
      className="border border-[#1a1a1a] rounded-sm bg-[#080808] px-4 py-3"
    >
      {logs.length === 0 ? (
        <p className="text-[11px] font-mono text-slate-700 py-1">
          No activity yet. Dispatch to begin execution.
        </p>
      ) : (
        <div className="space-y-1.5">
          {logs.slice(-7).map((entry, i, arr) => (
            <div
              key={i}
              data-testid={`log-entry-${i}`}
              className="flex items-start gap-3"
            >
              <span className="text-[10px] font-mono text-slate-700 flex-shrink-0 pt-[1px] tabular-nums">
                {entry.timestamp}
              </span>
              <span
                className={`text-[11px] font-mono leading-snug ${
                  entry.level === "error"
                    ? "text-red-400/80"
                    : entry.level === "warn"
                    ? "text-amber-400/70"
                    : i === arr.length - 1
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {entry.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────────── */

/**
 * ExecutePage — Drop-in Relay Execute stage component.
 *
 * Props:
 *   runState         – e.g. "intake_needs_review"
 *   packetId, repo, branch, worktree
 *   executionProfile – e.g. "opencode_go"
 *   targetModel      – e.g. "deepseek-v4-flash"
 *
 *   executeStatus    – "blocked" | "ready" | "running" | "complete" | "failed"
 *   blockingReason   – string | null  (shown in state card)
 *
 *   dispatchState    – "not_dispatched" | "dispatched" | "running" | "complete" | "failed"
 *   startedAt        – ISO string | null
 *   completedAt      – ISO string | null
 *
 *   resultArtifact   – { path: string } | null
 *   recentLogs       – Array<{ timestamp: string, message: string, level?: string }>
 *   artifacts        – Array<{ path: string, type?: string }>
 *
 *   onDispatch            – () => void
 *   onReturnToCompileRender – () => void
 *   onProceedToAudit      – () => void
 */
const formatRunState = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const ACTIVE_STEP_LABEL = {
  blocked:  "Brief approved",
  ready:    "Executor dispatched",
  running:  "Execution running",
  complete: "Audit ready",
  failed:   "Execution running",
};

export default function ExecutePage({
  runState = "intake_needs_review",
  packetId = "packet-99",
  repo = "relay",
  branch = "main",
  worktree = "default",
  executionProfile = "opencode_go",
  targetModel = "deepseek-v4-flash",
  runPlanContext = null,

  executeStatus = "blocked",
  blockingReason = null,

  dispatchState = "not_dispatched",
  startedAt = null,
  completedAt = null,

  resultArtifact = null,
  recentLogs = [],
  artifacts = [],

  onDispatch = () => {},
  onReturnToCompileRender = () => {},
  onProceedToAudit = () => {},
}) {
  const [tab, setTab] = useState("details");
  const pipelineStatuses = getPipelineStatuses(executeStatus);
  const runPlanContextSection = buildRunPlanContextDetailsSection(runPlanContext);

  const statusBadgeCls =
    executeStatus === "complete"
      ? "bg-cyan-500/10 text-cyan-500/80 border-cyan-700/30"
      : executeStatus === "failed"
      ? "bg-red-900/20 text-red-400/80 border-red-800/30"
      : "bg-amber-500/10 text-amber-500/80 border-amber-700/30";

  // Context-aware blocking reason
  const blockingReasonValue =
    blockingReason ??
    (executeStatus === "blocked"
      ? "Waiting on brief approval"
      : executeStatus === "failed"
      ? "Unknown failure"
      : "None");
  const blockingReasonCls =
    (blockingReason || executeStatus === "failed") &&
    executeStatus !== "complete"
      ? blockingReason
        ? "text-red-400/80"
        : "text-slate-600"
      : ["complete", "running", "ready"].includes(executeStatus)
      ? "text-slate-500"
      : "text-slate-600";

  const detailsSections = [
    {
      title: "Run State",
      rows: [
        {
          label: "Status",
          value: runState,
          valueCls:
            executeStatus === "complete"
              ? "text-cyan-400"
              : executeStatus === "failed"
              ? "text-red-400"
              : "text-amber-400",
        },
        {
          label: "Active step",
          value: ACTIVE_STEP_LABEL[executeStatus] || "—",
          valueCls: "text-slate-400",
        },
      ],
    },
    ...(runPlanContextSection ? [runPlanContextSection] : []),
    {
      title: "Dispatch",
      rows: [
        {
          label: "Dispatch state",
          value:
            dispatchState === "not_dispatched" ? "Not dispatched" : dispatchState,
          valueCls: dispatchState === "not_dispatched" ? "text-slate-600" : "text-slate-400",
        },
        {
          label: "Started at",
          value:
            startedAt ||
            (["blocked", "ready"].includes(executeStatus)
              ? "Not dispatched"
              : "—"),
          valueCls: startedAt ? "text-slate-400" : "text-slate-600",
        },
        {
          label: "Completed at",
          value:
            completedAt ||
            (executeStatus === "running"
              ? "In progress…"
              : executeStatus === "failed"
              ? "Did not complete"
              : ["blocked", "ready"].includes(executeStatus)
              ? "Not dispatched"
              : "—"),
          valueCls: completedAt ? "text-slate-400" : "text-slate-600",
        },
      ],
    },
    {
      title: "Executor",
      rows: [
        { label: "Executor adapter", value: executionProfile, valueCls: "text-slate-400" },
        { label: "Selected model",   value: targetModel,      valueCls: "text-slate-400" },
        { label: "Branch",           value: branch,           valueCls: "text-slate-400" },
        { label: "Repo",             value: repo,             valueCls: "text-slate-400" },
      ],
    },
    {
      title: "Result",
      rows: [
        {
          label: "Result artifact",
          value: resultArtifact?.path || "Not generated",
          valueCls: resultArtifact ? "text-slate-400" : "text-slate-600",
        },
        {
          label: "Blocking reason",
          value: blockingReasonValue,
          valueCls: blockingReasonCls,
        },
      ],
    },
    {
      title: "Audit Readiness",
      rows: [
        {
          label: "Audit state",
          value:
            executeStatus === "complete"
              ? "Ready for audit"
              : "Waiting on executor result",
          valueCls:
            executeStatus === "complete" ? "text-cyan-400" : "text-slate-600",
        },
      ],
      isLast: true,
    },
  ];

  return (
    <div
      className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden"
      data-testid="execute-page"
    >
      {/* ─────────────────────────────────────────
          Main content pane
      ───────────────────────────────────────── */}
      <div className="w-full lg:flex-1 lg:overflow-y-auto min-w-0">
        <div className="px-4 sm:px-6 pt-5 pb-8 space-y-5 max-w-3xl">

          {/* Stage header */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2
                className="text-base font-semibold text-slate-100 tracking-tight"
                data-testid="stage-heading"
              >
                Execute
              </h2>
              <span
                data-testid="stage-run-state-badge"
                className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-sm whitespace-nowrap ${statusBadgeCls}`}
              >
                {formatRunState(runState)}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatch the approved executor brief, monitor execution, and
              capture the executor result.
            </p>
          </div>

          {/* Current state card */}
          <StateCard
            executeStatus={executeStatus}
            blockingReason={blockingReason}
            executionProfile={executionProfile}
            targetModel={targetModel}
            branch={branch}
            repo={repo}
            onDispatch={onDispatch}
            onReturnToCompileRender={onReturnToCompileRender}
            onProceedToAudit={onProceedToAudit}
          />

          {/* Execution pipeline */}
          <div>
            <SectionLabel>Execution Pipeline</SectionLabel>
            <div
              className="divide-y divide-[#1a1a1a]"
              data-testid="pipeline-container"
            >
              {PIPELINE_STEPS.map((step, i) => (
                <PipelineStep
                  key={step.id}
                  step={step}
                  status={pipelineStatuses[step.id]}
                  isLast={i === PIPELINE_STEPS.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Activity log */}
          <ActivityLog logs={recentLogs} />

          {/* Generated artifacts */}
          <div>
            <SectionLabel>Generated Artifacts</SectionLabel>
            {artifacts.length === 0 ? (
              <div
                data-testid="artifacts-empty-state"
                className="flex items-start gap-3 px-4 py-3 border border-[#1e1e1e] rounded-sm"
              >
                <FileCode size={13} className="text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 leading-snug">
                    No execution artifacts generated yet.
                  </p>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    Executor result, logs, and audit-ready evidence will appear
                    here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden">
                {artifacts.map((artifact, i) => (
                  <div
                    key={i}
                    data-testid={`artifact-item-${i}`}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <FileCode size={11} className="text-slate-600 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-400 truncate flex-1">
                      {artifact.path}
                    </span>
                    {artifact.type && (
                      <span className="text-[10px] font-mono text-slate-700 flex-shrink-0">
                        {artifact.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────
          Right Inspector panel
      ───────────────────────────────────────── */}
      <div
        className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#1e1e1e] bg-[#0b0b0b] flex flex-col flex-shrink-0 lg:overflow-hidden"
        data-testid="inspector-panel"
      >
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col lg:h-full">
          <TabsList
            data-testid="inspector-tabs-list"
            className="flex h-auto bg-transparent rounded-none border-b border-[#1e1e1e] p-0 flex-shrink-0"
          >
            {["details", "artifacts", "validation", "logs"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                data-testid={`inspector-tab-${t}`}
                className="flex-1 rounded-none h-auto py-2.5 px-1 text-[10px] uppercase tracking-wider font-semibold border-b-2 border-transparent text-slate-600 hover:text-slate-300 data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none bg-transparent transition-colors"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="lg:flex-1 lg:overflow-y-auto">

            <TabsContent
              value="details"
              className="mt-0"
              data-testid="inspector-details-content"
            >
              {detailsSections.map((section, i) => (
                <InspectorSection
                  key={section.title}
                  {...section}
                  isLast={i === detailsSections.length - 1}
                />
              ))}
            </TabsContent>

            <TabsContent
              value="artifacts"
              className="mt-0 p-4"
              data-testid="inspector-artifacts-content"
            >
              {artifacts.length === 0 ? (
                <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                  No execution artifacts yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {artifacts.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#1c1c1c] last:border-0">
                      <FileCode size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{a.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="validation"
              className="mt-0 p-4"
              data-testid="inspector-validation-content"
            >
              <p className="text-[11px] text-slate-600 text-center py-10 leading-relaxed">
                Validation runs after execution.
                <br />
                <span className="font-mono text-slate-700">
                  Dispatch executor first.
                </span>
              </p>
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 p-4"
              data-testid="inspector-logs-content"
            >
              {recentLogs.length === 0 ? (
                <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                  No logs available yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 border-b border-[#1c1c1c] pb-1.5 last:border-0">
                      <span className="text-[9px] font-mono text-slate-700 flex-shrink-0 tabular-nums pt-[1px]">
                        {entry.timestamp}
                      </span>
                      <span
                        className={`text-[10px] font-mono leading-snug ${
                          entry.level === "error"
                            ? "text-red-400/80"
                            : entry.level === "warn"
                            ? "text-amber-400/70"
                            : "text-slate-500"
                        }`}
                      >
                        {entry.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
