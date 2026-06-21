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
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Pipeline step definitions
───────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    id: "compile",
    label: "Compile packet",
    waitingLabel: "Waiting on Intake approval",
  },
  {
    id: "packet-validation",
    label: "Packet validation",
    waitingLabel: "Waiting on compile",
  },
  {
    id: "repair",
    label: "Repair",
    waitingLabel: "Not applicable",
  },
  {
    id: "render-brief",
    label: "Render executor brief",
    waitingLabel: "Waiting on valid packet",
  },
  {
    id: "brief-validation",
    label: "Brief validation",
    waitingLabel: "Waiting on rendered brief",
  },
  {
    id: "approval",
    label: "Approval",
    waitingLabel: "Waiting on validated brief",
  },
];

/* ─────────────────────────────────────────────────────
   Status visual config
───────────────────────────────────────────────────── */
function getStepConfig(status) {
  switch (status) {
    case "blocked":
      return {
        Icon: AlertCircle,
        iconCls: "text-amber-400",
        nameCls: "text-slate-200 font-medium",
        badge: "Blocked",
        badgeCls: "bg-amber-950/20 text-amber-400 border border-amber-800/40",
      };
    case "na":
      return {
        Icon: Minus,
        iconCls: "text-slate-700",
        nameCls: "text-slate-700",
        badge: "Not applicable",
        badgeCls: "text-slate-700 border border-dashed border-slate-800",
      };
    case "success":
      return {
        Icon: CheckCircle2,
        iconCls: "text-cyan-400",
        nameCls: "text-slate-100 font-medium",
        badge: "Complete",
        badgeCls: "bg-cyan-950/20 text-cyan-400 border border-cyan-800/40",
      };
    default: // waiting / pending
      return {
        Icon: CircleDashed,
        iconCls: "text-slate-600",
        nameCls: "text-slate-500",
        badge: null, // use step.waitingLabel
        badgeCls: "text-slate-600 border border-slate-800",
      };
  }
}

/* ─────────────────────────────────────────────────────
   Shared tiny components
───────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
    {children}
  </p>
);

const KVRow = ({
  label,
  value,
  valueCls,
  mono = true,
  isLast = false,
}) => (
  <div
    className={`py-1.5 ${!isLast ? "border-b border-[#1d1d1d]" : ""}`}
  >
    <p className="text-[10px] text-slate-600 mb-0.5 leading-tight">{label}</p>
    <p
      className={`text-[11px] leading-snug ${mono ? "font-mono" : ""} ${
        valueCls || "text-slate-400"
      }`}
    >
      {value || "—"}
    </p>
  </div>
);

const InspectorSection = ({ title, rows, isLast = false }) => (
  <div className={`px-4 py-3 ${!isLast ? "border-b border-[#222]" : ""}`}>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
      {title}
    </p>
    {rows.map((row, i) => (
      <KVRow key={row.label} {...row} isLast={i === rows.length - 1} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────
   Blocker card
───────────────────────────────────────────────────── */
const BlockerCard = ({ onReturnToIntake }) => (
  <div
    data-testid="prepare-blocker-card"
    className="flex items-start gap-4 p-4 bg-amber-950/10 border border-amber-800/30 rounded-sm"
  >
    <AlertTriangle
      size={15}
      className="text-amber-400 flex-shrink-0 mt-0.5"
    />
    <div className="flex-1 min-w-0">
      <p
        className="text-sm font-semibold text-amber-300 mb-0.5"
        data-testid="blocker-title"
      >
        Prepare is blocked
      </p>
      <p
        className="text-xs text-amber-400/70"
        data-testid="blocker-message"
      >
        Approve Intake before compile can run.
      </p>
    </div>
    <Button
      data-testid="return-to-intake-btn"
      size="sm"
      variant="outline"
      onClick={onReturnToIntake}
      className="border-amber-700/50 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300 hover:border-amber-600 text-xs h-7 px-3 rounded-sm flex-shrink-0 bg-transparent shadow-none"
    >
      Return to Intake Review
    </Button>
  </div>
);

