# Agile Studio — Issue & Feature Backlog

GitHub-issue-ready specs for `agile-studio`. Each file below maps to **one** issue
or feature request: copy its body into a new GitHub issue.

Paths in these docs are relative to the app folder `agile-studio/` (e.g.
`server/index.js` = `agile-studio/server/index.js`).

> **Scope note:** the "public production" direction was dropped. The former issues
> **06 (OIDC auth)** and **07 (per-account isolation)** are removed; the app stays a
> local / single-instance tool. Numbering keeps a gap at 06–07 on purpose so existing
> references stay stable.

## Backlog

| # | Title | Type | Priority | Effort | Depends on |
|---|-------|------|----------|--------|-----------|
| [01](./01-login-spawn-enoent.md) | Login & runs fail with `spawn claude ENOENT` | Bug | **P0** | M | — |
| [02](./02-account-show-email.md) | Show real account email instead of "Default" | Bug | P1 | S | — |
| [03](./03-configurable-paths-dotenv.md) | Configurable paths via `.env` (dotenv) | Bug / Chore | P1 | S–M | — |
| [04](./04-pluggable-storage.md) | Pluggable storage adapter (JSON / SQLite / Postgres) | Feature | P2 | L | 03 |
| [05](./05-project-skill-settings.md) | Project-wide skill / plugin / role settings | Feature | P2 | M | 03 |
| [08](./08-shared-discord-bot.md) | Single Discord bot config via `.env` | Feature | P3 | S | 03 |
| [09](./09-usage-auto-refresh.md) | Refresh usage on window focus (not only manual) | Enhancement | P3 | S | — |
| [10](./10-responsive-layout.md) | Responsive: collapsible sidebar + fix overflow | Enhancement | P2 | M | — |
| [11](./11-guard-duplicate-account.md) | Guard against adding a duplicate account | Bug | P2 | S | 02 |
| [12](./12-login-two-browser-tabs.md) | Login opens two browser tabs at once | Bug | P2 | S | — |
| [13](./13-optional-account-nickname.md) | Optional nickname; show nickname else email | Enhancement | P2 | S | 02 |
| [14](./14-badge-weekly-fable-limits.md) | Badge: Weekly (+ Fable) limit next to 5h | Enhancement | P3 | S–M | — |
| [15](./15-status-icon-and-legend.md) | Status icon + info legend for panel icons | Enhancement | P3 | S | — |
| [16](./16-add-account-loading-state.md) | Add-account: no loading state, modal rewinds; new account's usage not fetched | Bug | P2 | S | 02, 11, 13 |
| [17](./17-integration-connection-status.md) | Connection status for Storage & Discord bot (reason + retry) | Feature | P2 | M | 04, 08 |
| [18](./18-usage-dialog-details.md) | Usage dialog: auth method, resets, claude.ai link, quota attribution | Enhancement | P3 | M | 02, 14 |

**Priority key:** P0 = blocker (nothing works), P1 = high, P2 = planned, P3 = nice-to-have.
**Effort key:** S ≈ hours, M ≈ 1–2 days, L ≈ several days.

**09–15** were found while testing the 01–03 fixes (real login session): account-panel
UX, responsive, and login-flow polish.

**16–18** came out of the next round of real use: the add-account flow (16), no way to tell
whether the configured storage / Discord bot is actually connected (17), and a usage dialog
that lags behind Claude Code's own Account & Usage panel (18).

## Suggested order

1. **01** — without it, login and every agent run fail on Windows. Blocker.
2. **02**, **03** — small, high-value quality-of-life fixes.
3. **04** — storage foundation (JSON default → SQLite/Postgres option).
4. **05**, **08** — independent improvements, can land any time after 03.
5. **11**, **12**, **13** — login-flow correctness (duplicate guard, single tab, nickname).
6. **09**, **10**, **14**, **15** — account-panel & responsive polish.
7. **16**, **17**, **18** — add-account flow, integration status, usage dialog.

## Milestones

- **M1 — "Works on Windows"**: 01, 02, 03.
- **M2 — "Storage & config"**: 04, 05, 08.
- **M3 — "Account UX & responsive"**: 09, 10, 11, 12, 13, 14, 15.
- **M4 — "Biết chuyện gì đang xảy ra"**: 16, 17, 18 (trạng thái rõ ràng: đang chờ gì,
  kết nối được không, quota đi đâu). Làm local trước — chưa mở issue/PR trên upstream.
