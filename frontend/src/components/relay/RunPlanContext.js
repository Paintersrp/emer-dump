import React from "react";
import { Link } from "react-router-dom";
import { Copy } from "lucide-react";

const PASS_STATUS_PRESENTATION = {
  planned: {
    label: "Planned",
    badgeCls: "bg-slate-500/10 text-slate-400 border border-slate-700/40",
    textCls: "text-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badgeCls: "bg-cyan-500/10 text-cyan-400 border border-cyan-700/40",
    textCls: "text-cyan-400",
  },
  completed: {
    label: "Completed",
    badgeCls: "bg-emerald-500/10 text-emerald-400 border border-emerald-700/40",
    textCls: "text-emerald-400",
  },
  skipped: {
    label: "Skipped",
    badgeCls: "bg-slate-500/10 text-slate-400 border border-slate-700/40",
    textCls: "text-slate-400",
  },
  blocked: {
    label: "Blocked",
    badgeCls: "bg-red-500/10 text-red-400 border border-red-700/40",
    textCls: "text-red-400",
  },
  dependency_issue: {
    label: "Dependency Issue",
    badgeCls: "bg-amber-500/10 text-amber-300 border border-amber-700/40",
    textCls: "text-amber-300",
  },
};

function copyText(value) {
  if (!value) return;
  navigator.clipboard.writeText(value);
}

function formatFallbackLabel(value) {
  return value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unavailable";
}

function formatPassSequence(passSequence) {
  return typeof passSequence === "number" && Number.isFinite(passSequence)
    ? `Pass ${passSequence}`
    : null;
}

export function hasRunPlanContext(runPlanContext) {
  return Boolean(runPlanContext?.planId || runPlanContext?.passId);
}

export function getRunPlanContextHrefs(runPlanContext) {
  if (!hasRunPlanContext(runPlanContext)) {
    return { planHref: null, passHref: null };
  }

  const planHref = runPlanContext?.planId ? `/plans/${runPlanContext.planId}` : null;
  const passHref =
    runPlanContext?.planId && runPlanContext?.passId
      ? `/plans/${runPlanContext.planId}/passes/${runPlanContext.passId}`
      : null;

  return { planHref, passHref };
}

export function getPassStatusPresentation(status) {
  return PASS_STATUS_PRESENTATION[status] || {
    label: formatFallbackLabel(status),
    badgeCls: "bg-slate-500/10 text-slate-400 border border-slate-700/40",
    textCls: "text-slate-400",
  };
}

function getDisplayFields(runPlanContext) {
  const planId = runPlanContext?.planId || null;
  const passId = runPlanContext?.passId || null;
  const planLabel = runPlanContext?.planTitle || planId;
  const passLabel =
    runPlanContext?.passName || formatPassSequence(runPlanContext?.passSequence) || passId;

  return { planId, passId, planLabel, passLabel };
}

function ContextValue({ primary, secondary = null, href = null, copyValue = null }) {
  if (!primary) return null;

  const content = (
    <>
      <span className="truncate">{primary}</span>
      {secondary && (
        <span className="font-mono text-[10px] text-slate-500">{secondary}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="inline-flex min-w-0 items-center gap-1.5 text-slate-200 hover:text-slate-100 transition-colors"
      >
        {content}
      </Link>
    );
  }

  if (copyValue) {
    return (
      <button
        type="button"
        onClick={() => copyText(copyValue)}
        className="inline-flex min-w-0 items-center gap-1.5 text-left text-slate-200 hover:text-slate-100 transition-colors"
      >
        {content}
        <Copy size={10} className="flex-shrink-0 text-slate-600" />
      </button>
    );
  }

  return <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-200">{content}</span>;
}

function ContextField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-600">{label}</p>
      <div className="min-w-0 text-[11px] leading-snug">{children}</div>
    </div>
  );
}

