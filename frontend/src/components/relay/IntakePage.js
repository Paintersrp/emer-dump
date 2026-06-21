import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  CircleDashed,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileCode,
  ClipboardCheck,
  ShieldCheck,
  ChevronDown,
  TriangleAlert,
  Ban,
} from "lucide-react";
import {
  RunPlanContextCard,
  RunPlanContextStatusPill,
  buildRunPlanContextDetailsSection,
  hasRunPlanContext,
} from "@/components/relay/RunPlanContext";

/* ─────────────────────────────────────────────────────
   Executor adapter → model dependency table
───────────────────────────────────────────────────── */
const EXECUTOR_ADAPTERS = {
  opencode_go: {
    label: "OpenCode Go",
    models: [
      { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
      { id: "deepseek-v4",       label: "DeepSeek V4" },
      { id: "claude-sonnet",     label: "Claude Sonnet" },
      { id: "gpt-4o",            label: "GPT-4o" },
    ],
  },
  codex: {
    label: "Codex",
    models: [
      { id: "gpt-4.1",      label: "GPT-4.1" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { id: "gpt-4o",       label: "GPT-4o" },
    ],
  },
  antigravity: {
    label: "Antigravity",
    models: [
      { id: "claude-opus",   label: "Claude Opus" },
      { id: "claude-sonnet", label: "Claude Sonnet" },
      { id: "gemini-pro",    label: "Gemini Pro" },
    ],
  },
};

/* ─────────────────────────────────────────────────────
   Intake pipeline step definitions
───────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    id: "handoff-loaded",
    label: "Handoff loaded",
    helperText: "Awaiting handoff artifact from the Planner.",
  },
  {
    id: "config-reviewed",
    label: "Configuration reviewed",
    helperText: "Review repository, branch, and execution profile.",
  },
  {
    id: "executor-selected",
    label: "Executor selected",
    helperText: "Select the executor adapter for this run.",
  },
  {
    id: "model-selected",
    label: "Model selected",
    helperText: "Select the target model for the executor.",
  },
  {
    id: "intake-approved",
    label: "Intake approved",
    helperText: "Approve the intake to begin Compile / Render.",
  },
];

/* ─────────────────────────────────────────────────────
   Derive pipeline step statuses from intakeStatus
───────────────────────────────────────────────────── */
function getIntakePipelineStatuses(intakeStatus) {
  switch (intakeStatus) {
    case "intake_needs_review":
      return {
        "handoff-loaded":    "success",
        "config-reviewed":   "active",
        "executor-selected": "waiting",
        "model-selected":    "waiting",
        "intake-approved":   "waiting",
      };
    case "approved":
      return {
        "handoff-loaded":    "success",
        "config-reviewed":   "success",
        "executor-selected": "success",
        "model-selected":    "success",
        "intake-approved":   "accepted",
      };
    default: // blocked
      return {
        "handoff-loaded":    "blocked",
        "config-reviewed":   "waiting",
        "executor-selected": "waiting",
        "model-selected":    "waiting",
        "intake-approved":   "waiting",
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
        badge: "In review",
        badgeCls: "bg-cyan-950/25 text-cyan-400 border border-cyan-800/50",
      };
    case "blocked":
      return {
        Icon: AlertCircle,
        iconCls: "text-amber-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Blocked",
        badgeCls: "bg-amber-950/25 text-amber-400 border border-amber-800/50",
      };
    case "accepted":
      return {
        Icon: CheckCircle2,
        iconCls: "text-green-500",
        nameCls: "text-slate-200 font-medium",
        badge: "Approved",
        badgeCls: "bg-green-950/25 text-green-400 border border-green-800/50",
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
  if (status === "active") return "bg-blue-950/5";
  if (status === "accepted") return "bg-green-950/5";
  return "";
}

function getHelperCls(status) {
  if (status === "blocked") return "text-amber-600/50";
  if (status === "accepted") return "text-green-600/50";
  return "text-blue-500/50";
}

/* ─────────────────────────────────────────────────────
   Current-state card config
───────────────────────────────────────────────────── */
const STATE_CONFIG = {
  intake_needs_review: {
    border:     "border-amber-600/60",
    bg:         "rgba(120, 53, 15, 0.06)",
    eyebrow:    "INTAKE REVIEW",
    eyebrowCls: "text-amber-600/60",
    Icon:       ClipboardCheck,
    iconCls:    "text-amber-400/80",
    title:      "Intake needs review",
    titleCls:   "text-amber-200",
    message:    "Review the handoff and configuration before approving this run.",
  },
  approved: {
    border:     "border-green-700/50",
    bg:         "rgba(21, 128, 61, 0.05)",
    eyebrow:    "INTAKE APPROVED",
    eyebrowCls: "text-green-600/60",
    Icon:       ShieldCheck,
    iconCls:    "text-green-400/80",
    title:      "Intake approved",
    titleCls:   "text-green-100",
    message:    "The run is ready for Compile / Render.",
  },
  blocked: {
    border:     "border-red-800/60",
    bg:         "rgba(127, 29, 29, 0.06)",
    eyebrow:    "INTAKE BLOCKED",
    eyebrowCls: "text-red-600/60",
    Icon:       XCircle,
    iconCls:    "text-red-400/80",
    title:      "Intake is blocked",
    titleCls:   "text-red-200",
    message:    "Resolve blocking issues before this run can proceed.",
  },
};

const ACTIVE_STEP_LABEL = {
  intake_needs_review: "Configuration reviewed",
  approved:            "Intake approved",
  blocked:             "Handoff loaded",
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
const ACTIVE_STATUSES = ["active", "blocked", "accepted"];

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
   Handoff summary row
───────────────────────────────────────────────────── */
const HandoffField = ({ label, value, valueCls, mono = true, isLast }) => (
  <div
    className={`flex items-start gap-3 px-4 py-2.5 ${!isLast ? "border-b border-[#1a1a1a]" : ""}`}
  >
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-600 mb-0.5 leading-none">{label}</p>
      <p className={`text-[12px] leading-snug ${mono ? "font-mono" : ""} ${valueCls || "text-slate-400"}`}>
        {value}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   Readiness check row
───────────────────────────────────────────────────── */
const ReadinessRow = ({ check, isLast }) => {
  const isOk   = check.status === "ok";
  const isWarn = check.status === "warn";
  const isError = check.status === "error";
  return (
    <div
      data-testid={`readiness-check-${check.id}`}
      className={`flex items-center gap-3 px-4 py-2.5 ${!isLast ? "border-b border-[#1a1a1a]" : ""}`}
    >
      {isOk   && <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />}
      {isWarn && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
      {isError && <XCircle size={12} className="text-red-500 flex-shrink-0" />}
      <p className={`text-[11px] flex-1 leading-snug ${
        isOk ? "text-slate-500" : isWarn ? "text-amber-400/70" : "text-red-400/70"
      }`}>
        {check.label}
      </p>
      <span
        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 ${
          isOk
            ? "bg-green-950/25 text-green-400/70 border border-green-800/50"
            : isWarn
            ? "bg-amber-950/25 text-amber-400/70 border border-amber-800/50"
            : "bg-red-950/25 text-red-400/70 border border-red-900/50"
        }`}
      >
        {isOk ? "OK" : isWarn ? "Warn" : "Error"}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Issue row
───────────────────────────────────────────────────── */
const IssueRow = ({ issue, isLast }) => {
  const isError = issue.type === "error";
  return (
    <div
      data-testid={`issue-row-${issue.id}`}
      className={`flex items-start gap-2.5 px-4 py-2.5 ${!isLast ? "border-b border-[#1a1a1a]" : ""}`}
    >
      {isError ? (
        <Ban size={11} className="text-red-500/70 flex-shrink-0 mt-[3px]" />
      ) : (
        <TriangleAlert size={11} className="text-amber-500/70 flex-shrink-0 mt-[3px]" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] leading-snug ${isError ? "text-red-400/80" : "text-amber-400/70"}`}>
          {issue.message}
        </p>
        {issue.category && (
          <span className="text-[10px] font-mono text-slate-700">{issue.category}</span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Styled select with chevron
───────────────────────────────────────────────────── */
const AdapterSelect = ({ label, value, options, onChange, sourceLabel, readOnly }) => (
  <div>
    <p className="text-[10px] text-slate-600 mb-1.5 uppercase tracking-wide">{label}</p>
    {readOnly ? (
      <p className="text-[12px] font-mono text-slate-300 py-1.5">
        {options.find((o) => o.id === value)?.label || value}
      </p>
    ) : (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-slate-200 text-[11px] font-mono
                     pl-2.5 pr-7 py-1.5 rounded-sm cursor-pointer appearance-none
                     focus:outline-none focus:border-[#3d3d3d] hover:border-[#333] transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-[#111]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>
    )}
    {sourceLabel && (
      <p className="text-[10px] font-mono text-slate-700 mt-0.5">{sourceLabel}</p>
    )}
  </div>
);

const formatAssociationLabel = (value) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Unavailable";

const AssociationInput = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  invalid = false,
  helperText = null,
}) => (
  <div>
    <p className="text-[10px] text-slate-600 mb-1.5 uppercase tracking-wide">{label}</p>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-[#0f0f0f] border text-slate-200 text-[11px] font-mono px-2.5 py-1.5 rounded-sm
        focus:outline-none transition-colors ${
          invalid
            ? "border-red-700/70 text-red-200 placeholder:text-red-900/70 focus:border-red-600/80"
            : disabled
            ? "border-[#1d1d1d] text-slate-600 placeholder:text-slate-800 cursor-not-allowed"
            : "border-[#2a2a2a] hover:border-[#333] focus:border-[#3d3d3d]"
        }`}
    />
    {helperText && (
      <p className={`mt-1 text-[10px] font-mono leading-snug ${invalid ? "text-red-400/80" : "text-slate-700"}`}>
        {helperText}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────
   Current-state card (adapts to intakeStatus)
───────────────────────────────────────────────────── */
const StateCard = ({
  intakeStatus,
  blockingReason,
  onApprove,
  onNeedsRevision,
  onBlockRun,
  onProceedToCompileRender,
  approveLabel = "Approve Intake",
  approveDisabled = false,
  actionNotice = null,
  showSecondaryActions = true,
}) => {
  const cfg = STATE_CONFIG[intakeStatus] || STATE_CONFIG.blocked;
  const { Icon } = cfg;

  return (
    <div
      data-testid="intake-state-card"
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

        {/* Approved CTA */}
        {intakeStatus === "approved" && (
          <div className="flex-shrink-0">
            <Button
              data-testid="proceed-to-compile-btn"
              size="sm"
              onClick={onProceedToCompileRender}
              className="bg-green-600/15 border border-green-600/40 text-green-300 hover:bg-green-600/25 hover:text-green-200 hover:border-green-500/60 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
            >
              Proceed to Compile / Render
              <ArrowRight size={11} />
            </Button>
          </div>
        )}
      </div>

      {/* Decision buttons — intake_needs_review state only */}
      {intakeStatus === "intake_needs_review" && (
        <div
          className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1e1e1e] flex-wrap"
          data-testid="intake-action-buttons"
        >
          <Button
            data-testid="approve-intake-btn"
            size="sm"
            onClick={onApprove}
            disabled={approveDisabled}
            className={`text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium ${
              approveDisabled
                ? "bg-green-600/10 border border-green-900/40 text-green-500/40 cursor-not-allowed"
                : "bg-green-600/15 border border-green-600/40 text-green-300 hover:bg-green-600/25 hover:text-green-200 hover:border-green-500/60"
            }`}
          >
            {approveLabel}
          </Button>
          {showSecondaryActions && (
            <>
              <Button
                data-testid="needs-revision-btn"
                size="sm"
                onClick={onNeedsRevision}
                className="bg-amber-600/10 border border-amber-600/40 text-amber-300 hover:bg-amber-600/20 hover:text-amber-200 hover:border-amber-500/60 text-[11px] h-7 px-3 rounded-sm shadow-none gap-1.5 font-medium"
              >
                Needs Revision
              </Button>
              <Button
                data-testid="block-run-btn"
                size="sm"
                variant="outline"
                onClick={onBlockRun}
                className="border-red-800/40 text-red-400/80 hover:bg-red-950/20 hover:text-red-300 hover:border-red-700/60 text-[11px] h-7 px-3 rounded-sm bg-transparent shadow-none gap-1.5 font-medium"
              >
                Block Run
              </Button>
            </>
          )}
          {actionNotice && (
            <p className="basis-full text-[11px] text-red-400/80 leading-snug">
              {actionNotice}
            </p>
          )}
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
          No intake activity yet.
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
   Preflight badge helper
───────────────────────────────────────────────────── */
const formatRunState = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ─────────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────────── */

/**
 * IntakePage — Drop-in Relay Intake stage component.
 *
 * Props:
 *   runState, packetId, repo, branch, worktree
 *   executionProfile, targetModel
 *
 *   intakeStatus       – "intake_needs_review" | "approved" | "blocked"
 *   blockingReason     – string | null
 *
 *   handoffTitle       – string | null
 *   handoffArtifact    – string | null
 *   handoffSummary     – string | null
 *   handoffSource      – string | null
 *   createdBy          – string | null
 *
 *   readinessChecks    – Array<{ id, label, status: "ok"|"warn"|"error" }>
 *   currentIssues      – Array<{ id, message, type: "warning"|"error", category? }>
 *
 *   intakeArtifacts    – Array<{ path: string, type?: string }>
 *   recentLogs         – Array<{ timestamp: string, message: string, level?: string }>
 *
 *   onApprove                – () => void
 *   onNeedsRevision          – () => void
 *   onBlockRun               – () => void
 *   onProceedToCompileRender – () => void
 */
export default function IntakePage({
  pageMode = "intake",
  pageTitle = "Intake",
  pageDescription = "Review the Planner handoff, confirm run configuration, and approve the run for Compile / Render.",
  showPlanAssociation = false,
  primaryActionLabel = "Approve Intake",
  showSecondaryActions = true,
  initialAssociation = null,
  resolveAssociationContext = null,
  runPlanContext = null,
  runState = "intake_needs_review",
  packetId = "packet-99",
  repo = "relay",
  branch = "main",
  worktree = "default",
  executionProfile = "opencode_go",
  targetModel = "deepseek-v4-flash",

  intakeStatus = "intake_needs_review",
  blockingReason = null,

  handoffTitle = null,
  handoffArtifact = null,
  handoffSummary = null,
  handoffSource = null,
  createdBy = null,

  readinessChecks = [],
  currentIssues = [],

  intakeArtifacts = [],
  recentLogs = [],

  onApprove = () => {},
  onNeedsRevision = () => {},
  onBlockRun = () => {},
  onProceedToCompileRender = () => {},
}) {
  const [tab, setTab] = useState("details");
  const isNewRunPage = pageMode === "new_run";
  const initialPlanId = initialAssociation?.planId?.trim?.() || "";
  const initialPassId = initialAssociation?.passId?.trim?.() || "";
  const [associationOpen, setAssociationOpen] = useState(Boolean(initialPlanId || initialPassId));
  const [associationEnabled, setAssociationEnabled] = useState(Boolean(initialPlanId || initialPassId));
  const [planIdInput, setPlanIdInput] = useState(initialPlanId);
  const [passIdInput, setPassIdInput] = useState(initialPassId);

  /* Adapter / model are locally controlled — allow override during review */
  const [selectedAdapter, setSelectedAdapter] = useState(
    executionProfile || "opencode_go"
  );
  const [selectedModel, setSelectedModel] = useState(
    targetModel || "deepseek-v4-flash"
  );

  const adapterModels = EXECUTOR_ADAPTERS[selectedAdapter]?.models || [];
  const isReviewable = intakeStatus === "intake_needs_review";
  const normalizedPlanId = planIdInput.trim();
  const normalizedPassId = passIdInput.trim();
  const associationError =
    showPlanAssociation && associationEnabled && normalizedPassId && !normalizedPlanId
      ? "passId cannot be submitted without planId. Clear passId or supply a plan first."
      : null;
  const associationContext =
    showPlanAssociation && associationEnabled && typeof resolveAssociationContext === "function"
      ? resolveAssociationContext(normalizedPlanId, normalizedPassId)
      : {
          plan: null,
          pass: null,
          hasPlanLookup: Boolean(normalizedPlanId),
          hasPassLookup: Boolean(normalizedPassId),
        };
  const associationPlan = associationContext?.plan || null;
  const associationPass = associationContext?.pass || null;
  const associationModeLabel =
    associationEnabled && normalizedPlanId
      ? normalizedPassId
        ? "Plan + pass association"
        : "Plan association"
      : "Standalone run";
  const submissionPayload = {
    repo,
    branch,
    worktree,
    executionProfile: selectedAdapter,
    targetModel: selectedModel,
    ...(showPlanAssociation && associationEnabled && normalizedPlanId ? { planId: normalizedPlanId } : {}),
    ...(showPlanAssociation && associationEnabled && normalizedPlanId && normalizedPassId ? { passId: normalizedPassId } : {}),
  };

  const handleAdapterChange = (newAdapter) => {
    setSelectedAdapter(newAdapter);
    const firstModel = EXECUTOR_ADAPTERS[newAdapter]?.models[0]?.id;
    if (firstModel) setSelectedModel(firstModel);
  };

  const handleApprove = () => {
    if (associationError) return;
    onApprove(submissionPayload);
  };

  const pipelineStatuses = getIntakePipelineStatuses(intakeStatus);

  /* Stage heading badge color */
  const statusBadgeCls =
    intakeStatus === "approved"
      ? "bg-green-500/10 text-green-500/80 border-green-700/30"
      : intakeStatus === "blocked"
      ? "bg-red-900/20 text-red-400/80 border-red-800/30"
      : "bg-amber-500/10 text-amber-500/80 border-amber-700/30";

  /* Show content sections only when not blocked */
  const showContent = intakeStatus !== "blocked";

  /* Readiness preflight summary */
  const passedChecks = readinessChecks.filter((c) => c.status === "ok").length;
  const totalChecks  = readinessChecks.length;
  const runPlanContextSection = buildRunPlanContextDetailsSection(runPlanContext);
  const showRunPlanContextCard = !showPlanAssociation && hasRunPlanContext(runPlanContext);

  /* Inspector detail sections */
  const selectedAdapterLabel =
    EXECUTOR_ADAPTERS[selectedAdapter]?.label || selectedAdapter;
  const selectedModelLabel =
    EXECUTOR_ADAPTERS[selectedAdapter]?.models.find((m) => m.id === selectedModel)
      ?.label || selectedModel;

  const detailsSections = [
    {
      title: "Run State",
      rows: [
        {
          label: "Status",
          value: formatRunState(runState),
          valueCls:
            intakeStatus === "approved"
              ? "text-green-400"
              : intakeStatus === "blocked"
              ? "text-red-400"
              : "text-amber-400",
        },
        {
          label: "Active step",
          value: ACTIVE_STEP_LABEL[intakeStatus] || "—",
          valueCls: "text-slate-400",
        },
      ],
    },
    {
      title: "Handoff",
      rows: [
        {
          label: "Title",
          value: handoffTitle || "Not loaded",
          valueCls: handoffTitle ? "text-slate-300" : "text-slate-600",
          mono: false,
        },
        {
          label: "Artifact",
          value: handoffArtifact || "Not available",
          valueCls: handoffArtifact ? "text-slate-400" : "text-slate-600",
        },
        {
          label: "Packet ID",
          value: packetId,
          valueCls: "text-slate-400",
        },
      ],
    },
    {
      title: "Configuration",
      rows: [
        { label: "Repository",        value: repo,    valueCls: "text-slate-400" },
        { label: "Branch",            value: branch,  valueCls: "text-slate-400" },
        { label: "Worktree",          value: worktree, valueCls: "text-slate-400" },
        { label: "Execution profile", value: selectedAdapter, valueCls: "text-slate-400" },
      ],
    },
    ...(runPlanContextSection ? [runPlanContextSection] : []),
    ...(showPlanAssociation
      ? [
          {
            title: "Association",
            rows: [
              {
                label: "Mode",
                value: associationModeLabel,
                valueCls: associationError
                  ? "text-red-400"
                  : associationEnabled
                  ? "text-cyan-400"
                  : "text-slate-600",
                mono: false,
              },
              ...(associationEnabled && normalizedPlanId
                ? [
                    {
                      label: "Plan ID",
                      value: normalizedPlanId,
                      valueCls: associationPlan ? "text-slate-400" : "text-amber-400/80",
                    },
                    {
                      label: "Plan",
                      value: associationPlan?.title || "Plan details unavailable",
                      valueCls: associationPlan ? "text-slate-300" : "text-amber-400/80",
                      mono: false,
                    },
                  ]
                : []),
              ...(associationEnabled && normalizedPassId
                ? [
                    {
                      label: "Pass ID",
                      value: normalizedPassId,
                      valueCls: associationPass ? "text-slate-400" : "text-amber-400/80",
                    },
                    {
                      label: "Pass",
                      value: associationPass?.name || "Pass details unavailable",
                      valueCls: associationPass ? "text-slate-300" : "text-amber-400/80",
                      mono: false,
                    },
                    {
                      label: "Pass Status",
                      value: associationPass?.status ? formatAssociationLabel(associationPass.status) : "Status unavailable",
                      valueCls: associationPass?.status ? "text-cyan-400" : "text-amber-400/80",
                      mono: false,
                    },
                  ]
                : []),
              ...(associationEnabled && associationPlan?.repo
                ? [
                    {
                      label: "Repo / Branch",
                      value: `${associationPlan.repo}${associationPlan.branch ? ` · ${associationPlan.branch}` : ""}`,
                      valueCls: "text-slate-400",
                      mono: false,
                    },
                  ]
                : []),
              ...(associationError
                ? [
                    {
                      label: "Validation",
                      value: associationError,
                      valueCls: "text-red-400/80",
                      mono: false,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    {
      title: "Executor",
      rows: [
        { label: "Adapter",       value: selectedAdapterLabel, valueCls: "text-slate-400" },
        { label: "Target model",  value: selectedModelLabel,   valueCls: "text-slate-400" },
      ],
    },
    {
      title: "Approval",
      rows: [
        {
          label: "Approval state",
          value:
            intakeStatus === "approved"
              ? "Approved"
              : intakeStatus === "blocked"
              ? "Blocked"
              : "Not approved",
          valueCls:
            intakeStatus === "approved"
              ? "text-green-400"
              : intakeStatus === "blocked"
              ? "text-red-400"
              : "text-slate-600",
          mono: false,
        },
        {
          label: "Blocking reason",
          value:
            blockingReason ||
            (intakeStatus === "blocked" ? "Unknown block" : "No blockers"),
          valueCls: blockingReason ? "text-red-400/80" : "text-slate-600",
        },
      ],
      isLast: true,
    },
  ];

  return (
    <div
      className="flex flex-1 min-h-0 overflow-hidden"
      data-testid="intake-page"
    >
      {/* ─────────────────────────────────────────
          Main content pane
      ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-6 pt-5 pb-8 space-y-5 max-w-3xl">

          {/* Stage header */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2
                className="text-base font-semibold text-slate-100 tracking-tight"
                data-testid="stage-heading"
              >
                {pageTitle}
              </h2>
              <span
                data-testid="stage-run-state-badge"
                className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-sm whitespace-nowrap ${statusBadgeCls}`}
              >
                {formatRunState(runState)}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {pageDescription}
            </p>
          </div>

          {/* Current state card */}
          <StateCard
            intakeStatus={intakeStatus}
            blockingReason={blockingReason}
            onApprove={handleApprove}
            onNeedsRevision={onNeedsRevision}
            onBlockRun={onBlockRun}
            onProceedToCompileRender={onProceedToCompileRender}
            approveLabel={primaryActionLabel}
            approveDisabled={Boolean(associationError)}
            actionNotice={associationError}
            showSecondaryActions={showSecondaryActions}
          />

          {showRunPlanContextCard && (
            <div>
              <SectionLabel>Managed Context</SectionLabel>
              <RunPlanContextCard runPlanContext={runPlanContext} />
            </div>
          )}

          {/* Intake pipeline */}
          <div>
            <SectionLabel>Intake Pipeline</SectionLabel>
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

          {/* Handoff summary — hidden when blocked */}
          {showContent && (
            <div>
              <SectionLabel>Handoff Summary</SectionLabel>
              <div
                data-testid="handoff-summary"
                className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden"
              >
                <HandoffField
                  label="Title"
                  value={handoffTitle || "Not loaded"}
                  valueCls={handoffTitle ? "text-slate-200" : "text-slate-600"}
                  mono={false}
                />
                {handoffSummary && (
                  <HandoffField
                    label="Intent"
                    value={handoffSummary}
                    valueCls="text-slate-400"
                    mono={false}
                  />
                )}
                <HandoffField
                  label="Handoff artifact"
                  value={handoffArtifact || "Not available"}
                  valueCls={handoffArtifact ? "text-slate-400" : "text-slate-600"}
                />
                {handoffSource && (
                  <HandoffField
                    label="Source"
                    value={handoffSource}
                    valueCls="text-slate-400"
                  />
                )}
                {createdBy && (
                  <HandoffField
                    label="Created by"
                    value={createdBy}
                    valueCls="text-slate-400"
                    isLast
                  />
                )}
                {!createdBy && (
                  <HandoffField
                    label="Packet ID"
                    value={packetId}
                    valueCls="text-slate-400"
                    isLast
                  />
                )}
              </div>
            </div>
          )}

          {/* Run configuration — hidden when blocked */}
          {showContent && (
            <div>
              <SectionLabel>Run Configuration</SectionLabel>
              <div
                data-testid="run-configuration"
                className="border border-[#1e1e1e] rounded-sm overflow-hidden"
              >
                {/* Description row */}
                <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0d0d0d]">
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Adjust execution target details before {isNewRunPage ? "creating the run" : "approving the intake"}.
                    Provenance is shown inline with each control.
                  </p>
                </div>

                {showPlanAssociation && (
                  <div className="border-b border-[#1a1a1a]">
                    <button
                      type="button"
                      onClick={() => setAssociationOpen((open) => !open)}
                      className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left hover:bg-[#101010] transition-colors"
                      data-testid="associate-plan-toggle"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-medium text-slate-200">Associate with Plan</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-[#2a2a2a] text-slate-500">
                            Optional
                          </span>
                          {associationEnabled && (normalizedPlanId || normalizedPassId) && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-cyan-800/40 bg-cyan-950/20 text-cyan-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-[11px] leading-snug ${
                          associationError
                            ? "text-red-400/80"
                            : associationEnabled
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}>
                          {associationEnabled
                            ? normalizedPassId
                              ? `Pass-associated run: ${normalizedPlanId || "plan?"} / ${normalizedPassId}`
                              : normalizedPlanId
                              ? `Plan-associated run: ${normalizedPlanId}`
                              : "Association enabled. Supply a planId and optional passId."
                            : "Standalone run (default). Expand to add managed plan/pass context."}
                        </p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`mt-0.5 flex-shrink-0 transition-transform ${
                          associationOpen ? "rotate-180 text-slate-400" : "text-slate-600"
                        }`}
                      />
                    </button>

                    {associationOpen && (
                      <div
                        className={`px-4 py-3 space-y-3 ${
                          associationError
                            ? "bg-red-950/10"
                            : associationEnabled
                            ? "bg-[#0d1014]"
                            : "bg-[#0b0b0b]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <p className={`text-[11px] font-medium ${
                              associationError
                                ? "text-red-300"
                                : associationEnabled
                                ? "text-cyan-300"
                                : "text-slate-500"
                            }`}>
                              {associationEnabled ? "Association enabled" : "Association inactive"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                              Creating a run for a pass moves that pass to in progress.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAssociationEnabled((enabled) => !enabled)}
                            className={`text-[10px] font-mono px-2.5 py-1.5 rounded-sm border transition-colors ${
                              associationEnabled
                                ? "border-cyan-800/40 bg-cyan-950/20 text-cyan-300 hover:border-cyan-700/60"
                                : "border-[#2a2a2a] text-slate-500 hover:border-[#3a3a3a] hover:text-slate-300"
                            }`}
                            data-testid="associate-plan-enable"
                          >
                            {associationEnabled ? "Use standalone run" : "Enable association"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <AssociationInput
                            label="planId"
                            value={planIdInput}
                            onChange={setPlanIdInput}
                            placeholder="plan-123"
                            disabled={!associationEnabled}
                            helperText={associationEnabled ? "Managed plan identifier." : "Association disabled."}
                          />
                          <AssociationInput
                            label="passId"
                            value={passIdInput}
                            onChange={setPassIdInput}
                            placeholder="pass-001"
                            disabled={!associationEnabled}
                            invalid={Boolean(associationError)}
                            helperText={
                              associationError
                                ? "passId requires planId."
                                : associationEnabled
                                ? "Optional pass identifier within the selected plan."
                                : "Association disabled."
                            }
                          />
                        </div>

                        {associationEnabled && (normalizedPlanId || normalizedPassId) && (
                          <div
                            className={`rounded-sm border overflow-hidden ${
                              associationError
                                ? "border-red-800/60 bg-red-950/10"
                                : "border-cyan-900/40 bg-cyan-950/10"
                            }`}
                            data-testid="association-context-card"
                          >
                            <div className="px-3 py-2 border-b border-[#1d2430] flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                  associationError ? "text-red-400/80" : "text-cyan-400/80"
                                }`}>
                                  Plan Context
                                </p>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                  {normalizedPassId
                                    ? "Selected pass association preview."
                                    : "Selected plan association preview."}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-amber-800/40 bg-amber-950/20 text-amber-300 whitespace-nowrap">
                                {normalizedPassId ? "plan + pass" : "plan only"}
                              </span>
                            </div>

                            <div className="px-3 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
                              <div>
                                <p className="text-[10px] text-slate-600 mb-0.5">Plan</p>
                                <p className={`text-[11px] leading-snug ${
                                  associationPlan ? "text-slate-200" : "text-amber-400/80"
                                }`}>
                                  {associationPlan?.title || "Plan details unavailable for provided planId."}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-600 mb-0.5">planId</p>
                                <p className="text-[11px] font-mono text-slate-300">
                                  {normalizedPlanId || "Not provided"}
                                </p>
                              </div>

                              {normalizedPassId && (
                                <>
                                  <div>
                                    <p className="text-[10px] text-slate-600 mb-0.5">Pass</p>
                                    <p className={`text-[11px] leading-snug ${
                                      associationPass ? "text-slate-200" : "text-amber-400/80"
                                    }`}>
                                      {associationPass?.name || "Pass details unavailable for provided passId."}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-600 mb-0.5">passId</p>
                                    <p className="text-[11px] font-mono text-slate-300">
                                      {normalizedPassId}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-600 mb-0.5">Pass status</p>
                                    {associationPass?.status ? (
                                      <RunPlanContextStatusPill status={associationPass.status} />
                                    ) : (
                                      <p className="text-[11px] text-amber-400/80">Status unavailable</p>
                                    )}
                                  </div>
                                </>
                              )}

                              <div className={normalizedPassId ? "" : "col-span-2"}>
                                <p className="text-[10px] text-slate-600 mb-0.5">Repo / Branch</p>
                                <p className={`text-[11px] leading-snug ${
                                  associationPlan?.repo || associationPlan?.branch
                                    ? "text-slate-300"
                                    : "text-amber-400/80"
                                }`}>
                                  {associationPlan?.repo || associationPlan?.branch
                                    ? `${associationPlan?.repo || "repo unavailable"} / ${associationPlan?.branch || "branch unavailable"}`
                                    : "Repository and branch unavailable for supplied IDs."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Adapter + model selectors */}
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-4 border-b border-[#1a1a1a]">
                  <AdapterSelect
                    label="Execution Profile"
                    value={selectedAdapter}
                    options={Object.entries(EXECUTOR_ADAPTERS).map(([id, a]) => ({
                      id,
                      label: a.label,
                    }))}
                    onChange={handleAdapterChange}
                    sourceLabel="Source: current run value"
                    readOnly={!isReviewable}
                  />
                  <AdapterSelect
                    label="Target Model"
                    value={selectedModel}
                    options={adapterModels}
                    onChange={setSelectedModel}
                    sourceLabel="Source: current run value"
                    readOnly={!isReviewable}
                  />
                </div>

                {/* Read-only repository context */}
                <div className="px-4 py-2.5 grid grid-cols-3 gap-x-4">
                  <div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Repository</p>
                    <p className="text-[11px] font-mono text-slate-400">{repo}</p>
                    <p className="text-[10px] font-mono text-slate-700">explicit MCP arg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Branch</p>
                    <p className="text-[11px] font-mono text-slate-400">{branch}</p>
                    <p className="text-[10px] font-mono text-slate-700">explicit MCP arg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Worktree</p>
                    <p className="text-[11px] font-mono text-slate-400">{worktree}</p>
                    <p className="text-[10px] font-mono text-slate-700">default</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Readiness checks — shown when not blocked and checks exist */}
          {showContent && readinessChecks.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <SectionLabel>Readiness</SectionLabel>
                {totalChecks > 0 && (
                  <span
                    data-testid="preflight-badge"
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm mb-2 ${
                      passedChecks === totalChecks
                        ? "bg-green-950/25 text-green-400/70 border border-green-800/50"
                        : "bg-amber-950/25 text-amber-400/70 border border-amber-800/50"
                    }`}
                  >
                    PREFLIGHT {passedChecks}/{totalChecks} checks OK
                  </span>
                )}
              </div>
              <div
                data-testid="readiness-checks"
                className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden"
              >
                {readinessChecks.map((check, i) => (
                  <ReadinessRow
                    key={check.id}
                    check={check}
                    isLast={i === readinessChecks.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Current issues — show when not blocked and issues exist */}
          {showContent && currentIssues.length > 0 && (
            <div data-testid="current-issues">
              <div className="flex items-center gap-2 mb-2">
                <SectionLabel>Current Issues</SectionLabel>
                <span className="text-[10px] font-mono text-amber-500/70 bg-amber-950/15 border border-amber-800/40 px-1.5 py-0.5 rounded-sm mb-2">
                  {currentIssues.length}
                </span>
              </div>
              <div className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden">
                {currentIssues.map((issue, i) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    isLast={i === currentIssues.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          <ActivityLog logs={recentLogs} />

          {/* Generated artifacts */}
          <div>
            <SectionLabel>Intake Artifacts</SectionLabel>
            {intakeArtifacts.length === 0 ? (
              <div
                data-testid="artifacts-empty-state"
                className="flex items-start gap-3 px-4 py-3 border border-[#1e1e1e] rounded-sm"
              >
                <FileCode size={13} className="text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 leading-snug">
                    No intake artifacts generated yet.
                  </p>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    Intake packet and handoff artifact will appear here after
                    approval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a] border border-[#1e1e1e] rounded-sm overflow-hidden">
                {intakeArtifacts.map((artifact, i) => (
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
        className="w-72 border-l border-[#1e1e1e] bg-[#0b0b0b] flex flex-col flex-shrink-0 overflow-hidden"
        data-testid="inspector-panel"
      >
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
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

          <div className="flex-1 overflow-y-auto">

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
              {intakeArtifacts.length === 0 && !handoffArtifact ? (
                <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                  No intake artifacts yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {handoffArtifact && (
                    <div className="flex items-center gap-2 py-1.5 border-b border-[#1c1c1c]">
                      <FileCode size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {handoffArtifact}
                      </span>
                      <span className="text-[9px] font-mono text-slate-700 flex-shrink-0">
                        handoff
                      </span>
                    </div>
                  )}
                  {intakeArtifacts.map((a, i) => (
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
              {readinessChecks.length === 0 ? (
                <p className="text-[11px] text-slate-600 text-center py-10 leading-relaxed">
                  Readiness not evaluated yet.
                  <br />
                  <span className="font-mono text-slate-700">
                    Awaiting handoff load.
                  </span>
                </p>
              ) : (
                <div>
                  {totalChecks > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-[#1c1c1c] mb-2">
                      <span className="text-[10px] text-slate-600">Preflight</span>
                      <span
                        className={`text-[10px] font-mono ${
                          passedChecks === totalChecks
                            ? "text-green-400"
                            : "text-amber-400"
                        }`}
                      >
                        {passedChecks}/{totalChecks} passed
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {readinessChecks.map((check, i) => (
                      <div
                        key={check.id}
                        className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c] last:border-0"
                      >
                        <span className="text-[10px] text-slate-500">
                          {check.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            check.status === "ok"
                              ? "text-green-400/70"
                              : check.status === "warn"
                              ? "text-amber-400/70"
                              : "text-red-400/70"
                          }`}
                        >
                          {check.status === "ok"
                            ? "OK"
                            : check.status === "warn"
                            ? "Warn"
                            : "Error"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {currentIssues.length > 0 && (
                    <div className="pt-3 mt-1">
                      <p className="text-[10px] text-slate-600 mb-1.5">Issues</p>
                      <div className="space-y-1">
                        {currentIssues.map((issue, i) => (
                          <p
                            key={issue.id}
                            className={`text-[10px] font-mono leading-snug ${
                              issue.type === "error"
                                ? "text-red-400/80"
                                : "text-amber-400/70"
                            }`}
                          >
                            · {issue.message}
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
                  No intake logs yet.
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
