# Relay Stage Pages — PRD

## Original Problem Statement
Redesign and refine the Relay pipeline stage pages (Compile/Render and Execute). The system takes a Planner handoff through Intake → Compile/Render → Execute → Audit. Each stage is a drop-in React/Tailwind component with a dark technical workbench style (no marketing SaaS aesthetics). Components are props-driven with mocked state and wired through App.js routing.

## Architecture
- **Stack**: React 19 + Tailwind CSS + shadcn/ui (Radix)
- **Deliverables**: Drop-in components at `/app/frontend/src/components/relay/`
- **Demo wrapper**: `/app/frontend/src/App.js` (RelayDemoShell with mock data, react-router)
- **No backend** — all data is mocked via props/const in App.js

## User Personas
- Developer / engineer using Relay as a run orchestration/dispatch workbench
- Needs to understand current run state, blockers, and next valid action at a glance

## Core Requirements (Static)
1. Dark technical UI (`#0e0e0e` background, `#1a1a1a` surface, 1px borders)
2. Relay shell chrome preserved: top nav, run header, breadcrumb, stage tabs (Intake · Compile/Render · Execute · Audit)
3. Right inspector panel with 4 tabs: Details, Artifacts, Validation, Logs
4. Props-driven components — accept all data from parent
5. Blue/cyan/gold accents, monospace for statuses/IDs, no marketing visuals

## What's Been Implemented

### CompileRenderPage.js (Completed — June 21, 2026)
- Stage header with subtitle + run state amber badge
- Blocker card (amber left-accent) with "CURRENT BLOCKER" eyebrow + "Return to Intake Review" CTA
- 6-step pipeline stepper (blocked/waiting/na states with distinct icons)
- Artifacts empty state section
- Right inspector panel: 5 sections (Run State, Compiled Packet, Repair, Executor Brief, Approval)
- All interactive elements have data-testid attributes
- Test coverage: 98% (iteration_1, iteration_2) — one LOW issue: CompileRenderPage badge still shows raw snake_case (not blocking)

### ExecutePage.js (Completed — June 21, 2026)
- **5 execution states**: blocked, ready to dispatch, running, complete, failed
- State card: adapts per status (amber/cyan/blue/red), eyebrow label, dominant title, context CTA button
- Ready state: compact metadata grid (executor adapter, model, branch, repo)
- 5-step Execution Pipeline stepper: Brief approved → Executor dispatched → Execution running → Result captured → Audit ready
- Per-state pipeline step logic (blocked/success/active/running/failed/waiting)
- Activity log preview (last 7 entries, error level coloring)
- Generated Artifacts list (empty state or item list with type badge)
- Right inspector panel: 5 sections (Run State, Dispatch, Executor, Result, Audit Readiness)
  - Active step field shows context-aware current step name
  - Blocking reason shows context-aware value (None / Waiting / error message)
  - startedAt / completedAt use context-aware fallbacks
- Run state badge formatted from snake_case → Title Case
- All interactive elements have data-testid attributes
- Test coverage: 100% (iteration_3) — all 22 tests pass across all 5 states

## Props Interfaces

### CompileRenderPage
```
runState, packetId, repo, branch, worktree, executionProfile, targetModel
compileStatus, packetValidationStatus, repairStatus, briefStatus, briefValidationStatus, approvalStatus
artifacts: [{ path: string }]
onReturnToIntake: () => void
```

### ExecutePage
```
runState, packetId, repo, branch, worktree, executionProfile, targetModel
executeStatus: "blocked"|"ready"|"running"|"complete"|"failed"
blockingReason: string|null
dispatchState: "not_dispatched"|"dispatched"|"running"|"complete"|"failed"
startedAt: ISO string|null
completedAt: ISO string|null
resultArtifact: { path: string }|null
recentLogs: [{ timestamp, message, level? }]
artifacts: [{ path, type? }]
onDispatch: () => void
onReturnToCompileRender: () => void
onProceedToAudit: () => void
```

## Prioritized Backlog

### P0 — Complete
- [x] CompileRenderPage: blocked state with dominant blocker card
- [x] CompileRenderPage: compact 6-step pipeline stepper
- [x] ExecutePage: 5 execution states with full state card hierarchy
- [x] ExecutePage: 5-step Execution Pipeline with per-state visual config
- [x] ExecutePage: right inspector with context-aware Details sections
- [x] ExecutePage: activity log + artifacts list
- [x] Both pages: inspector panel with 4 tabs (Details, Artifacts, Validation, Logs)
- [x] AuditPage: 6 audit states with full state card hierarchy
- [x] AuditPage: 5-step Audit Pipeline with per-state visual config
- [x] AuditPage: Evidence Summary + Audit Findings sections
- [x] AuditPage: right inspector with 6 Details sections + Artifacts/Validation/Logs tabs

