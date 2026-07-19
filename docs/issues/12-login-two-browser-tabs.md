# 12 — Login opens two browser tabs at once

- **Type:** Bug
- **Priority:** P2
- **Effort:** S
- **Labels:** `bug`, `login`, `ux`

## Problem

Clicking **Thêm account Claude** → **Lấy link đăng nhập** opens **two**
`platform.claude.com` tabs simultaneously. After authorizing, one tab lands on
`.../oauth/code/success?app=claude-code` and the other on
`.../oauth/code/callback?code=...`. Confusing, and it's unclear which code to copy.

## Root cause / current behavior

The URL is opened **twice**:

1. The frontend opens it: `AccountLogin.jsx` `start()` calls
   `window.open(j.url, "_blank", "noopener")`.
2. The `claude` CLI process (spawned by `login/start` in `server/index.js`) **also**
   opens the system browser to its OAuth URL as part of `claude auth login`.

Hence two tabs with two different terminal redirects (the CLI's own loopback/success
page vs the manual code page).

## Proposed fix

Open the login URL **once**. Preferred: let the CLI open it (or suppress the CLI's
auto-open and open it only from the app). Pick one owner of "open the browser":

- **Option A (simplest):** remove the frontend `window.open(...)`; keep the modal's
  manual link (`mở link đăng nhập ↗`) so the user can open it if the CLI didn't. Then
  only the CLI's tab appears.
- **Option B:** suppress the CLI's browser auto-open (e.g. run with an env like
  `BROWSER=none` / `CLAUDE_CODE_* ` no-open flag if supported, or a headless login
  flag) and keep the frontend `window.open`. This gives the app control over the tab
  and matches the "paste the code" flow.

Recommend **Option B** if a reliable no-open flag exists for the installed CLI (keeps
the code-paste UX coherent); otherwise **Option A**.

Sketch (Option A, `AccountLogin.jsx`):

```jsx
// setLoginId(j.loginId); setUrl(j.url); setStep("code");
// window.open(j.url, "_blank", "noopener");   // <-- remove; CLI already opens it
```

## Affected files

- `web/src/AccountLogin.jsx` (remove/keep `window.open` depending on option)
- `server/index.js` (`login/start` — if Option B, set the CLI env/flag to not auto-open)

## Acceptance criteria

- [ ] Starting a login opens exactly **one** browser tab.
- [ ] The user can still reach the auth page via the modal's manual link if no tab opened.
- [ ] The code-paste flow still completes the login.

## Risks / notes

- Verify how the installed `claude auth login --claudeai` handles the browser (does it
  auto-open? is there a no-open flag?). This overlaps with issue 01's note to confirm
  the login subcommand for the current CLI version.
- If the CLI's own loopback flow **completes login by itself** (the `.../success` tab),
  the manual code-paste step may be redundant — worth confirming whether both are needed
  or the flow can be simplified to a single mechanism.
