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

### P1 — Next
- [ ] **Audit stage page** — final step in pipeline (Intake → Compile/Render → Execute → Audit)
- [ ] CompileRenderPage: badge format snake_case → Title Case (LOW, same as ExecutePage fix done)
- [ ] CompileRenderPage: active/running compile state (progress indicator on compile step)
- [ ] CompileRenderPage: success states (green checkmarks, artifacts list populated)

### P2 — Future / Backlog
- [ ] Wire up pipeline stages with real prop-based navigation/state sharing between stages
- [ ] CompileRenderPage: validation failure state (red step, repair eligibility)
- [ ] CompileRenderPage: approval CTA row when brief is validated
- [ ] Logs tab with actual log streaming / pagination
- [ ] Collapsible pipeline steps on hover
- [ ] Transition animations between pipeline states
- [ ] Keyboard navigation for stage tabs
- [ ] Intake stage page design