/* ─────────────────────────────────────────────────────
   Pipeline step row
───────────────────────────────────────────────────── */
const PipelineStep = ({ step, status, isLast }) => {
  const cfg = getStepConfig(status);
  const { Icon } = cfg;

  return (
    <div
      data-testid={`pipeline-step-${step.id}`}
      className={`flex items-center gap-3 px-4 py-2.5 ${
        !isLast ? "border-b border-[#1e1e1e]" : ""
      }`}
    >
      <Icon size={14} className={`${cfg.iconCls} flex-shrink-0`} />
      <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
        <span className={`text-sm leading-tight ${cfg.nameCls}`}>
          {step.label}
        </span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 whitespace-nowrap ${cfg.badgeCls}`}
        >
          {cfg.badge || step.waitingLabel}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────────── */

/**
 * CompileRenderPage — Drop-in Relay Prepare stage component.
 *
 * Props:
 *   runState            – e.g. "intake_needs_review"
 *   packetId            – e.g. "packet-99"
 *   repo                – e.g. "relay"
 *   branch              – e.g. "main"
 *   worktree            – e.g. "default"
 *   executionProfile    – e.g. "opencode_go"
 *   targetModel         – e.g. "deepseek-v4-flash"
 *   compileStatus       – "blocked" | "pending" | "running" | "success" | "failed"
 *   packetValidationStatus – "waiting" | "running" | "passed" | "failed"
 *   repairStatus        – "na" | "waiting" | "running" | "success" | "failed"
 *   briefStatus         – "waiting" | "running" | "generated" | "failed"
 *   briefValidationStatus – "waiting" | "running" | "passed" | "failed"
 *   approvalStatus      – "waiting" | "approved" | "rejected"
 *   artifacts           – array of { path: string }
 *   onReturnToIntake    – () => void
 */
export default function CompileRenderPage({
  runState = "intake_needs_review",
  packetId = "packet-99",
  repo = "relay",
  branch = "main",
  worktree = "default",
  executionProfile = "opencode_go",
  targetModel = "deepseek-v4-flash",
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
        { label: "Active step",      value: "—",               valueCls: "text-slate-600" },
        { label: "Executor adapter", value: executionProfile,  valueCls: "text-slate-400" },
        { label: "Selected model",   value: targetModel,       valueCls: "text-slate-400" },
      ],
    },
    {
      title: "Compiled Packet",
      rows: [
        { label: "Canonical packet",  value: "Not generated",       valueCls: "text-slate-600" },
        { label: "Validation status", value: "Waiting on compile",  valueCls: "text-slate-600" },
        { label: "Validation report", value: "Waiting on compile",  valueCls: "text-slate-600" },
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
        { label: "Brief artifact",    value: "Not generated",              valueCls: "text-slate-600" },
        { label: "Validation status", value: "Waiting on rendered brief",  valueCls: "text-slate-600" },
        { label: "Validation report", value: "Waiting on rendered brief",  valueCls: "text-slate-600" },
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
      {/* ── Main content pane ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-6 max-w-3xl">

          {/* Stage header */}
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-base font-semibold text-slate-100 tracking-tight"
                data-testid="stage-heading"
              >
                Compile / Render
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
                Compile the canonical packet, validate it, render the executor
                brief, and approve the run for execution.
              </p>
            </div>
            <span
              data-testid="stage-run-state-badge"
              className="text-[10px] font-mono font-semibold px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-700/40 rounded-sm flex-shrink-0 ml-4 whitespace-nowrap"
            >
              {runState}
            </span>
          </div>

          {/* Blocker card */}
          <BlockerCard onReturnToIntake={onReturnToIntake} />

          {/* Pipeline stepper */}
          <div>
            <SectionLabel>Pipeline</SectionLabel>
            <div
              className="border border-[#252525] rounded-sm overflow-hidden"
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

          {/* Artifacts */}
          <div>
            <SectionLabel>Generated Artifacts</SectionLabel>
            {artifacts.length === 0 ? (
              <div
                data-testid="artifacts-empty-state"
                className="border border-dashed border-[#2a2a2a] rounded-sm flex flex-col items-center justify-center py-10 text-center"
              >
                <FileCode size={18} className="text-slate-700 mb-2.5" />
                <p className="text-xs text-slate-600">
                  No prepare artifacts generated yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {artifacts.map((artifact, i) => (
                  <div
                    key={i}
                    data-testid={`artifact-item-${i}`}
                    className="flex items-center gap-2 p-2 border border-[#252525] rounded-sm"
                  >
                    <FileCode size={11} className="text-slate-600 flex-shrink-0" />
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

      {/* ── Right Inspector panel ── */}
      <div
        className="w-72 border-l border-[#222] bg-[#0c0c0c] flex flex-col flex-shrink-0 overflow-hidden"
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
            className="flex h-auto bg-transparent rounded-none border-b border-[#222] p-0 flex-shrink-0"
          >
            {["details", "artifacts", "validation", "logs"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                data-testid={`inspector-tab-${t}`}
                className="flex-1 rounded-none h-auto py-2.5 px-1 text-[10px] uppercase tracking-wider font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-300 data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none bg-transparent transition-colors"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
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
              <p className="text-xs text-slate-600 text-center py-8">
                No artifacts generated yet.
              </p>
            </TabsContent>

            <TabsContent
              value="validation"
              className="mt-0 p-4"
              data-testid="inspector-validation-content"
            >
              <p className="text-xs text-slate-600 text-center py-8">
                No validation data available.
                <br />
                <span className="font-mono">Compile must run first.</span>
              </p>
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 p-4"
              data-testid="inspector-logs-content"
            >
              <p className="text-xs font-mono text-slate-700 text-center py-8">
                No logs available yet.
              </p>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