### AuditPage.js (Completed — June 21, 2026)
- **6 audit states**: blocked, ready, passed, warning, revision_required, rejected
- Dominant state card adapts per audit state (amber/cyan/green/amber/blue/red accents + eyebrow + title + message)
- Decision buttons (Accept / Accept with warning / Request revision / Reject) in state card — `ready` state only
- Return to Execute CTA in `blocked` and `revision_required` states
- 5-step Audit Pipeline: Executor result captured → Validation reviewed → Scope reviewed → Evidence reviewed → Audit decision
- Per-state pipeline step logic (blocked/success/active/accepted/warning_decision/revision/failed/waiting)
- Evidence Summary section (hidden when blocked): Executor result, Validation report, Changed files/diff, Scope — each with colored status tags
- Audit Findings section: Blockers list (red, Ban icon) + Warnings list (amber, TriangleAlert icon), each with count badges and empty states
- Activity log preview (last 7 entries, error/warn/info level coloring)
- Generated Artifacts list (empty state or compact type-badged rows)
- Right inspector panel: 6 Details sections (Run State, Audit Readiness, Executor Result, Validation, Scope Review, Decision) + Artifacts + Validation + Logs tabs
- All decision variants wired: accepted, accepted_with_warnings, revision_required, rejected, pending
- All interactive elements have data-testid attributes
- Test coverage: 100% (iteration_4) — 44/44 tests across all 6 states
- App.js updated: AUDIT_MOCKS with all 6 states, URL param switching (?state=), /audit route, Audit tab navigable

### IntakePage.js (Completed — Feb 2026)
- **3 intake states**: intake_needs_review, approved, blocked
- Dominant state card: INTAKE REVIEW (amber) / INTAKE APPROVED (green) / INTAKE BLOCKED (red)
- State card actions: Approve Intake / Needs Revision / Block Run (intake_needs_review only)
- "Proceed to Compile / Render" CTA in approved state
- 5-step Intake Pipeline: Handoff loaded → Config reviewed → Executor selected → Model selected → Intake approved
- Per-state pipeline step logic (success/active/accepted/blocked/waiting)
- Handoff Summary section (title, intent, artifact, source, createdBy) — hidden when blocked
- Run Configuration section with interactive adapter/model dropdowns (intake_needs_review) or read-only text (other states)
- Adapter → Model dependency: OpenCode Go, Codex, Antigravity each have distinct model lists; changing adapter resets model to first available
- Readiness section (preflight checks with OK/Warn/Error badges + PREFLIGHT N/N badge) — hidden when blocked
- Current Issues section (amber warnings / red errors) — hidden when no issues or blocked
- Activity log preview, Generated Artifacts section
- Right inspector panel: 5 Details sections (Run State, Handoff, Configuration, Executor, Approval) + Artifacts/Validation/Logs tabs
- All interactive elements have data-testid attributes
- Test coverage: 100% (iteration_5) — 58/58 tests across all 3 states
- App.js updated: INTAKE_MOCKS with 3 states, URL param switching (?state=), /intake route, Intake tab now navigable

### RunsRegistryPage.js (Completed — Feb 2026)
- **13 mock runs** covering every status: intake_review, validation_failed, executor_blocked, audit_ready, running, accepted, complete
- Compact top nav: Relay branding, active "Runs" button, blue "+ New Run" button
- Page header: "Runs" / "Handoff orchestration runs" / summary row (N runs · N need attention ⚠)
- 6 operational filter tabs (All Runs, Needs Attention, Running, Executor Blocked, Audit Required, Complete) — bottom-border underline style with monospace count badges
- Table: 7 columns — Run (title + compact monospace meta: runNum/packetId/repo/branch), Status, Stage (ALL CAPS monospace), Executor (monospace), Updated, Attention, Chevron
- StatusPill: semi-transparent color-coded per status (amber=intake_review, red=validation_failed/executor_blocked, cyan=audit_ready, blue=running, green=accepted, muted green=complete)
- AttentionPill: TriangleAlert icon + label (Review, N Validation, Blocked, Audit) — amber/red/cyan by type
- Row hierarchy: attention rows use text-slate-100 title; non-attention rows use text-slate-400 (calm)
- Row click navigates to correct stage route (intake→/intake, compile_render→/, execute→/execute, audit→/audit)
- Loading state (spinner), Error state (alert + retry), Empty state (inbox icon + copy + New Run CTA)
- Table footer: "N runs · Showing N [of N]"
- App.js: /runs route added, nav-runs-btn updated to navigate to /runs
- All interactive elements have data-testid attributes
- Test coverage: 100% (iteration_6) — 50+ tests across all filter states and all status types

- [x] RunsRegistryPage: full Runs Registry with 6 filters, 7-column table, status/attention pills, row navigation, loading/empty/error states

