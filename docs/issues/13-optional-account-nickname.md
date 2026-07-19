# 13 — Make the account nickname optional; show nickname if set, else email

- **Type:** Enhancement
- **Priority:** P2
- **Effort:** S
- **Labels:** `enhancement`, `ux`, `accounts`
- **Related:** 02 (which currently prefers email over label)

## Problem

The **Tên gợi nhớ cho account** (account nickname) field is effectively pointless now
that the panel shows the email: it's currently required, but the display ignores it.
Desired behavior:

- The nickname input is **optional** (no longer required to get a login link).
- Display rule: **if a nickname is provided, show the nickname; otherwise show the email.**

## Root cause / current behavior

- The nickname is required to proceed: `AccountLogin.jsx` disables the button with
  `disabled={(!relogin && !label.trim()) || step === "busy"}`.
- Issue 02 made the badge render `a.email || a.label` (`AccountBadge.jsx`), which
  **always prefers email** — so a user-typed nickname is never shown. This is the direct
  conflict to resolve.
- When no label is given, the server falls back to `label || id` (`addAccount` /
  `login/start` set `label` from `req.body.label || "Account"` / the id), so an empty
  nickname currently becomes a non-meaningful value rather than "unset".

## Proposed fix

1. **Make the input optional** — allow an empty nickname:
   - `AccountLogin.jsx`: button enabled even with empty `label`
     (`disabled={step === "busy"}` for the new-account case).
   - Server: when no nickname is given, store an **empty** label (not `"Account"`/id) so
     the display layer can tell "unset" from "user chose this".
2. **Flip the display rule** to `label || email` (nickname wins when present), i.e. in
   `AccountBadge.jsx` render `a.label?.trim() ? a.label : (a.email || a.id)`.
3. **Reconcile the synthetic "Default" account** — its label is `"Default"` (system, not
   user-chosen). Treat it as "unset" so it shows the email: either store its label as
   `""` in `loadDefault()`, or special-case `"Default"` in the display rule.

Sketch (`AccountBadge.jsx`):

```jsx
const display = (a) => (a.label && a.label.trim() && a.label !== "Default")
  ? a.label
  : (a.email || a.id);
// ...
<button className="acct-label" title={a.email || a.label}
        onClick={() => setViewing(a)}>{display(a)}</button>
```

Sketch (`AccountLogin.jsx`):

```jsx
<button className="primary" disabled={step === "busy"} onClick={start}>
  ▶ Lấy link đăng nhập
</button>
// placeholder hint: "để trống = dùng email làm tên hiển thị"
```

## Affected files

- `web/src/AccountLogin.jsx` (optional field; button no longer requires a nickname)
- `web/src/AccountBadge.jsx` (display rule → nickname if set, else email)
- `server/index.js` (`login/start` — store empty label when none provided instead of `"Account"`)
- `server/accounts.js` (`loadDefault` — consider empty label so Default shows email)

## Acceptance criteria

- [ ] The login link can be requested without entering a nickname.
- [ ] An account with a user-typed nickname shows the **nickname**.
- [ ] An account without a nickname (incl. the default) shows the **email**.
- [ ] The full email/label is still available on hover (tooltip).

## Risks / notes

- This intentionally **reverses** issue 02's `email || label` to `label || email`; make
  sure both changes are consistent (update issue 02's shipped code).
- Keep a fallback to `id` for the brief window before the email/profile is fetched.
