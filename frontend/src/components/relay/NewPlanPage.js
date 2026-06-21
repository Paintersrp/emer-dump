import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TriangleAlert,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Placeholder JSON shown in empty editor
───────────────────────────────────────────────────── */
const PLACEHOLDER = `{
  "planId": "plan-<hash>",
  "title": "Descriptive plan title",
  "goal": "High-level goal for this managed plan",
  "repo": "owner/repo",
  "branch": "feat/branch-name",
  "sourceArtifactPath": "plans/<hash>/plan_contract.json",
  "sourceIntentSummary": "Brief description of what this plan achieves.",
  "passes": [
    {
      "passId": "pass-001",
      "name": "First pass name",
      "goal": "Specific goal for this pass",
      "executionScope": "path/to/file.py",
      "dependencies": []
    },
    {
      "passId": "pass-002",
      "name": "Second pass name",
      "goal": "Goal that depends on pass-001",
      "executionScope": "path/to/other.py",
      "dependencies": ["pass-001"]
    }
  ]
}`;

/* ─────────────────────────────────────────────────────
   Client-side mock validation
───────────────────────────────────────────────────── */
function validatePlanJSON(raw) {
  if (!raw.trim()) return { ok: false, empty: true };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      ok: false,
      errors: [{ path: 'root', message: `JSON parse error: ${e.message}`, code: 'PARSE_ERROR' }],
    };
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    return {
      ok: false,
      errors: [{ path: 'root', message: 'Root value must be a JSON object', code: 'INVALID_TYPE' }],
    };
  }

  const errors = [];

  for (const f of ['planId', 'title', 'passes']) {
    if (!parsed[f]) {
      errors.push({ path: f, message: `Missing required field: "${f}"`, code: 'MISSING_FIELD' });
    }
  }

  if (Array.isArray(parsed.passes)) {
    if (parsed.passes.length === 0) {
      errors.push({ path: 'passes', message: '"passes" must contain at least one pass', code: 'EMPTY_ARRAY' });
    } else {
      parsed.passes.forEach((p, i) => {
        if (!p?.passId) {
          errors.push({ path: `passes[${i}].passId`, message: `Pass ${i + 1}: missing required field "passId"`, code: 'MISSING_FIELD' });
        }
        if (!p?.name) {
          errors.push({ path: `passes[${i}].name`, message: `Pass ${i + 1}: missing required field "name"`, code: 'MISSING_FIELD' });
        }
      });
    }
  }

  if (errors.length) return { ok: false, errors };

  // Mock: planId "plan-already-exists" triggers conflict
  if (parsed.planId === 'plan-already-exists') {
    return { ok: false, conflict: true, planId: parsed.planId };
  }

  return { ok: true, plan: parsed };
}

