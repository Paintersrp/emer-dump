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
  ArrowRight,
  FileCode,
  RotateCcw,
  ShieldCheck,
  ClipboardCheck,
  FileDiff,
  FileSearch,
  TriangleAlert,
  Ban,
} from "lucide-react";
import { buildRunPlanContextDetailsSection } from "@/components/relay/RunPlanContext";

/* ─────────────────────────────────────────────────────
   Audit pipeline step definitions
───────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    id: "result-captured",
    label: "Executor result captured",
    helperText: "Awaiting executor result from the Execute stage.",
  },
  {
    id: "validation-reviewed",
    label: "Validation reviewed",
    helperText: "Review validation evidence before proceeding.",
  },
  {
    id: "scope-reviewed",
    label: "Scope reviewed",
    helperText: "Confirm the executor stayed within declared scope.",
  },
  {
    id: "evidence-reviewed",
    label: "Evidence reviewed",
    helperText: "Review changed files and artifact evidence.",
  },
  {
    id: "audit-decision",
    label: "Audit decision",
    helperText: "Make the final audit decision for this run.",
  },
];

/* ─────────────────────────────────────────────────────
   Derive pipeline step statuses from auditStatus
───────────────────────────────────────────────────── */
function getAuditPipelineStatuses(auditStatus) {
  switch (auditStatus) {
    case "ready":
      return {
        "result-captured":     "success",
        "validation-reviewed": "active",
        "scope-reviewed":      "waiting",
        "evidence-reviewed":   "waiting",
        "audit-decision":      "waiting",
      };
    case "passed":
      return {
        "result-captured":     "success",
        "validation-reviewed": "success",
        "scope-reviewed":      "success",
        "evidence-reviewed":   "success",
        "audit-decision":      "accepted",
      };
    case "warning":
      return {
        "result-captured":     "success",
        "validation-reviewed": "success",
        "scope-reviewed":      "success",
        "evidence-reviewed":   "success",
        "audit-decision":      "warning_decision",
      };
    case "revision_required":
      return {
        "result-captured":     "success",
        "validation-reviewed": "success",
        "scope-reviewed":      "success",
        "evidence-reviewed":   "success",
        "audit-decision":      "revision",
      };
    case "rejected":
      return {
        "result-captured":     "success",
        "validation-reviewed": "success",
        "scope-reviewed":      "success",
        "evidence-reviewed":   "success",
        "audit-decision":      "failed",
      };
    default: // blocked
      return {
        "result-captured":     "blocked",
        "validation-reviewed": "waiting",
        "scope-reviewed":      "waiting",
        "evidence-reviewed":   "waiting",
        "audit-decision":      "waiting",
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
        badge: "Rejected",
        badgeCls: "bg-red-950/25 text-red-400 border border-red-900/50",
      };
    case "accepted":
      return {
        Icon: CheckCircle2,
        iconCls: "text-green-500",
        nameCls: "text-slate-200 font-medium",
        badge: "Accepted",
        badgeCls: "bg-green-950/25 text-green-400 border border-green-800/50",
      };
    case "warning_decision":
      return {
        Icon: AlertTriangle,
        iconCls: "text-amber-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Accepted w/ warnings",
        badgeCls: "bg-amber-950/25 text-amber-400 border border-amber-800/50",
      };
    case "revision":
      return {
        Icon: RotateCcw,
        iconCls: "text-blue-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Revision required",
        badgeCls: "bg-blue-950/25 text-blue-400 border border-blue-800/50",
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
  if (status === "revision") return "bg-blue-950/5";
  if (status === "warning_decision") return "bg-amber-950/5";
  if (status === "accepted") return "bg-green-950/5";
  return "";
}

function getHelperCls(status) {
  if (status === "blocked") return "text-amber-600/50";
  if (status === "failed") return "text-red-500/50";
  if (status === "revision") return "text-blue-500/50";
  if (status === "warning_decision") return "text-amber-600/50";
  if (status === "accepted") return "text-green-600/50";
  return "text-blue-500/50";
}

/* ─────────────────────────────────────────────────────
   Current state card config
───────────────────────────────────────────────────── */
const STATE_CONFIG = {
  blocked: {
    border:     "border-amber-600/60",
    bg:         "rgba(120, 53, 15, 0.06)",
    eyebrow:    "Audit blocked",
    eyebrowCls: "text-amber-600/60",
    Icon:       AlertTriangle,
    iconCls:    "text-amber-400/80",
    title:      "Audit is blocked",
    titleCls:   "text-amber-200",
    message:    "Executor result must be captured before audit can begin.",
  },
  ready: {
    border:     "border-cyan-700/50",
    bg:         "rgba(8, 145, 178, 0.05)",
    eyebrow:    "Audit ready",
    eyebrowCls: "text-cyan-600/60",
    Icon:       ClipboardCheck,
    iconCls:    "text-cyan-400/80",
    title:      "Ready for audit",
    titleCls:   "text-cyan-100",
    message:    "Review validation, artifacts, and scope before making an audit decision.",
  },
  passed: {
    border:     "border-green-700/50",
    bg:         "rgba(21, 128, 61, 0.05)",
    eyebrow:    "Audit passed",
    eyebrowCls: "text-green-600/60",
    Icon:       ShieldCheck,
    iconCls:    "text-green-400/80",
    title:      "Run accepted",
    titleCls:   "text-green-100",
    message:    "Audit passed and the run is accepted.",
  },
  warning: {
    border:     "border-amber-600/50",
    bg:         "rgba(120, 53, 15, 0.05)",
    eyebrow:    "Accepted with warnings",
    eyebrowCls: "text-amber-500/60",
    Icon:       AlertTriangle,
    iconCls:    "text-amber-400/80",
    title:      "Run accepted with warnings",
    titleCls:   "text-amber-100",
    message:    "Audit passed with non-blocking warnings. Review warnings before closing.",
  },
  revision_required: {
    border:     "border-blue-700/50",
    bg:         "rgba(29, 78, 216, 0.05)",
    eyebrow:    "Revision required",
    eyebrowCls: "text-blue-500/60",
    Icon:       RotateCcw,
    iconCls:    "text-blue-400/80",
    title:      "Revision required",
    titleCls:   "text-blue-100",
    message:    "Audit found issues that need another implementation pass.",
  },
  rejected: {
    border:     "border-red-800/60",
    bg:         "rgba(127, 29, 29, 0.06)",
    eyebrow:    "Audit rejected",
    eyebrowCls: "text-red-600/60",
    Icon:       XCircle,
    iconCls:    "text-red-400/80",
    title:      "Run rejected",
    titleCls:   "text-red-200",
    message:    "Audit found blocking issues that invalidate the run.",
  },
};

/* ─────────────────────────────────────────────────────
   Lookup tables
───────────────────────────────────────────────────── */
const AUDIT_DECISION_LABEL = {
  pending:                  "Decision pending",
  accepted:                 "Accepted",
  accepted_with_warnings:   "Accepted with warnings",
  revision_required:        "Revision required",
  rejected:                 "Rejected",
};

const AUDIT_DECISION_CLS = {
  pending:                  "text-slate-600",
  accepted:                 "text-green-400",
  accepted_with_warnings:   "text-amber-400",
  revision_required:        "text-blue-400",
  rejected:                 "text-red-400",
};

const VALIDATION_LABEL = {
  not_reviewed: "Not reviewed",
  passed:       "Passed",
  failed:       "Failed",
  warning:      "Passed with warnings",
};

const VALIDATION_CLS = {
  not_reviewed: "text-slate-600",
  passed:       "text-green-400",
  failed:       "text-red-400",
  warning:      "text-amber-400",
};

const SCOPE_LABEL = {
  not_reviewed:  "Not reviewed",
  in_scope:      "In scope",
  out_of_scope:  "Out of scope",
  warning:       "In scope with notes",
};

const SCOPE_CLS = {
  not_reviewed: "text-slate-600",
  in_scope:     "text-green-400",
  out_of_scope: "text-red-400",
  warning:      "text-amber-400",
};

const ACTIVE_STEP_LABEL = {
  blocked:           "Executor result captured",
  ready:             "Validation reviewed",
  passed:            "Audit decision",
  warning:           "Audit decision",
  revision_required: "Audit decision",
  rejected:          "Audit decision",
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
const ACTIVE_STATUSES = [
  "running", "active", "blocked", "failed", "accepted", "warning_decision", "revision",
];

const PipelineStep = ({ step, status, isLast }) => {
  const cfg = getStepConfig(status);
  const { Icon } = cfg;
  const isActive = ACTIVE_STATUSES.includes(status);

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
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 whitespace-nowrap ${cfg.badgeCls}`}
            >
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
   Evidence row
───────────────────────────────────────────────────── */
const EvidenceRow = ({ icon: Icon, label, value, valueCls, tag, tagCls, isLast }) => (
  <div
    className={`flex items-start gap-3 px-4 py-2.5 ${!isLast ? "border-b border-[#1a1a1a]" : ""}`}
  >
    <Icon size={12} className="text-slate-600 flex-shrink-0 mt-[3px]" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-600 mb-0.5 leading-none">{label}</p>
      <p className={`text-[11px] font-mono leading-snug truncate ${valueCls || "text-slate-400"}`}>
        {value}
      </p>
    </div>
    {tag && (
      <span
        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 whitespace-nowrap ${tagCls}`}
      >
        {tag}
      </span>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────
   Finding row — blockers / warnings
───────────────────────────────────────────────────── */
const FindingRow = ({ message, type, isLast }) => {
  const isBlocker = type === "blocker";
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-2.5 ${!isLast ? "border-b border-[#1a1a1a]" : ""}`}
    >
      {isBlocker ? (
        <Ban size={11} className="text-red-500/70 flex-shrink-0 mt-[3px]" />
      ) : (
        <TriangleAlert size={11} className="text-amber-500/70 flex-shrink-0 mt-[3px]" />
      )}
      <p
        className={`text-[11px] leading-snug ${
          isBlocker ? "text-red-400/80" : "text-amber-400/70"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Current-state card (adapts to auditStatus)
───────────────────────────────────────────────────── */
const StateCard = ({
  auditStatus,
  blockingReason,
  onAccept,
  onAcceptWithWarning,
  onRequestRevision,
  onReject,
  onReturnToExecute,
}) => {
  const cfg = STATE_CONFIG[auditStatus] || STATE_CONFIG.blocked;
  const { Icon } = cfg;

  return (
    <div
      data-testid="audit-state-card"
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

        {/* Single action CTAs for non-ready states */}
        <div className="flex-shrink-0">
          {auditStatus === "blocked" && (
            <Button
              data-testid="return-to-execute-btn"
              size="sm"
              variant="outline"
              onClick={onReturnToExecute}
              className="border-amber-700/40 text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-300 hover:border-amber-600/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
            >
              Return to Execute
              <ArrowRight size={11} />
            </Button>
          )}
          {auditStatus === "revision_required" && (
            <Button
              data-testid="return-to-execute-revision-btn"
              size="sm"
              variant="outline"
              onClick={onReturnToExecute}
              className="border-blue-700/40 text-blue-400/90 hover:bg-blue-950/30 hover:text-blue-300 hover:border-blue-600/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
            >
              Return to Execute
              <ArrowRight size={11} />
            </Button>
          )}
        </div>
      </div>

      {/* Decision buttons — ready state only */}
      {auditStatus === "ready" && (
        <div
          className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1e1e1e] flex-wrap"
          data-testid="decision-buttons"
        >
          <Button
            data-testid="accept-run-btn"
            size="sm"
            onClick={onAccept}
            className="bg-green-600/15 border border-green-600/40 text-green-300 hover:bg-green-600/25 hover:text-green-200 hover:border-green-500/60 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
          >
            Accept
          </Button>
          <Button
            data-testid="accept-with-warning-btn"
            size="sm"
            onClick={onAcceptWithWarning}
            className="bg-amber-600/10 border border-amber-600/40 text-amber-300 hover:bg-amber-600/20 hover:text-amber-200 hover:border-amber-500/60 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
          >
            Accept with warning
          </Button>
          <Button
            data-testid="request-revision-btn"
            size="sm"
            onClick={onRequestRevision}
            className="bg-blue-600/10 border border-blue-600/40 text-blue-300 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/60 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
          >
            Request revision
          </Button>
          <Button
            data-testid="reject-run-btn"
            size="sm"
            variant="outline"
            onClick={onReject}
            className="border-red-800/40 text-red-400/80 hover:bg-red-950/20 hover:text-red-300 hover:border-red-700/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
          >
            Reject
          </Button>
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
          No audit activity yet.
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
 * AuditPage — Drop-in Relay Audit stage component.
 *
 * Props:
 *   runState, packetId, repo, branch, worktree
 *   executionProfile, targetModel
 *
 *   auditStatus              – "blocked"|"ready"|"passed"|"warning"|"revision_required"|"rejected"
 *   blockingReason           – string | null
 *
 *   executorResultArtifact   – { path: string, exitCode: number|null } | null
 *   validationStatus         – "not_reviewed"|"passed"|"failed"|"warning"
 *   validationReportPath     – string | null
 *   changedFilesCount        – number | null
 *   diffSummary              – { additions: number, deletions: number } | null
 *   scopeStatus              – "not_reviewed"|"in_scope"|"out_of_scope"|"warning"
 *   scopeNotes               – string | null
 *
 *   blockers                 – Array<{ id: string, message: string }>
 *   warnings                 – Array<{ id: string, message: string }>
 *   auditNotes               – string | null
 *
 *   auditDecision            – "pending"|"accepted"|"accepted_with_warnings"|"revision_required"|"rejected"
 *   acceptedAt               – ISO string | null
 *   completedAt              – ISO string | null
 *
 *   auditArtifacts           – Array<{ path: string, type?: string }>
 *   recentLogs               – Array<{ timestamp: string, message: string, level?: string }>
 *
 *   onAccept, onAcceptWithWarning, onRequestRevision, onReject
 *   onReturnToExecute        – () => void
 */
const formatRunState = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AuditPage({
  runState = "intake_needs_review",
  packetId = "packet-99",
  repo = "relay",
  branch = "main",
  worktree = "default",
  executionProfile = "opencode_go",
  targetModel = "deepseek-v4-flash",
  runPlanContext = null,

  auditStatus = "blocked",
  blockingReason = null,

  executorResultArtifact = null,
  validationStatus = "not_reviewed",
  validationReportPath = null,
  changedFilesCount = null,
  diffSummary = null,
  scopeStatus = "not_reviewed",
  scopeNotes = null,

  blockers = [],
  warnings = [],
  auditNotes = null,

  auditDecision = "pending",
  acceptedAt = null,
  completedAt = null,

  auditArtifacts = [],
  recentLogs = [],

  onAccept = () => {},
  onAcceptWithWarning = () => {},
  onRequestRevision = () => {},
  onReject = () => {},
  onReturnToExecute = () => {},
}) {
  const [tab, setTab] = useState("details");
  const pipelineStatuses = getAuditPipelineStatuses(auditStatus);
  const runPlanContextSection = buildRunPlanContextDetailsSection(runPlanContext);

  /* Badge color on stage heading */
  const statusBadgeCls =
    auditStatus === "passed"
      ? "bg-green-500/10 text-green-500/80 border-green-700/30"
      : auditStatus === "rejected"
      ? "bg-red-900/20 text-red-400/80 border-red-800/30"
      : auditStatus === "warning" || auditStatus === "revision_required"
      ? "bg-amber-500/10 text-amber-500/80 border-amber-700/30"
      : auditStatus === "ready"
      ? "bg-cyan-500/10 text-cyan-500/80 border-cyan-700/30"
      : "bg-amber-500/10 text-amber-500/80 border-amber-700/30";

  /* Evidence is only shown when not blocked */
  const showEvidence = auditStatus !== "blocked";

  /* Inspector detail sections */
  const detailsSections = [
    {
      title: "Run State",
      rows: [
        {
          label: "Status",
          value: runState,
          valueCls:
            auditStatus === "passed"
              ? "text-green-400"
              : auditStatus === "rejected"
              ? "text-red-400"
              : auditStatus === "warning"
              ? "text-amber-400"
              : "text-amber-400",
        },
        {
          label: "Active step",
          value: ACTIVE_STEP_LABEL[auditStatus] || "—",
          valueCls: "text-slate-400",
        },
      ],
    },
    ...(runPlanContextSection ? [runPlanContextSection] : []),
    {
      title: "Audit Readiness",
      rows: [
        {
          label: "Readiness",
          value:
            auditStatus === "blocked"
              ? "Waiting on executor result"
              : auditStatus === "ready"
              ? "Ready for audit"
              : "Audit complete",
          valueCls:
            auditStatus === "blocked"
              ? "text-slate-600"
              : auditStatus === "ready"
              ? "text-cyan-400"
              : "text-slate-400",
        },
      ],
    },
    {
      title: "Executor Result",
      rows: [
        {
          label: "Result artifact",
          value: executorResultArtifact?.path || "Waiting on executor result",
          valueCls: executorResultArtifact ? "text-slate-400" : "text-slate-600",
        },
        {
          label: "Exit code",
          value:
            executorResultArtifact?.exitCode !== undefined &&
            executorResultArtifact?.exitCode !== null
              ? String(executorResultArtifact.exitCode)
              : "Not captured",
          valueCls:
            executorResultArtifact?.exitCode === 0
              ? "text-green-400"
              : executorResultArtifact?.exitCode !== null &&
                executorResultArtifact?.exitCode !== undefined
              ? "text-red-400"
              : "text-slate-600",
        },
      ],
    },
    {
      title: "Validation",
      rows: [
        {
          label: "Validation status",
          value: VALIDATION_LABEL[validationStatus] || "Not reviewed",
          valueCls: VALIDATION_CLS[validationStatus] || "text-slate-600",
        },
        {
          label: "Report",
          value: validationReportPath || "Not reviewed",
          valueCls: validationReportPath ? "text-slate-400" : "text-slate-600",
        },
      ],
    },
    {
      title: "Scope Review",
      rows: [
        {
          label: "Scope status",
          value: SCOPE_LABEL[scopeStatus] || "Not reviewed",
          valueCls: SCOPE_CLS[scopeStatus] || "text-slate-600",
        },
        {
          label: "Changed files",
          value:
            changedFilesCount !== null && changedFilesCount !== undefined
              ? `${changedFilesCount} file${changedFilesCount !== 1 ? "s" : ""}`
              : "Not reviewed",
          valueCls: changedFilesCount !== null ? "text-slate-400" : "text-slate-600",
        },
      ],
    },
    {
      title: "Decision",
      rows: [
        {
          label: "Audit decision",
          value: AUDIT_DECISION_LABEL[auditDecision] || "Decision pending",
          valueCls: AUDIT_DECISION_CLS[auditDecision] || "text-slate-600",
        },
        {
          label: "Blocking reason",
          value:
            blockers.length > 0
              ? blockers[0].message
              : auditStatus === "blocked"
              ? "Waiting on executor result"
              : "No blockers",
          valueCls: blockers.length > 0 ? "text-red-400/80" : "text-slate-600",
        },
        {
          label: "Warnings",
          value:
            warnings.length > 0
              ? `${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`
              : "No warnings",
          valueCls: warnings.length > 0 ? "text-amber-400/70" : "text-slate-600",
        },
        {
          label: "Accepted at",
          value:
            acceptedAt ||
            (["passed", "warning"].includes(auditStatus) ? "—" : "Not decided"),
          valueCls: acceptedAt ? "text-slate-400" : "text-slate-600",
        },
        {
          label: "Completed at",
          value:
            completedAt ||
            (["blocked", "ready"].includes(auditStatus) ? "Not decided" : "—"),
          valueCls: completedAt ? "text-slate-400" : "text-slate-600",
        },
      ],
      isLast: true,
    },
  ];

  return (
    <div
      className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden"
      data-testid="audit-page"
    >
      {/* ─────────────────────────────────────────
          Main content pane
      ───────────────────────────────────────── */}
      <div className="w-full lg:flex-1 lg:overflow-y-auto min-w-0">
        <div className="px-6 pt-5 pb-8 space-y-5 max-w-3xl">

          {/* Stage header */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2
                className="text-base font-semibold text-slate-100 tracking-tight"
                data-testid="stage-heading"
              >
                Audit
              </h2>
              <span
                data-testid="stage-run-state-badge"
                className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-sm whitespace-nowrap ${statusBadgeCls}`}
              >
                {formatRunState(runState)}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review executor results, validation evidence, and scope compliance
              before accepting the run.
            </p>
          </div>

          {/* Current state card */}
          <StateCard
            auditStatus={auditStatus}
            blockingReason={blockingReason}
            onAccept={onAccept}
            onAcceptWithWarning={onAcceptWithWarning}
            onRequestRevision={onRequestRevision}
            onReject={onReject}
            onReturnToExecute={onReturnToExecute}
          />

          {runPlanContext?.passId && (
            <div
              className="rounded-sm border border-[#1e2733] bg-[#0d1014] px-4 py-3"
              data-testid="audit-pass-lifecycle-note"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
                Pass Lifecycle
              </p>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">
                Audit acceptance completes the attached pass; revision keeps it in progress.
              </p>
            </div>
          )}

          {/* Audit pipeline */}
          <div>
            <SectionLabel>Audit Pipeline</SectionLabel>
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

          {/* Evidence summary — hidden when blocked */}
          {showEvidence && (
            <div>
              <SectionLabel>Evidence Summary</SectionLabel>
              <div
                data-testid="evidence-summary"
                className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden"
              >
                <EvidenceRow
                  icon={FileCode}
                  label="Executor result"
                  value={executorResultArtifact?.path || "Not captured"}
                  valueCls={executorResultArtifact ? "text-slate-400" : "text-slate-600"}
                  tag={
                    executorResultArtifact?.exitCode !== undefined &&
                    executorResultArtifact?.exitCode !== null
                      ? `exit ${executorResultArtifact.exitCode}`
                      : null
                  }
                  tagCls={
                    executorResultArtifact?.exitCode === 0
                      ? "bg-green-950/25 text-green-400/70 border border-green-800/50"
                      : "bg-red-950/25 text-red-400/70 border border-red-900/50"
                  }
                />
                <EvidenceRow
                  icon={FileSearch}
                  label="Validation report"
                  value={validationReportPath || "Not reviewed"}
                  valueCls={validationReportPath ? "text-slate-400" : "text-slate-600"}
                  tag={
                    validationStatus !== "not_reviewed"
                      ? VALIDATION_LABEL[validationStatus]
                      : null
                  }
                  tagCls={
                    validationStatus === "passed"
                      ? "bg-green-950/25 text-green-400/70 border border-green-800/50"
                      : validationStatus === "failed"
                      ? "bg-red-950/25 text-red-400/70 border border-red-900/50"
                      : "bg-amber-950/25 text-amber-400/70 border border-amber-800/50"
                  }
                />
                <EvidenceRow
                  icon={FileDiff}
                  label="Changed files"
                  value={
                    changedFilesCount !== null && changedFilesCount !== undefined
                      ? `${changedFilesCount} file${changedFilesCount !== 1 ? "s" : ""} changed${
                          diffSummary
                            ? ` · +${diffSummary.additions} / -${diffSummary.deletions}`
                            : ""
                        }`
                      : "Not reviewed"
                  }
                  valueCls={changedFilesCount !== null ? "text-slate-400" : "text-slate-600"}
                />
                <EvidenceRow
                  icon={ShieldCheck}
                  label="Scope"
                  value={
                    scopeNotes ||
                    (scopeStatus !== "not_reviewed"
                      ? SCOPE_LABEL[scopeStatus]
                      : "Not reviewed")
                  }
                  valueCls={
                    scopeStatus === "in_scope"
                      ? "text-slate-400"
                      : scopeStatus === "out_of_scope"
                      ? "text-red-400/80"
                      : scopeStatus === "warning"
                      ? "text-amber-400/70"
                      : "text-slate-600"
                  }
                  tag={
                    scopeStatus !== "not_reviewed"
                      ? SCOPE_LABEL[scopeStatus]
                      : null
                  }
                  tagCls={
                    scopeStatus === "in_scope"
                      ? "bg-green-950/25 text-green-400/70 border border-green-800/50"
                      : scopeStatus === "out_of_scope"
                      ? "bg-red-950/25 text-red-400/70 border border-red-900/50"
                      : "bg-amber-950/25 text-amber-400/70 border border-amber-800/50"
                  }
                  isLast
                />
              </div>
            </div>
          )}

          {/* Audit findings — hidden when blocked */}
          {showEvidence && (
            <div data-testid="audit-findings">
              <SectionLabel>Audit Findings</SectionLabel>
              <div className="space-y-3">

                {/* Blockers */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-700">
                      Blockers
                    </p>
                    {blockers.length > 0 && (
                      <span className="text-[10px] font-mono text-red-500/70 bg-red-950/15 border border-red-900/40 px-1.5 py-0.5 rounded-sm">
                        {blockers.length}
                      </span>
                    )}
                  </div>
                  {blockers.length === 0 ? (
                    <div
                      data-testid="blockers-empty"
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#1a1a1a] rounded-sm"
                    >
                      <p className="text-[11px] font-mono text-slate-700">No blockers</p>
                    </div>
                  ) : (
                    <div
                      data-testid="blockers-list"
                      className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden"
                    >
                      {blockers.map((blocker, i) => (
                        <FindingRow
                          key={blocker.id || i}
                          message={blocker.message}
                          type="blocker"
                          isLast={i === blockers.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Warnings */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-700">
                      Warnings
                    </p>
                    {warnings.length > 0 && (
                      <span className="text-[10px] font-mono text-amber-500/70 bg-amber-950/15 border border-amber-800/40 px-1.5 py-0.5 rounded-sm">
                        {warnings.length}
                      </span>
                    )}
                  </div>
                  {warnings.length === 0 ? (
                    <div
                      data-testid="warnings-empty"
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#1a1a1a] rounded-sm"
                    >
                      <p className="text-[11px] font-mono text-slate-700">No warnings</p>
                    </div>
                  ) : (
                    <div
                      data-testid="warnings-list"
                      className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden"
                    >
                      {warnings.map((warning, i) => (
                        <FindingRow
                          key={warning.id || i}
                          message={warning.message}
                          type="warning"
                          isLast={i === warnings.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Activity log */}
          <ActivityLog logs={recentLogs} />

          {/* Generated artifacts */}
          <div>
            <SectionLabel>Generated Artifacts</SectionLabel>
            {auditArtifacts.length === 0 ? (
              <div
                data-testid="artifacts-empty-state"
                className="flex items-start gap-3 px-4 py-3 border border-[#1e1e1e] rounded-sm"
              >
                <FileCode size={13} className="text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 leading-snug">
                    No audit artifacts generated yet.
                  </p>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    Audit packet, validation report, and evidence will appear
                    here after a decision is made.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden">
                {auditArtifacts.map((artifact, i) => (
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
          Right inspector panel
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
              {auditArtifacts.length === 0 ? (
                <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                  No audit artifacts yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {auditArtifacts.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1.5 border-b border-[#1c1c1c] last:border-0"
                    >
                      <FileCode size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{a.path}</span>
                      {a.type && (
                        <span className="text-[9px] font-mono text-slate-700 flex-shrink-0">
                          {a.type}
                        </span>
                      )}
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
              {validationStatus === "not_reviewed" ? (
                <p className="text-[11px] text-slate-600 text-center py-10 leading-relaxed">
                  Validation not reviewed yet.
                  <br />
                  <span className="font-mono text-slate-700">
                    Awaiting audit review.
                  </span>
                </p>
              ) : (
                <div>
                  <div className="flex items-center justify-between py-2 border-b border-[#1c1c1c]">
                    <span className="text-[10px] text-slate-600">Status</span>
                    <span
                      className={`text-[10px] font-mono ${VALIDATION_CLS[validationStatus] || "text-slate-400"}`}
                    >
                      {VALIDATION_LABEL[validationStatus]}
                    </span>
                  </div>
                  {validationReportPath && (
                    <div className="py-2 border-b border-[#1c1c1c]">
                      <p className="text-[10px] text-slate-600 mb-0.5">Report</p>
                      <p className="text-[11px] font-mono text-slate-400 break-all leading-snug">
                        {validationReportPath}
                      </p>
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-600 mb-1.5">Warnings</p>
                      <div className="space-y-1">
                        {warnings.map((w, i) => (
                          <p key={i} className="text-[10px] font-mono text-amber-400/70 leading-snug">
                            · {w.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 p-4"
              data-testid="inspector-logs-content"
            >
              {recentLogs.length === 0 ? (
                <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                  No audit logs yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 border-b border-[#1c1c1c] pb-1.5 last:border-0"
                    >
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
