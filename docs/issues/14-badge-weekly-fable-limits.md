# 14 — Keep the sidebar badge to the 5h limit; show weekly/per-model/Fable in the Usage dialog

- **Type:** Enhancement
- **Priority:** P3
- **Effort:** S
- **Labels:** `enhancement`, `ux`, `accounts`, `usage`

## Problem

**Corrected decision:** the sidebar account badge should stay minimal — **only the
current session (5h)** limit. The other limits (weekly total, per-model Opus/Sonnet, and
**Fable**) belong in the **Usage detail dialog** (`UsageModal`), which the user opens by
clicking an account. The dialog already shows 5h / 7-day / Opus / Sonnet / detailed
limits; it just needs a **Fable** line when the API returns one.

(Earlier this was scoped as "add weekly + Fable to the sidebar badge"; that was reversed
— the sidebar stays 5h-only.)

## Current behavior

`web/src/AccountBadge.jsx` renders a single bar from `a.usage.fiveHourPct` and the label
`"% (5h)"`. It does not show weekly, and there's no per-model line.

Data available from `GET /api/accounts/:id/usage` (`server/accounts.js` `fetchUsage`):

- `fiveHourPct`, `sevenDayPct` (weekly total), `sevenDayResetsAt`.
- `opusPct`, `sonnetPct` (per-model 7-day) — **null** unless the account has them.
- `limits[]` with entries like `{ kind:"session", group:"session", … }`,
  `{ kind:"weekly_all", group:"weekly", … }`, `{ kind:"weekly_scoped", group:"weekly", … }`.

**Note (verified on a real account):** the payload had `session` + `weekly_all` +
`weekly_scoped` only; `opusPct`/`sonnetPct` were null and **no Fable field was present**.
So Weekly is readily available, but a **Fable** limit must be rendered *defensively* —
only when the API actually returns it.

## Proposed fix

1. **Sidebar badge:** leave it as-is — a single 5h bar + `"% (5h)"`. No weekly/Fable in
   the sidebar.
2. **Usage dialog (`UsageModal`):** it already renders 5h / 7-day / Opus / Sonnet /
   detailed limits. Add a **Fable** bar shown only when data is present:
   - Extend `fetchUsage` to map `fablePct: j?.seven_day_fable?.utilization ?? null`
     (defensive; may also be derivable from a `limits[]` entry denoting Fable).
   - In `UsageModal`, render `{u.fablePct != null && <Bar label="7 ngày · Fable" pct={u.fablePct} />}`.

Sketch (`UsageModal.jsx`):

```jsx
<Bar label="Cửa sổ 5 giờ" pct={u.fiveHourPct} reset={u.resetsAt} />
<Bar label="7 ngày (tổng)" pct={u.sevenDayPct} reset={u.sevenDayResetsAt} />
{u.opusPct   != null && <Bar label="7 ngày · Opus"   pct={u.opusPct} />}
{u.sonnetPct != null && <Bar label="7 ngày · Sonnet" pct={u.sonnetPct} />}
{u.fablePct  != null && <Bar label="7 ngày · Fable"  pct={u.fablePct} />}
```

## Affected files

- `server/accounts.js` (`fetchUsage` — add `fablePct` if the API exposes it)
- `web/src/UsageModal.jsx` (render the Fable bar when present)
- `web/src/AccountBadge.jsx` (unchanged — stays 5h-only)

## Acceptance criteria

- [ ] The sidebar badge shows only the 5h figure (no weekly/Fable).
- [ ] The Usage dialog shows 5h / 7-day / Opus / Sonnet / detailed limits, plus a
      **Fable** line when the API returns one (hidden otherwise).
- [ ] Accounts without usage loaded still render gracefully (`—`).

## Risks / notes

- The exact Fable field name is **unverified** (not present in the tested account). Spike
  a real Fable-using account's `/usage` payload before finalizing the field mapping;
  until then render it defensively so nothing breaks when it's absent.
- The `UsageModal` already shows 5h / 7d / per-model / detailed limits — reuse its
  `barColor` conventions for visual consistency.
