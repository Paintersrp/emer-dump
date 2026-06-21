import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  CircleDashed,
  Minus,
  FileCode,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { buildRunPlanContextDetailsSection } from "@/components/relay/RunPlanContext";

/* ─────────────────────────────────────────────────────
   Pipeline definitions
───────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    id: "compile",
    label: "Compile packet",
    helperText: "Compile becomes available after Intake approval.",
  },
  {
    id: "packet-validation",
    label: "Packet validation",
  },
  {
    id: "repair",
    label: "Repair",
    naNote: "Becomes relevant only if validation fails.",
  },
  {
    id: "render-brief",
    label: "Render executor brief",
  },
  {
    id: "brief-validation",
    label: "Brief validation",
  },
  {
    id: "approval",
    label: "Approval",
  },
];

/* ─────────────────────────────────────────────────────
   Status visual config
   — waiting steps intentionally have no badge:
     the muted icon + label already communicates state.
───────────────────────────────────────────────────── */
function getStepConfig(status) {
  switch (status) {
    case "blocked":
      return {
        Icon: AlertCircle,
        iconCls: "text-amber-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Blocked",
        badgeCls:
          "bg-amber-950/25 text-amber-400 border border-amber-800/50",
      };
    case "na":
      return {
        Icon: Minus,
        iconCls: "text-slate-700",
        nameCls: "text-slate-700",
        badge: null, // shown via naNote inline
        badgeCls: null,
      };
    case "success":
      return {
        Icon: CheckCircle2,
        iconCls: "text-cyan-400",
        nameCls: "text-slate-100 font-medium",
        badge: "Complete",
        badgeCls:
          "bg-cyan-950/25 text-cyan-400 border border-cyan-800/50",
      };
    default: // waiting — no badge, muted state communicates it
      return {
        Icon: CircleDashed,
        iconCls: "text-slate-700",
        nameCls: "text-slate-600",
        badge: null,
        badgeCls: null,
      };
  }
}

