# Relay Compile/Render Stage — PRD

## Original Problem Statement
Redesign and refine the Relay Prepare stage page (Compile / Render). Replace the visually dense, equal-weight layout with a clear hierarchy showing current blocked state, compact pipeline stepper, and a streamlined inspector panel.

## Architecture
- **Stack**: React 19 + Tailwind CSS + shadcn/ui (Radix)
- **Deliverable**: Drop-in component at `/app/frontend/src/components/relay/CompileRenderPage.js`
- **Demo wrapper**: `/app/frontend/src/App.js` (RelayDemoShell with mock data)

## User Personas
- Developer / engineer using Relay as a run orchestration/dispatch workbench
- Needs to understand current run state, blockers, and next valid action at a glance

## Core Requirements (Static)
1. Dark technical UI (`#0e0e0e` background, `#1a1a1a` surface, 1px borders)
2. Relay shell chrome preserved: top nav, run header, breadcrumb, stage tabs
3. Compile/Render page content: stage header, blocker card, pipeline stepper, artifacts
4. Right inspector panel with 4 tabs: Details, Artifacts, Validation, Logs
5. Compact pipeline with 6 steps showing clear status hierarchy
6. Props-driven component — accepts all data from parent
7. Blue/cyan/gold accents, monospace for statuses/IDs

## What's Been Implemented (June 21, 2026)
- **CompileRenderPage.js**: Complete drop-in component
  - Stage header with subtitle + run state amber badge
  - Blocker card (amber) with "Prepare is blocked" + "Return to Intake Review" CTA
  - 6-step pipeline stepper (blocked/waiting/na states with distinct icons and badges)
  - Artifacts empty state section
  - Right inspector panel with shadcn Tabs (Details/Artifacts/Validation/Logs)
  - Inspector Details: 5 stacked sections (Run State, Compiled Packet, Repair, Executor Brief, Approval)
  - All interactive elements have data-testid attributes
- **App.js**: Demo shell with full Relay chrome + mock `intake_needs_review` state
- **Webpack fix**: Patched `react-scripts` webpackDevServer.config.js for wds v5 compatibility

## Props Interface (CompileRenderPage)
```
runState, packetId, repo, branch, worktree, executionProfile, targetModel
compileStatus, packetValidationStatus, repairStatus, briefStatus, briefValidationStatus, approvalStatus
artifacts: [{ path: string }]
onReturnToIntake: () => void
```

## Prioritized Backlog
### P0 — Complete
- [x] Blocked state layout with dominant blocker card
- [x] Compact pipeline stepper (6 steps)
- [x] Inspector panel with tabs and stacked KV sections

### P1 — Next
- [ ] Active / running compile state (progress indicator on compile step)
- [ ] Success states (green checkmark steps, artifacts list populated)
- [ ] Validation failure state (red step, repair eligibility shown)
- [ ] Approval CTA row when brief is validated

### P2 — Future
- [ ] Collapsible pipeline steps on hover
- [ ] Logs tab with actual log streaming
- [ ] Transition animations between pipeline states
- [ ] Keyboard navigation for stage tabs
