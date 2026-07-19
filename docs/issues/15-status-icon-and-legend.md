# 15 — Replace "đang dùng" text with an icon + add an info legend for the icons

- **Type:** Enhancement
- **Priority:** P3
- **Effort:** S
- **Labels:** `enhancement`, `ux`, `accounts`

## Problem

Two small UX asks on the account panel:

1. The **"đang dùng"** (in use) status is shown as text; make it an **icon** instead
   (less clutter, consistent with the other icon actions).
2. Add an **info icon** to the **left** of the **Làm mới % usage tất cả** (refresh-all)
   button that, on hover, explains what each icon/action in the panel means.

## Current behavior

`web/src/AccountBadge.jsx`:

- Active status is text: `on && <span className="acct-active">đang dùng</span>`
  (there are also text tags `đã tắt` / `hết hạn`).
- The panel header (`.acct-title-btns`) has only two buttons: refresh-all (`↻`) and add
  (`+`). The per-row actions (`🔑` relogin, `★/☆` default, `⏻/▶` enable, `↻` refresh,
  `✕` delete) are icon-only with `title=` tooltips, but there's no consolidated legend.

## Proposed fix

1. **Status → icon:** replace the "đang dùng" text with a small icon (e.g. a filled
   green dot / ▶ / ✓) carrying a `title="đang dùng"` tooltip. Consider doing the same for
   `đã tắt` / `hết hạn` for consistency (icon + tooltip), or leave those as-is.
2. **Info legend:** add an info button (ℹ️) as the first item in `.acct-title-btns`
   (left of refresh-all). On hover it shows a legend of all icons/actions. Simplest is a
   rich `title=` string; nicer is a small popover/tooltip component listing:
   - `★/☆` — set/unset default account
   - `⏻/▶` — disable / re-enable account
   - `↻` — refresh usage (row) / all (header)
   - `🔑` — re-login (token expired)
   - `✕` — remove from list
   - status icon — currently in use

Sketch (`AccountBadge.jsx`):

```jsx
<div className="acct-title-btns">
  <button className="acct-icon" title={"Chú thích icon:\n★ mặc định  ⏻ tắt/bật  ↻ làm mới  🔑 đăng nhập lại  ✕ xoá"}>ℹ️</button>
  <button className="acct-icon" onClick={refreshAll} title="Làm mới % usage tất cả">↻</button>
  <button className="acct-icon" onClick={() => setAdding(true)} title="Thêm account">+</button>
</div>
// status:
{on && <span className="acct-active" title="đang dùng" aria-label="đang dùng">▶</span>}
```

## Affected files

- `web/src/AccountBadge.jsx` (status icon; info button + legend)
- `web/src/styles.css` (optional: popover styling if not using a plain `title`)

## Acceptance criteria

- [ ] The active account shows an **icon** (with tooltip) instead of the "đang dùng" text.
- [ ] An **info** icon sits to the left of refresh-all and, on hover, explains every
      icon/action in the panel.
- [ ] No action/behavior changes — purely presentational.

## Risks / notes

- A multi-line `title` (with `\n`) is the zero-dependency option; a small popover reads
  better but adds a component. Either satisfies the requirement.
- Keep `aria-label`s on icon-only controls for accessibility.