/* ─────────────────────────────────────────────────────
   Inspector KV row — stacked label / value
───────────────────────────────────────────────────── */
const KVRow = ({ label, value, valueCls, mono = true, isLast = false }) => (
  <div className={`py-2 ${!isLast ? "border-b border-[#1c1c1c]" : ""}`}>
    <p className="text-[10px] text-slate-600 mb-0.5 leading-none tracking-wide">
      {label}
    </p>
    <p
      className={`text-[11px] leading-snug ${mono ? "font-mono" : ""} ${
        valueCls || "text-slate-400"
      }`}
    >
      {value || "—"}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────
   Inspector section group
───────────────────────────────────────────────────── */
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
   Blocker card — left-accent, eyebrow, dominant title
───────────────────────────────────────────────────── */
const BlockerCard = ({ onReturnToIntake }) => (
  <div
    data-testid="prepare-blocker-card"
    className="border-l-2 border-amber-600/60 bg-amber-950/8 rounded-r-sm pl-4 pr-4 py-3"
    style={{ background: "rgba(120, 53, 15, 0.06)" }}
  >
    {/* Eyebrow */}
    <p className="text-[10px] font-mono uppercase tracking-widest text-amber-600/60 mb-1.5">
      Current blocker
    </p>

    {/* Body row */}
    <div className="flex items-start justify-between gap-6">
      <div className="flex items-start gap-2.5 min-w-0">
        <AlertTriangle
          size={14}
          className="text-amber-400/80 flex-shrink-0 mt-0.5"
        />
        <div>
          <p
            className="text-[15px] font-semibold text-amber-200 leading-tight mb-0.5"
            data-testid="blocker-title"
          >
            Prepare is blocked
          </p>
          <p
            className="text-xs text-slate-400"
            data-testid="blocker-message"
          >
            Approve Intake before compile can run.
          </p>
        </div>
      </div>

      <Button
        data-testid="return-to-intake-btn"
        size="sm"
        variant="outline"
        onClick={onReturnToIntake}
        className="border-amber-700/40 text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-300 hover:border-amber-600/60 text-[11px] h-7 px-3 rounded-sm flex-shrink-0 bg-transparent shadow-none gap-1.5 font-medium"
      >
        Return to Intake Review
        <ArrowRight size={11} />
      </Button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   Pipeline step row
   — active (blocked) step: expanded with helper text
   — waiting steps: muted, no badge pill
   — na step: very muted, inline note
───────────────────────────────────────────────────── */
const PipelineStep = ({ step, status, isLast }) => {
  const cfg = getStepConfig(status);
  const { Icon } = cfg;
  const isBlocked = status === "blocked";
  const isNA = status === "na";

  return (
    <div
      data-testid={`pipeline-step-${step.id}`}
      className={`flex items-start gap-3 px-4 ${
        isBlocked ? "py-3 bg-amber-950/5" : "py-2"
      } ${!isLast ? "border-b border-[#1a1a1a]" : ""} transition-colors`}
    >
      {/* Icon */}
      <Icon
        size={isBlocked ? 14 : 13}
        className={`${cfg.iconCls} flex-shrink-0 mt-[3px]`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <span className={`leading-tight ${isBlocked ? "text-[13px]" : "text-xs"} ${cfg.nameCls}`}>
            {step.label}
          </span>

          {/* Badge: only for blocked and success */}
          {cfg.badge && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 whitespace-nowrap ${cfg.badgeCls}`}
            >
              {cfg.badge}
            </span>
          )}

          {/* N/A inline indicator */}
          {isNA && (
            <span className="text-[10px] font-mono text-slate-800 flex-shrink-0">
              n/a
            </span>
          )}
        </div>

        {/* Helper text for active blocked step only */}
        {isBlocked && step.helperText && (
          <p className="text-[11px] text-amber-600/50 font-mono mt-1 leading-snug">
            {step.helperText}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Section label (main pane)
───────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
    {children}
  </p>
);

/* ─────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────── */

/**
 * CompileRenderPage — Drop-in Relay Prepare stage component.
 *
 * Props:
 *   runState               – e.g. "intake_needs_review"
 *   packetId               – e.g. "packet-99"
 *   repo / branch / worktree
 *   executionProfile       – e.g. "opencode_go"
 *   targetModel            – e.g. "deepseek-v4-flash"
 *   compileStatus          – "blocked" | "pending" | "running" | "success" | "failed"
 *   packetValidationStatus – "waiting" | "running" | "passed" | "failed"
 *   repairStatus           – "na" | "waiting" | "running" | "success" | "failed"
 *   briefStatus            – "waiting" | "running" | "generated" | "failed"
 *   briefValidationStatus  – "waiting" | "running" | "passed" | "failed"
 *   approvalStatus         – "waiting" | "approved" | "rejected"
 *   artifacts              – Array<{ path: string }>
 *   onReturnToIntake       – () => void
 */
export default function CompileRenderPage({
  runState = "intake_needs_review",
  packetId = "packet-99",
  repo = "relay",
  branch = "main",
  worktree = "default",
  executionProfile = "opencode_go",
  targetModel = "deepseek-v4-flash",
  runPlanContext = null,
  compileStatus = "blocked",
  packetValidationStatus = "waiting",
  repairStatus = "na",
  briefStatus = "waiting",
  briefValidationStatus = "waiting",
  approvalStatus = "waiting",
  artifacts = [],
  onReturnToIntake = () => {},
}) {
  const [tab, setTab] = useState("details");
  const runPlanContextSection = buildRunPlanContextDetailsSection(runPlanContext);

  const stepStatuses = {
    "compile":           compileStatus,
    "packet-validation": packetValidationStatus,
    "repair":            repairStatus,
    "render-brief":      briefStatus,
    "brief-validation":  briefValidationStatus,
    "approval":          approvalStatus,
  };

  const detailsSections = [
    {
      title: "Run State",
      rows: [
        { label: "Status",           value: runState,          valueCls: "text-amber-400" },
        { label: "Active step",      value: "—",               valueCls: "text-slate-700" },
        { label: "Executor adapter", value: executionProfile,  valueCls: "text-slate-400" },
        { label: "Selected model",   value: targetModel,       valueCls: "text-slate-400" },
      ],
    },
    ...(runPlanContextSection ? [runPlanContextSection] : []),
    {
      title: "Compiled Packet",
      rows: [
        { label: "Canonical packet",  value: "Not generated",      valueCls: "text-slate-600" },
        { label: "Validation status", value: "Waiting on compile", valueCls: "text-slate-600" },
        { label: "Validation report", value: "Waiting on compile", valueCls: "text-slate-600" },
      ],
    },
    {
      title: "Repair",
      rows: [
        { label: "Eligibility",          value: "Not applicable yet", valueCls: "text-slate-600" },
        { label: "Latest repair result", value: "Not applicable yet", valueCls: "text-slate-600" },
      ],
    },
    {
      title: "Executor Brief",
      rows: [
        { label: "Brief artifact",    value: "Not generated",             valueCls: "text-slate-600" },
        { label: "Validation status", value: "Waiting on rendered brief", valueCls: "text-slate-600" },
        { label: "Validation report", value: "Waiting on rendered brief", valueCls: "text-slate-600" },
      ],
    },
    {
      title: "Approval",
      rows: [
        { label: "Approval state", value: "Waiting on validated brief", valueCls: "text-slate-600" },
      ],
      isLast: true,
    },
  ];

  return (
    <div
      className="flex flex-1 min-h-0 overflow-hidden"
      data-testid="compile-render-page"
    >
      {/* ─────────────────────────────────────────────
          Main content pane
      ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-6 pt-5 pb-8 space-y-5 max-w-3xl">

          {/* ── Stage header ──────────────────────── */}
          <div>
            {/* Title + inline state badge */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2
                className="text-base font-semibold text-slate-100 tracking-tight"
                data-testid="stage-heading"
              >
                Compile / Render
              </h2>
              <span
                data-testid="stage-run-state-badge"
                className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-500/80 border border-amber-700/30 rounded-sm whitespace-nowrap"
              >
                {runState}
              </span>
            </div>
            {/* Subtitle */}
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile the canonical packet, validate it, render the executor
              brief, and approve for execution.
            </p>
          </div>

          {/* ── Blocker card ──────────────────────── */}
          <BlockerCard onReturnToIntake={onReturnToIntake} />

          {/* ── Pipeline ──────────────────────────── */}
          <div>
            <SectionLabel>Pipeline</SectionLabel>
            {/* No outer border — dividers only between steps */}
            <div
              className="divide-y divide-[#1a1a1a]"
              data-testid="pipeline-container"
            >
              {PIPELINE_STEPS.map((step, i) => (
                <PipelineStep
                  key={step.id}
                  step={step}
                  status={stepStatuses[step.id]}
                  isLast={i === PIPELINE_STEPS.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ── Generated Artifacts ───────────────── */}
          <div>
            <SectionLabel>Generated Artifacts</SectionLabel>
            {artifacts.length === 0 ? (
              <div
                data-testid="artifacts-empty-state"
                className="flex items-start gap-3 px-4 py-3 border border-[#1e1e1e] rounded-sm"
              >
                <FileCode
                  size={13}
                  className="text-slate-700 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-slate-600 leading-snug">
                    No prepare artifacts generated yet.
                  </p>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    Compile output, validation reports, and executor briefs will
                    appear here.
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
                    <FileCode
                      size={11}
                      className="text-slate-600 flex-shrink-0"
                    />
                    <span className="text-xs font-mono text-slate-400 truncate">
                      {artifact.path}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Right Inspector panel
      ───────────────────────────────────────────── */}
      <div
        className="w-72 border-l border-[#1e1e1e] bg-[#0b0b0b] flex flex-col flex-shrink-0 overflow-hidden"
        data-testid="inspector-panel"
      >
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex flex-col h-full"
        >
          {/* Tab strip */}
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

          {/* Content */}
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
              <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                No artifacts generated yet.
              </p>
            </TabsContent>

            <TabsContent
              value="validation"
              className="mt-0 p-4"
              data-testid="inspector-validation-content"
            >
              <p className="text-[11px] text-slate-600 text-center py-10 leading-relaxed">
                No validation data available.
                <br />
                <span className="font-mono text-slate-700">
                  Compile must run first.
                </span>
              </p>
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 p-4"
              data-testid="inspector-logs-content"
            >
              <p className="text-[11px] font-mono text-slate-700 text-center py-10">
                No logs available yet.
              </p>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