/* ─────────────────────────────────────────────────────
   Form status config
───────────────────────────────────────────────────── */
const FORM_STATUS = {
  draft:             { label: 'Draft',             cls: 'bg-slate-500/10 text-slate-500 border border-slate-700/30' },
  validating:        { label: 'Validating...',     cls: 'bg-blue-500/15 text-blue-400 border border-blue-600/30' },
  validated:         { label: 'Validated',         cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-600/30' },
  validation_failed: { label: 'Validation Failed', cls: 'bg-red-500/15 text-red-400 border border-red-600/30' },
  conflict:          { label: 'Conflict',          cls: 'bg-amber-500/15 text-amber-400 border border-amber-600/30' },
  submitting:        { label: 'Submitting...',     cls: 'bg-blue-500/15 text-blue-400 border border-blue-600/30' },
  submitted:         { label: 'Submitted',         cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-600/30' },
};

/* ─────────────────────────────────────────────────────
   Utility
───────────────────────────────────────────────────── */
function copyText(t) { navigator.clipboard.writeText(t); }

/* ─────────────────────────────────────────────────────
   Right-pane: empty / prompt
───────────────────────────────────────────────────── */
function RightEmpty({ hasInput }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-20 px-8 text-center"
      data-testid="right-empty-state"
    >
      <div className="w-7 h-7 border border-[#2a2a2a] rounded-sm flex items-center justify-center">
        <div className="w-2.5 h-2.5 border border-slate-700 rounded-[2px]" />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
        {hasInput
          ? 'Run validation to inspect and submit this plan.'
          : 'Paste a Plan of Passes JSON artifact to begin.'}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: validating spinner
───────────────────────────────────────────────────── */
function RightValidating() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20">
      <RefreshCw size={13} className="text-blue-400 animate-spin" />
      <span className="text-[11px] text-slate-500">Validating plan JSON...</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: validated — plan + pass preview
───────────────────────────────────────────────────── */
function RightValidated({ plan }) {
  const depCount = (plan.passes || []).reduce((n, p) => n + (p.dependencies?.length || 0), 0);

  const planFields = [
    { label: 'Title',    value: plan.title,                                   mono: false },
    { label: 'Plan ID',  value: plan.planId,                                  mono: true, copyable: true },
    ...(plan.goal             ? [{ label: 'Goal',     value: plan.goal,                              mono: false }] : []),
    ...(plan.repo             ? [{ label: 'Repo',     value: plan.branch ? `${plan.repo} / ${plan.branch}` : plan.repo, mono: true }] : []),
    ...(plan.sourceArtifactPath ? [{ label: 'Artifact', value: plan.sourceArtifactPath,              mono: true }] : []),
    ...(plan.sourceIntentSummary ? [{ label: 'Intent',  value: plan.sourceIntentSummary,             mono: false }] : []),
    {
      label: 'Passes',
      value: `${plan.passes?.length || 0} passes${depCount > 0 ? `, ${depCount} dependencies` : ''}`,
      mono: true,
    },
  ];

  return (
    <div className="px-5 py-4 space-y-5" data-testid="validation-success-panel">
      {/* Validation OK header */}
      <div
        className="flex items-center gap-2 pb-3 border-b border-[#1a1a1a]"
        data-testid="validation-ok-header"
      >
        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-medium text-emerald-400">Plan JSON is valid</span>
      </div>

      {/* Plan preview */}
      <div data-testid="plan-preview">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600 mb-2">Plan</div>
        <div className="border border-[#1e1e1e] overflow-hidden">
          {planFields.map(({ label, value, mono, copyable }) => (
            <div
              key={label}
              className="flex items-start gap-3 px-3 py-2 border-b border-[#161616] last:border-b-0"
            >
              <span className="text-[10px] text-slate-600 w-14 flex-shrink-0 pt-px leading-snug">
                {label}
              </span>
              <div className="flex items-start gap-1 min-w-0 flex-1">
                <span
                  className={`text-[11px] ${mono ? 'font-mono' : ''} text-slate-400 leading-snug break-all`}
                >
                  {value}
                </span>
                {copyable && (
                  <button
                    onClick={() => copyText(value)}
                    className="text-slate-700 hover:text-slate-400 transition-colors p-0.5 flex-shrink-0 mt-px"
                    title="Copy plan ID"
                  >
                    <Copy size={9} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Derived pass list */}
      <div data-testid="pass-preview">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600 mb-2">
          Derived Passes — {plan.passes?.length || 0}
        </div>
        <div className="border border-[#1e1e1e] overflow-hidden">
          {(plan.passes || []).map((pass, i) => (
            <div
              key={pass.passId || i}
              className="px-3 py-2.5 border-b border-[#161616] last:border-b-0"
              data-testid={`preview-pass-${i + 1}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-slate-700 flex-shrink-0 w-4 pt-px">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-0.5">
                    <span className="text-[12px] font-medium text-slate-300 leading-snug">
                      {pass.name || '(unnamed)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-700">{pass.passId}</span>
                    <span className="inline-flex items-center px-1.5 py-px rounded-sm text-[9px] font-medium bg-slate-500/10 text-slate-500 border border-slate-700/30">
                      Planned
                    </span>
                  </div>
                  {pass.goal && (
                    <div className="text-[11px] text-slate-500 truncate mb-1">{pass.goal}</div>
                  )}
                  {pass.dependencies && pass.dependencies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pass.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="font-mono text-[10px] px-1.5 py-px rounded-sm bg-slate-900 text-slate-700 border border-[#1e1e1e]"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: validation failed
───────────────────────────────────────────────────── */
function RightValidationFailed({ errors }) {
  return (
    <div className="px-5 py-4 space-y-3" data-testid="validation-failed-panel">
      <div
        className="flex items-center gap-2 pb-3 border-b border-[#1a1a1a]"
        data-testid="validation-failed-header"
      >
        <XCircle size={12} className="text-red-400 flex-shrink-0" />
        <span className="text-xs font-medium text-red-400">Validation failed</span>
        <span className="font-mono text-[10px] text-red-700 ml-auto">
          {errors.length} {errors.length === 1 ? 'error' : 'errors'}
        </span>
      </div>
      <div className="border border-[#1e1e1e] overflow-hidden">
        {errors.map((err, i) => (
          <div
            key={i}
            className="px-3 py-2.5 border-b border-[#161616] last:border-b-0 flex items-start gap-2"
            data-testid={`validation-error-${i + 1}`}
          >
            <AlertCircle size={10} className="text-red-600/70 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] text-slate-600 mb-0.5 truncate">{err.path}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{err.message}</div>
              {err.code && (
                <div className="font-mono text-[9px] text-slate-700 mt-0.5">{err.code}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: conflict
───────────────────────────────────────────────────── */
function RightConflict({ planId }) {
  return (
    <div className="px-5 py-4" data-testid="conflict-panel">
      <div className="relative border border-[#1e1e1e] bg-[#111111] px-4 py-4">
        <div className="absolute inset-y-0 left-0 w-[2px] bg-amber-400" />
        <div className="pl-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400 mb-1">
            CONFLICT
          </div>
          <div className="text-sm font-medium text-slate-200 mb-1.5">Plan ID already exists</div>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            A plan with ID{' '}
            <span className="font-mono text-amber-400/80">{planId}</span> already exists in this
            workspace. Review the source plan JSON and use a different{' '}
            <span className="font-mono text-slate-400">planId</span> before resubmitting.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: submitting
───────────────────────────────────────────────────── */
function RightSubmitting() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20">
      <RefreshCw size={13} className="text-blue-400 animate-spin" />
      <span className="text-[11px] text-slate-500">Submitting plan...</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Right-pane: submission success
───────────────────────────────────────────────────── */
function RightSubmitted({ plan, onOpenPlan, onViewPlans }) {
  return (
    <div className="px-5 py-4 space-y-4" data-testid="submission-success-panel">
      {/* Success card */}
      <div className="relative border border-[#1e1e1e] bg-[#111111] px-4 py-4">
        <div className="absolute inset-y-0 left-0 w-[2px] bg-emerald-500" />
        <div className="pl-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400 mb-1">
            PLAN SUBMITTED
          </div>
          <div className="text-sm font-medium text-slate-100 mb-1.5">
            Plan and pass records created
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-mono text-slate-400">{plan.passes?.length || 0} pass records</span>{' '}
            created with status{' '}
            <span className="font-mono text-slate-400">Planned</span>. No runs were created and no
            executor was dispatched.
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="border border-[#1e1e1e]" data-testid="submitted-plan-summary">
        {[
          { label: 'Plan ID', value: plan.planId,                 mono: true },
          { label: 'Title',   value: plan.title,                  mono: false },
          { label: 'Passes',  value: String(plan.passes?.length || 0), mono: true },
          { label: 'Status',  value: 'active',                    mono: true },
        ].map(({ label, value, mono }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-3 py-2 border-b border-[#161616] last:border-b-0"
          >
            <span className="text-[10px] text-slate-600 w-14 flex-shrink-0">{label}</span>
            <span className={`text-[11px] ${mono ? 'font-mono' : ''} text-slate-400`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPlan}
          className="flex items-center gap-1.5 text-[11px] text-blue-400 px-3 py-1.5 border border-blue-700/40 rounded-sm hover:border-blue-500/60 hover:text-blue-300 bg-blue-950/30 transition-colors"
          data-testid="open-plan-btn"
        >
          <ExternalLink size={10} />
          Open Plan
        </button>
        <button
          onClick={onViewPlans}
          className="text-[11px] text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          data-testid="view-plans-btn"
        >
          View Plans
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   NewPlanPage — main component
───────────────────────────────────────────────────── */
export default function NewPlanPage({ onBack }) {
  const navigate = useNavigate();

  const [jsonInput, setJsonInput]           = useState('');
  const [formState, setFormState]           = useState('draft');
  const [validationErrors, setValidationErrors] = useState([]);
  const [conflictPlanId, setConflictPlanId] = useState(null);
  const [extractedPlan, setExtractedPlan]   = useState(null);
  const [submittedPlan, setSubmittedPlan]   = useState(null);

  const statusCfg   = FORM_STATUS[formState] || FORM_STATUS.draft;
  const hasInput    = jsonInput.trim().length > 0;
  const canValidate = hasInput && !['submitting', 'submitted', 'validating'].includes(formState);
  const canSubmit   = formState === 'validated';
  const isFinal     = ['submitting', 'submitted'].includes(formState);

  function handleInputChange(e) {
    setJsonInput(e.target.value);
    // Reset validation state on any edit
    if (['validated', 'validation_failed', 'conflict'].includes(formState)) {
      setFormState('draft');
      setExtractedPlan(null);
      setValidationErrors([]);
      setConflictPlanId(null);
    }
  }

  function handleValidate() {
    if (!canValidate) return;
    setFormState('validating');
    // Simulate async round-trip
    setTimeout(() => {
      const result = validatePlanJSON(jsonInput);
      if (result.empty) {
        setFormState('draft');
      } else if (result.conflict) {
        setConflictPlanId(result.planId);
        setFormState('conflict');
        setExtractedPlan(null);
      } else if (result.ok) {
        setExtractedPlan(result.plan);
        setValidationErrors([]);
        setFormState('validated');
      } else {
        setValidationErrors(result.errors || []);
        setExtractedPlan(null);
        setFormState('validation_failed');
      }
    }, 600);
  }

  function handleClear() {
    setJsonInput('');
    setFormState('draft');
    setValidationErrors([]);
    setExtractedPlan(null);
    setConflictPlanId(null);
    setSubmittedPlan(null);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setFormState('submitting');
    // Simulate async submission
    setTimeout(() => {
      setSubmittedPlan(extractedPlan);
      setFormState('submitted');
    }, 800);
  }

  /* ── Resolve right-pane content ── */
  let rightContent;
  if (formState === 'validating') {
    rightContent = <RightValidating />;
  } else if (formState === 'validated') {
    rightContent = <RightValidated plan={extractedPlan} />;
  } else if (formState === 'validation_failed') {
    rightContent = <RightValidationFailed errors={validationErrors} />;
  } else if (formState === 'conflict') {
    rightContent = <RightConflict planId={conflictPlanId} />;
  } else if (formState === 'submitting') {
    rightContent = <RightSubmitting />;
  } else if (formState === 'submitted') {
    rightContent = (
      <RightSubmitted
        plan={submittedPlan}
        onOpenPlan={() => navigate(`/plans/${submittedPlan?.planId}`)}
        onViewPlans={() => navigate('/plans')}
      />
    );
  } else {
    rightContent = <RightEmpty hasInput={hasInput} />;
  }

  /* ── Right pane section label ── */
  const rightLabel =
    formState === 'submitted'   ? 'Submission Result' :
    formState === 'submitting'  ? 'Submitting'        :
    formState === 'validated'   ? 'Plan Preview'      : 'Validation';

  return (
    <div
      className="flex flex-col bg-[#0e0e0e] text-slate-200"
      style={{ height: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      data-testid="new-plan-page"
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
            data-testid="nav-plans-btn"
            onClick={() => navigate('/plans')}
            className="text-xs text-slate-200 px-3 py-1.5 border border-[#333] rounded-sm bg-[#1a1a1a] transition-colors"
          >
            Plans
          </button>
          <button
            data-testid="nav-runs-btn"
            onClick={() => navigate('/runs')}
            className="text-xs text-slate-400 px-3 py-1.5 border border-[#2a2a2a] rounded-sm hover:border-[#3a3a3a] hover:text-slate-200 transition-colors"
          >
            Runs
          </button>
        </div>
      </div>

      {/* ── Page header ── */}
      <div
        className="px-6 pt-4 pb-4 border-b border-[#1a1a1a] flex-shrink-0"
        data-testid="page-header"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3">
          <button
            onClick={onBack || (() => navigate('/plans'))}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={11} />
            Plans
          </button>
          <span className="text-slate-800 text-[11px]">·</span>
          <span className="text-[11px] text-slate-600">New Plan</span>
        </div>

        {/* Title + status badge */}
        <div className="flex items-center gap-3 mb-1">
          <h1
            className="text-xl font-semibold text-slate-100 tracking-tight"
            data-testid="page-title"
          >
            New Plan
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide whitespace-nowrap ${statusCfg.cls}`}
            data-testid="form-status-badge"
          >
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-500" data-testid="page-subtitle">
          Validate and submit a reviewed Plan of Passes JSON artifact.
        </p>
      </div>

      {/* ── Notice bar ── */}
      <div
        className="relative flex items-center gap-2 px-6 py-2 border-b border-[#1a1a1a] bg-amber-950/10 flex-shrink-0"
        data-testid="notice-bar"
      >
        <div className="absolute inset-y-0 left-0 w-[2px] bg-amber-500/40" />
        <TriangleAlert size={10} className="text-amber-600 flex-shrink-0 ml-1" />
        <span className="text-[11px] text-slate-500">
          Submitting creates plan and pass records only.{' '}
          <span className="text-slate-600">No runs are created. No executor is dispatched.</span>
        </span>
      </div>

      {/* ── Two-pane content ── */}
      <div
        className="flex flex-1 min-h-0 overflow-hidden"
        data-testid="two-pane-content"
      >
        {/* ──────── Left pane: JSON editor ──────── */}
        <div
          className="flex flex-col flex-shrink-0 border-r border-[#1a1a1a]"
          style={{ width: '500px' }}
          data-testid="left-pane"
        >
          {/* Pane header */}
          <div className="px-5 pt-4 pb-3 border-b border-[#1a1a1a] flex-shrink-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600 mb-1">
              Plan of Passes JSON
            </div>
            <div className="text-[11px] text-slate-600 leading-snug">
              Paste the reviewed structured Plan of Passes JSON produced by the Planner.
            </div>
          </div>

          {/* Textarea — fills remaining height */}
          <div className="flex-1 min-h-0 relative" data-testid="json-editor-container">
            <textarea
              value={jsonInput}
              onChange={handleInputChange}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              readOnly={isFinal}
              className={`absolute inset-0 w-full h-full font-mono text-[11px] bg-transparent text-slate-300 resize-none focus:outline-none placeholder-[#2a2a2a] leading-relaxed px-5 py-4 overflow-auto ${
                isFinal ? 'opacity-40 cursor-default' : ''
              }`}
              style={{ tabSize: 2 }}
              data-testid="json-input"
            />
          </div>

          {/* Status micro-bar */}
          <div
            className="flex items-center justify-between px-5 py-1.5 border-t border-[#161616] flex-shrink-0"
          >
            <span className="font-mono text-[10px] text-slate-800">
              {hasInput ? `${jsonInput.length} chars` : 'empty'}
            </span>
            <span className="font-mono text-[10px]">
              {formState === 'validated' && (
                <span className="text-emerald-700">valid</span>
              )}
              {formState === 'validation_failed' && (
                <span className="text-red-700">{validationErrors.length} errors</span>
              )}
              {formState === 'conflict' && (
                <span className="text-amber-700">conflict</span>
              )}
            </span>
          </div>

          {/* Validate + Clear */}
          <div
            className="flex items-center gap-2 px-5 py-3 border-t border-[#1a1a1a] flex-shrink-0"
          >
            <button
              onClick={handleValidate}
              disabled={!canValidate}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 border rounded-sm transition-colors ${
                canValidate
                  ? 'text-slate-200 border-[#3a3a3a] bg-[#1a1a1a] hover:bg-[#222] hover:text-white'
                  : 'text-slate-700 border-[#1a1a1a] cursor-not-allowed'
              }`}
              data-testid="validate-btn"
            >
              {formState === 'validating' ? (
                <RefreshCw size={10} className="animate-spin" />
              ) : (
                <CheckCircle2 size={10} />
              )}
              {formState === 'validating' ? 'Validating...' : 'Validate Plan'}
            </button>
            <button
              onClick={handleClear}
              disabled={!hasInput && formState === 'draft'}
              className={`text-[11px] px-3 py-1.5 border rounded-sm transition-colors ${
                hasInput || formState !== 'draft'
                  ? 'text-slate-500 border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-slate-300'
                  : 'text-slate-700 border-[#1a1a1a] cursor-not-allowed'
              }`}
              data-testid="clear-btn"
            >
              Clear
            </button>
          </div>

          {/* Submit area */}
          <div className="px-5 pb-4 pt-3 border-t border-[#191919] flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || formState === 'submitting'}
              className={`w-full flex items-center justify-center gap-2 text-[11px] px-4 py-2.5 border rounded-sm transition-colors ${
                canSubmit && formState !== 'submitting'
                  ? 'text-emerald-300 border-emerald-700/50 bg-emerald-950/25 hover:bg-emerald-950/50 hover:border-emerald-600/60 hover:text-emerald-200'
                  : formState === 'submitted'
                  ? 'text-emerald-700 border-emerald-900/40 cursor-default'
                  : 'text-slate-700 border-[#1e1e1e] cursor-not-allowed'
              }`}
              data-testid="submit-btn"
            >
              {formState === 'submitting' ? (
                <>
                  <RefreshCw size={10} className="animate-spin" />
                  Submitting...
                </>
              ) : formState === 'submitted' ? (
                <>
                  <CheckCircle2 size={10} className="text-emerald-700" />
                  Submitted
                </>
              ) : (
                'Submit Reviewed Plan'
              )}
            </button>
            <div className="text-[10px] text-slate-700 text-center mt-1.5 leading-snug">
              Creates managed plan/pass records. Does not create runs.
            </div>
          </div>
        </div>

        {/* ──────── Right pane: validation / preview ──────── */}
        <div
          className="flex-1 min-w-0 flex flex-col overflow-hidden"
          data-testid="right-pane"
        >
          {/* Sticky right-pane header */}
          <div
            className="flex items-center gap-2 px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0 bg-[#0e0e0e]"
            data-testid="right-pane-header"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600">
              {rightLabel}
            </span>
            {/* State dot */}
            {formState === 'validated' && (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
            )}
            {formState === 'validation_failed' && (
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 ml-1" />
            )}
            {formState === 'conflict' && (
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-1" />
            )}
            {formState === 'submitted' && (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto" data-testid="right-pane-content">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}