### PlansRegistryPage.js (Completed — Feb 2026)
- **8 mock plans** covering all statuses: active, completion_ready, complete, abandoned
- Compact top nav: Plans (active), Runs, + New Plan (blue primary)
- Page header: "Plans" / "Managed multi-pass orchestration plans" / summary row (N plans · N need attention ⚠)
- 6 operational filter tabs (All, Active, Completion Ready, Needs Attention, Complete, Abandoned) — bottom-border underline style with monospace count badges
- Table: 7 columns — Plan (title + compact meta: planId/repo/branch), Status, Progress (segmented bar + N/M count), Current/Next Pass (dot indicator + pass title), Updated, Attention, Chevron
- PassProgressBar: 10-segment indicator; filled=bg-blue-500/65, empty=bg-slate-800; proportional scaling for >10 passes
- CurrentPassCell: dot (blue=ready, animated-blue=running, red=blocked) + pass ID + pass title; "ALL COMPLETE" for complete plans; "—" for abandoned/completion_ready
- StatusPill: Active=blue, Completion Ready=amber, Complete=emerald, Abandoned=muted gray
- AttentionPill: TriangleAlert + label — "Next pass ready"(blue), "In progress"(blue), "Completion ready"(amber), "Blocked"(red), "No runs yet"(muted)
- Row hierarchy: attention rows text-slate-100 (bright), non-attention rows text-slate-400 (calm)
- Loading state: 5-row skeleton with animate-pulse matching column structure
- Error state: compact banner + Retry CTA
- Empty state: Inbox icon + "No managed plans yet" + context copy + "New Plan" + "View Runs" buttons
- Table footer: "N plans · Showing N [of N]"
- App.js: /plans route added, Plans button added to RelayShell nav (stage pages), RunsRegistryPage nav updated with Plans button
- All interactive elements have data-testid attributes
- Test coverage: 100% (iteration_7) — 50 tests across all filter states and all plan statuses

### PlanDetailPage.js (Refined — Feb 2026)
- **Purpose**: Single plan detail view for plan orchestration, showing all passes in order with dependencies and status
- **Route**: `/plans/:planId`
- **Structure**:
  - Top nav: Relay branding + Plans (active) + Runs — consistent with PlansRegistryPage
  - Header: Breadcrumb (← Plans · plan title) + plan title + status badge + compact metadata bar (planId copyable · repo · branch · source artifact · updated timestamp)
  - State card: colored left-accent card (blue=active, amber=completion_ready, green=complete, gray=abandoned), eyebrow (PLAN ACTIVE etc.), current pass name + goal, "Copy context" + "Open current pass" CTA
  - Progress strip: segmented bar (emerald=completed, blue=in_progress, dark=remaining) + inline counts (6 passes · 2 completed · 1 in progress · 3 planned)
  - Pass timeline: ordered vertical list with:
    - Absolute 2px left accent (blue=current, red=blocked, faint green=completed)
    - Sequence number + status dot
    - Pass name + passId (monospace) + status badge
    - Goal (1 line truncated, hidden for completed) + scope (only for current pass)
    - Dependency pills: red "Blocked by pass-xxx" if blocked, muted pill if satisfied
    - Run hint: compact monospace runId or quiet "No run yet"
    - **Contextual action** (ONE per row): completed=View, in_progress=Open (blue), planned+unblocked=Create run, planned+blocked=Waiting (disabled)
    - Copy passId icon (far right, subtle)
  - Plan Context section: compact key-value footer (source intent text + artifact/repo/branch/planId/updated)
- **Visual style**: bg-[#0e0e0e], surface #111111, borders #1a1a1a/#161616 — exact Relay style
- **Blocking logic**: Pass blocked if any dependency not completed; shows red "Blocked by pass-xxx" with AlertCircle
- **Navigation**: Clickable plan rows in PlansRegistryPage → detail; back button → /plans
- **Mock data**: MOCK_PLAN_DETAIL in App.js with 6 passes showing completed/in_progress/planned/blocked states
- All interactive elements have data-testid attributes
- Test coverage: Screenshot verified all states, navigation, blocking behavior, contextual actions

### P1 — Next
- [ ] CompileRenderPage: badge format snake_case → Title Case (LOW, same as ExecutePage fix done)
- [ ] CompileRenderPage: active/running compile state (progress indicator on compile step)
- [ ] CompileRenderPage: success states (green checkmarks, artifacts list populated)

### P2 — Future / Backlog
- [ ] Timestamp formatting: Convert ISO timestamps to relative times ("3 minutes ago") across all pages (Execute/Audit/Intake/Runs/Plans detail)
- [ ] Wire up pipeline stages with real prop-based navigation/state sharing between stages
- [ ] CompileRenderPage: validation failure state (red step, repair eligibility)
- [ ] CompileRenderPage: approval CTA row when brief is validated
- [ ] Integrate frontend with actual backend APIs (replace hardcoded mock data in App.js)
- [ ] Create "demo walkthrough" mode that auto-advances through pipeline states
- [ ] Add run "quick-open" hover tooltip on Runs Registry showing last log entries
- [ ] Add inline pass timeline expansion on Plans Registry progress bar click
- [ ] Logs tab with actual log streaming / pagination
- [ ] Collapsible pipeline steps on hover
- [ ] Transition animations between pipeline states
- [ ] Keyboard navigation for stage tabs
