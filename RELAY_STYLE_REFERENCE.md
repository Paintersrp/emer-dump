# Relay — Visual Style Reference

Dark local workbench. Compact, operator-focused, technical. Not SaaS, not project-management.
No gradients, no shadows, no decorative polish. 1px borders for layer separation. Radius `rounded-sm` (2px) max.

## Design tokens

| Token | Value |
|---|---|
| Page background | `bg-[#0e0e0e]` |
| Surface | `bg-[#111111]` |
| Deep surface (editor/log) | `bg-[#0c0c0c]` / `bg-[#0b0b0b]` / `bg-[#080808]` |
| Border — strong (nav) | `border-[#222]` |
| Border — default | `border-[#1a1a1a]` |
| Border — subtle (inner) | `border-[#1e1e1e]` / `border-[#1c1c1c]` |
| Border — hairline (rows) | `border-[#161616]` |
| Text — primary | `text-slate-100` |
| Text — secondary | `text-slate-400` |
| Text — muted | `text-slate-500` / `text-slate-600` |
| Text — faint / meta | `text-slate-700` |
| Hover surface | `hover:bg-[#111111]` |
| Font — UI | Inter, ui-sans-serif, system-ui |
| Font — mono | `font-mono` (IDs, repo/branch, paths, code only) |

## Semantic color rules

| Meaning | States | bg / text / border |
|---|---|---|
| Active / current / running | active, running, in_progress | `bg-blue-500/15 text-blue-400 border-blue-600/30` (cyan variant for audit-ready/dispatch) |
| Review / attention / completion-ready / validation-needed | intake_review, completion_ready, needs-attention | `bg-amber-500/15 text-amber-400 border-amber-600/30` |
| Blocked / failed / invalid / conflict | blocked, validation_failed, conflict, rejected | `bg-red-500/15 text-red-400 border-red-600/30` |
| Complete / accepted / success | complete, accepted, passed, validated | `bg-emerald-500/15 text-emerald-400 border-emerald-600/30` |
| Skipped / abandoned / disabled / unavailable / planned | planned, skipped, abandoned | `bg-slate-500/10 text-slate-500 border-slate-700/30` |

## Components (canonical class strings)

**Status pill**
```
inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide whitespace-nowrap <semantic>
```

**Attention pill** (TriangleAlert icon size 9 + label)
```
inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium whitespace-nowrap <semantic>
```

**Page header**
```
px-4 sm:px-6 pt-5 pb-4 border-b border-[#1a1a1a] flex-shrink-0
  h1: text-xl font-semibold text-slate-100 tracking-tight
  subtitle: text-xs text-slate-500
```

**Top nav** (branding left, actions right)
```
flex items-center justify-between px-4 py-2.5 border-b border-[#222] flex-shrink-0
  right group: flex flex-wrap items-center justify-end gap-2   (wraps on mobile)
  version string: hidden sm:inline
```

**Desktop table row**
```
group border-b border-[#161616] cursor-pointer hover:bg-[#111111] transition-colors
  cells: px-4 py-3.5 ; first cell px-6
```

**Current-state card** (left-accent variant)
```
relative border border-[#1e1e1e] bg-[#111111] px-5 py-4
  accent: absolute inset-y-0 left-0 w-[2px] bg-<semantic-500>
  eyebrow: text-[10px] font-mono uppercase tracking-[0.18em] text-<semantic>-400
  title: text-sm font-medium text-slate-100
  message: text-xs text-slate-500
  on mobile: flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3
```

**Inspector panel** (right rail, tabbed: Details / Artifacts / Validation / Logs)
```
w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#1e1e1e] bg-[#0b0b0b] flex flex-col flex-shrink-0 lg:overflow-hidden
  tab trigger active: border-b-2 border-cyan-500 text-cyan-400
  KV row: label text-[10px] text-slate-600 / value text-[11px] font-mono text-slate-400
```

**Validation / error / empty / loading states**
```
empty:   border border-dashed border-[#1a1a1a] rounded-sm, icon text-slate-700, copy text-slate-600
error:   AlertCircle text-red-500/50 + retry text button
loading: Loader2/RefreshCw animate-spin text-slate-700 + label
conflict/failed: left-accent card (amber/red), mono code for offending value
```

## Mobile strategy

Breakpoint: `lg` (1024px) is the desktop/mobile divider for layout splits; `sm` (640px) tunes nav/padding.

- **Layout split**: every two-pane / main+inspector view uses
  `flex flex-col lg:flex-row` with the container `overflow-y-auto lg:overflow-hidden`.
  Main pane: `w-full lg:flex-1 lg:overflow-y-auto`. Side panel: `w-full lg:w-72` + `border-t lg:border-t-0 lg:border-l`.
  Inner scroll regions use `lg:flex-1 lg:overflow-y-auto` (natural height on mobile so the page scrolls as one column).
- **Tables → stacked rows**: desktop `<table className="hidden lg:table …">`; mobile a sibling `<div className="lg:hidden">` renders compact stacked rows (NOT giant cards):
  row1 = title + chevron; row2 = status + attention pills (+ progress for plans); row3 = mono meta (id/repo/branch · stage · updated).
- **Inspectors on mobile**: keep the existing Radix tabs; the panel stacks below the main content with a top border and shows the active tab — acts as an inline accordion/tab view, no fixed side rail.
- **Nav**: version string hidden `<sm`; action buttons wrap with `flex-wrap justify-end`; stage tabs row uses `overflow-x-auto`.

## Product boundaries (do not violate)
Plans organize intent · Passes define bounded work · Runs execute work.
Plan submission creates plan/pass records only. No plan/pass editing, no auto-next-pass,
no drift detection, no automatic executor dispatch, no implied automatic plan completion.