export function RunPlanContextStatusPill({ status }) {
  if (!status) return null;
  const { label, badgeCls } = getPassStatusPresentation(status);

  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono ${badgeCls}`}
    >
      {label}
    </span>
  );
}

export function RunPlanContextHeader({ runPlanContext }) {
  if (!hasRunPlanContext(runPlanContext)) return null;

  const { planHref, passHref } = getRunPlanContextHrefs(runPlanContext);
  const { planId, passId, planLabel, passLabel } = getDisplayFields(runPlanContext);

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2 text-[11px]"
      data-testid="run-plan-context-header"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        Plan Context
      </span>

      {planId && (
        <span className="inline-flex min-w-0 items-center gap-2 rounded-sm border border-[#252525] bg-[#101010] px-2 py-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-600">Plan</span>
          <ContextValue
            primary={planLabel}
            secondary={runPlanContext?.planTitle ? planId : null}
            href={planHref}
            copyValue={!planHref ? planId : null}
          />
        </span>
      )}

      {passId && (
        <span className="inline-flex min-w-0 items-center gap-2 rounded-sm border border-[#252525] bg-[#101010] px-2 py-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-600">Pass</span>
          <ContextValue
            primary={passLabel}
            secondary={
              runPlanContext?.passName || formatPassSequence(runPlanContext?.passSequence)
                ? passId
                : null
            }
            href={passHref}
            copyValue={!passHref ? passId : null}
          />
        </span>
      )}

      {runPlanContext?.passStatus && <RunPlanContextStatusPill status={runPlanContext.passStatus} />}
    </div>
  );
}

export function RunPlanContextCard({
  runPlanContext,
  title = "Plan Context",
  description = "Managed plan/pass association is read-only on this run.",
}) {
  if (!hasRunPlanContext(runPlanContext)) return null;

  const { planHref, passHref } = getRunPlanContextHrefs(runPlanContext);
  const { planId, passId, planLabel, passLabel } = getDisplayFields(runPlanContext);
  const hasPlanLabel = Boolean(runPlanContext?.planTitle);
  const hasPassLabel = Boolean(
    runPlanContext?.passName || formatPassSequence(runPlanContext?.passSequence),
  );

  return (
    <div
      className="overflow-hidden rounded-sm border border-[#1e2733] bg-[#0d1014]"
      data-testid="run-plan-context-card"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#1d2430] px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
            {title}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">{description}</p>
        </div>
        {runPlanContext?.passStatus && <RunPlanContextStatusPill status={runPlanContext.passStatus} />}
      </div>

      <div className="grid gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-2">
        {hasPlanLabel && (
          <ContextField label="Plan">
            <ContextValue
              primary={planLabel}
              href={planHref}
              copyValue={!planHref ? planId : null}
            />
          </ContextField>
        )}

        {planId && (
          <ContextField label="Plan ID">
            <span className="inline-flex items-center gap-1.5 font-mono text-slate-300">
              <span>{planId}</span>
              {!planHref && (
                <button
                  type="button"
                  onClick={() => copyText(planId)}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                  aria-label={`Copy ${planId}`}
                >
                  <Copy size={10} />
                </button>
              )}
            </span>
          </ContextField>
        )}

        {hasPassLabel && (
          <ContextField label="Pass">
            <ContextValue
              primary={passLabel}
              href={passHref}
              copyValue={!passHref ? passId : null}
            />
          </ContextField>
        )}

        {passId && (
          <ContextField label="Pass ID">
            <span className="inline-flex items-center gap-1.5 font-mono text-slate-300">
              <span>{passId}</span>
              {!passHref && (
                <button
                  type="button"
                  onClick={() => copyText(passId)}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                  aria-label={`Copy ${passId}`}
                >
                  <Copy size={10} />
                </button>
              )}
            </span>
          </ContextField>
        )}

        {runPlanContext?.passStatus && (
          <ContextField label="Pass Status">
            <RunPlanContextStatusPill status={runPlanContext.passStatus} />
          </ContextField>
        )}
      </div>
    </div>
  );
}

export function buildRunPlanContextDetailsSection(runPlanContext) {
  if (!hasRunPlanContext(runPlanContext)) return null;

  const rows = [];
  const { planId, passId, planLabel, passLabel } = getDisplayFields(runPlanContext);
  const hasPlanLabel = Boolean(runPlanContext?.planTitle);
  const hasPassLabel = Boolean(
    runPlanContext?.passName || formatPassSequence(runPlanContext?.passSequence),
  );

  if (hasPlanLabel) {
    rows.push({
      label: "Plan",
      value: planLabel,
      valueCls: "text-slate-300",
      mono: false,
    });
  }

  if (planId) {
    rows.push({
      label: "Plan ID",
      value: planId,
      valueCls: "text-slate-400",
    });
  }

  if (hasPassLabel) {
    rows.push({
      label: "Pass",
      value: passLabel,
      valueCls: "text-slate-300",
      mono: false,
    });
  }

  if (passId) {
    rows.push({
      label: "Pass ID",
      value: passId,
      valueCls: "text-slate-400",
    });
  }

  if (runPlanContext?.passStatus) {
    const passStatus = getPassStatusPresentation(runPlanContext.passStatus);
    rows.push({
      label: "Pass Status",
      value: passStatus.label,
      valueCls: passStatus.textCls,
      mono: false,
    });
  }

  return rows.length > 0
    ? {
        title: "Plan Context",
        rows,
      }
    : null;
}
