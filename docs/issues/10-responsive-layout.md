# 10 — Responsive layout: collapsible sidebar + fix overflow

- **Type:** Enhancement
- **Priority:** P2
- **Effort:** S (shipped)
- **Labels:** `enhancement`, `ux`, `css`, `responsive`

## ✅ Đã ship (GitHub issue #19 · PR #20)

Bản **stacked, CSS-only** (không hamburger/JS/drawer). Media query `@media (max-width: 820px)`
trong `web/src/styles.css`: `.app` đổi sang 1 cột + rows `auto 1fr` (sidebar trên, cap 44vh,
scroll riêng; main dưới — **cả hai luôn hiện**); `.acct-row` wrap; `.topbar` wrap; `.docs`
stack list trên editor. Desktop (>820px) giữ nguyên. Lần trước thử off-canvas drawer → regress
→ đã revert; bản này dùng stacked. Phần dưới là spec gốc (giữ tham chiếu).

## Problem

The UI is not responsive. On narrow windows the fixed sidebar eats the viewport, the
account panel text truncates (`doducminh1115@gma…`), and the main content doesn't
reflow. There are **no** media queries in the stylesheet.

## Current behavior

`web/src/styles.css`:

- `.app { display:grid; grid-template-columns:260px 1fr; height:100vh; }` — fixed
  two-column grid, no breakpoints.
- `.sidebar { … padding:16px 14px; }` — fixed 260px column.
- `.acct-label { … overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }` —
  already ellipsizes; the row just has too little width once the action buttons
  (`.acct-acts`) are shown.
- `grep '@media' web/src/styles.css` → **none**.

## Proposed fix (revised: STACKED layout, not an off-canvas drawer)

> **Lesson learned:** a first attempt used an off-canvas drawer + hamburger + backdrop
> at `≤ 900px`. It **regressed** the UI — with no project selected the main area is an
> empty placeholder, so hiding the sidebar behind a backdrop made the app look broken at
> narrow widths. That attempt was reverted. Prefer the stacked approach below.

Cover laptop → tablet without ever hiding the sidebar/main:

1. **Breakpoint (~≤ 820px):** stack — `.app { grid-template-columns:1fr; grid-template-rows:auto 1fr; height:100vh; }`
   so the sidebar sits on top (its own scroll area, capped height) and main flows below.
   The sidebar is **always visible**; nothing is hidden behind a backdrop.
2. **Account panel overflow:** let `.acct-row` wrap so the email/label isn't crushed;
   keep the `title` tooltip as the full value.
3. **Topbar / session grid:** allow the tabs + buttons to wrap; `.session-grid` is
   already fluid (`repeat(auto-fill, minmax(260px, 1fr))`).
4. Verify modals use a sensible `width:min(…, 92vw)` so they don't overflow.

Sketch:

```css
@media (max-width: 820px) {
  .app { grid-template-columns:1fr; grid-template-rows:auto 1fr; }
  .sidebar { border-right:none; border-bottom:1px solid var(--line); max-height:44vh; }
  .acct-row { flex-wrap:wrap; }
}
```

Keep the breakpoint conservative — the app is often used in a narrow window, so don't
collapse too early.

## Affected files

- `web/src/styles.css` (media queries; account panel wrap; fluid session grid)
- `web/src/App.jsx` (sidebar open/close state + hamburger toggle + `.app` class)

## Implementation steps

1. Add `sidebarOpen` state + hamburger button (visible only under the breakpoint).
2. Add the `@media (max-width: 900px)` rules (drawer sidebar + backdrop).
3. Fix `.acct-row` wrapping / `.acct-acts` placement so labels don't truncate.
4. Make `.session-grid` and topbar reflow.
5. Sanity-check modals at narrow widths.

## Acceptance criteria

- [ ] At ≤ 900px the sidebar is hidden behind a toggle and the main area uses full width.
- [ ] The account email/label no longer truncates awkwardly (wraps or full-width).
- [ ] Session cards and topbar controls reflow instead of overflowing.
- [ ] Desktop (> 900px) layout is unchanged.

## Risks / notes

- Keep desktop untouched — only add behavior under the breakpoint.
- The WS URL in `App.jsx` hardcodes `location.host.replace("5311","4311")`; unrelated to
  layout but worth a separate cleanup (ties into issue 03's configurable ports).
