# Implemented fixes — issues 09–15

Status: **implemented in the working tree, not committed.** Verified: `vite build`
compiles clean (39 modules); server boots and `GET /api/accounts?usage=1` now returns
`email` + `fablePct`. Paths relative to `agile-studio/`.

## Files touched

**Server**
- `server/index.js` — optional/empty nickname on `login/start` (13); **duplicate-account
  guard** in `login/code` (11); import `emailFor` + `defaultConfigDir`.
- `server/accounts.js` — `addAccount` stores empty label when no nickname (13);
  `fetchUsage` maps `fablePct` (14).

**Web**
- `web/src/AccountLogin.jsx` — remove the extra `window.open` (12); nickname field
  optional, button no longer requires it (13).
- `web/src/AccountBadge.jsx` — refresh usage on window focus w/ 30s debounce (09);
  display rule `nickname || email || id` via exported `acctName` (13); 5h + 7d
  (+ conditional Fable) mini-bars (14); "đang dùng" → ▶ icon + ℹ info legend (15).
- `web/src/UsageModal.jsx` — title uses `acctName` (13).
- `web/src/App.jsx` — pass `defaultModel` to badge (14); collapsible sidebar state +
  hamburger + backdrop; close drawer on project select (10).
- `web/src/styles.css` — mini-bar styles + info icon + active icon (14/15); hamburger,
  backdrop, `@media (max-width:900px)` drawer + reflow (10).

## Per-issue notes + suggested commits

### 09 — check usage on load (F5) + on window focus
Fetch usage on mount (`refreshAll()` in a mount effect) so a page reload auto-checks
limits, plus on-focus/visibilitychange with a 30s debounce (`lastRefresh` ref, shared
with the manual buttons). No background polling.
```
feat(accounts): check usage on load and when the tab regains focus (debounced)
```

### 10 — responsive: **reverted**
The off-canvas drawer (`@media (max-width:900px)` + hamburger + backdrop) **regressed the
UI** at narrow window widths — the sidebar hid behind a backdrop and the app looked
broken. Reverted App.jsx (state/hamburger/backdrop) and the CSS media block back to the
stable fixed `260px 1fr` layout. A responsive redo should use a **stacked** layout
(sidebar on top, main below) rather than an off-canvas drawer — re-scope issue 10.
```
revert(ui): remove off-canvas sidebar drawer (regressed layout on narrow widths)
```

### 11 — duplicate-account guard
After a successful login, resolve the new account's email and reject (409) if another
account already has it; clean up the temp config dir. Re-login into an existing account
(same id) is unaffected.
```
fix(accounts): reject adding an account whose email already exists
```

### 12 — single browser tab on login
Removed the frontend `window.open(url)`; the `claude` CLI already opens the browser, so
only one tab appears. Manual link kept in the modal as fallback.
```
fix(login): stop opening a second browser tab on login start
```

### 13 — optional nickname; show nickname else email
Nickname optional (empty stored as `""`); display prefers a real nickname, else email,
else id. **Reverses issue 02's `email || label`** — the synthetic `"Default"` label is
treated as "unset" so it shows the email.
```
feat(accounts): make nickname optional; show nickname, else email
```

### 14 — sidebar badge shows only the 5h limit; weekly/per-model/Fable live in the dialog
Final decision (corrected): the **sidebar badge shows only the 5h session limit**. The
**Usage dialog** keeps the full breakdown (5h, 7-day, Opus/Sonnet, detailed limits) and
now also shows a **Fable** line when present. `fetchUsage` maps `fablePct` from
`seven_day_fable` (defensive) to feed the dialog.
```
feat(usage): add Fable line to the usage dialog; keep the sidebar badge to 5h only
```

### 15 — status icon + info legend
"đang dùng" text → ▶ icon (tooltip); ℹ info button (left of refresh-all) with a
multi-line legend of all panel icons.
```
feat(accounts): iconize active status and add an icon legend
```

## Verification done

- `npx vite build` → success (no JSX/import errors).
- `SERVER_PORT=4517 node server/index.js` → boots; `/api/accounts?usage=1` returns
  `email` and `usage.fablePct` (null, since the account has no Fable limit).

## Remaining manual checks

- **11:** log in twice with the same Claude account → second attempt shows
  "Account <email> đã có trong danh sách." and adds no row.
- **12:** click **Lấy link đăng nhập** → exactly one tab opens.
- **13:** add an account with an empty nickname → badge shows the email; add one with a
  nickname → badge shows the nickname.
- **09:** switch away and back to the tab → usage refreshes (after ≥30s).
- **10:** narrow the window < 900px → hamburger toggles the sidebar; labels don't clip.
- **14/15:** badge shows 5h + 7d bars, ▶ active icon, and ℹ legend on hover.

## Follow-up refinements (from screenshot review)

- **Name ≠ email (stale cache):** the badge/modal name showed a cached email
  (`…1115`) that disagreed with the live profile (`…1511`). Root cause: `emailFor`'s
  cache wasn't invalidated after a re-login. Added `clearProfileCache(configDir)`
  (`server/accounts.js`) and call it on login success in `login/code` (`server/index.js`).
  A fresh server also starts with an empty cache. Verified: fresh boot returns the
  correct `doducminh1511@gmail.com`.
  ```
  fix(accounts): invalidate cached email after (re)login so the display matches
  ```
- **Info icon + legend redesign (15):** replaced the native `title` tooltip with a
  styled info icon (circled *i*) and a themed hover/focus popover listing each icon
  (`IconLegend` in `AccountBadge.jsx` + `.acct-legend*` CSS).
  ```
  style(accounts): prettier info icon with a themed legend popover
  ```
- **Sidebar badge trimmed to 5h only (corrected):** the weekly + Fable were meant to be
  removed from the **sidebar**, not the dialog. The badge now shows only the 5h bar; the
  Usage **dialog** keeps its full breakdown and gains a Fable line when present.
  ```
  fix(accounts): keep the sidebar badge to the 5h limit; full detail stays in the dialog
  ```

## Risks / notes

- **14 Fable is unverified**: the field `seven_day_fable.utilization` is a best guess;
  the tested account returned `fablePct: null`. Confirm against a real Fable-using
  account before relying on it. Weekly (`sevenDayPct`) is confirmed present.
- **12 open question**: if the CLI completes its own OAuth (the `/success` tab), the
  manual code-paste may be redundant — possible future simplification of the login flow.
- **13 consistency**: this reverses the display rule shipped for issue 02; both are now
  aligned to `nickname || email`.
