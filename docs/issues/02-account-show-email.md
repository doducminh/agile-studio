# 02 — Show the real account email instead of "Default"

- **Type:** Bug / UX
- **Priority:** P1
- **Effort:** S
- **Labels:** `bug`, `ux`, `accounts`

## Problem

In the **Tài khoản Claude** panel, an account shows its nickname/label (e.g.
`Default`) instead of the actual Claude account email. The user wants the panel to
display the correct email of the logged-in account (e.g. `doducminh1511@gmail.com`).

## Root cause / current behavior

- The account list UI renders the user-typed label:
  - `web/src/AccountBadge.jsx:68` → `<button className="acct-label" …>{a.label}</button>`
- The list endpoint never returns an email:
  - `server/index.js:151` (`GET /api/accounts`) returns only `id, label, disabled,
    loggedIn, usage`.
- The email is already obtainable — `fetchProfile(configDir)`
  (`server/accounts.js:108`) calls `https://api.anthropic.com/api/oauth/profile` and
  returns `{ email, name, plan, org }` — but it's only used by the per-account usage
  endpoint, not the list.

## Proposed fix

1. Include `email` in `GET /api/accounts` by resolving each account's profile. Because
   `fetchProfile` makes a network call, do it **without blocking / slowing** the list:
   - memoize per `configDir` (email rarely changes), and/or
   - fetch lazily and cache, similar to how `usage` is only fetched on demand
     (`?usage=1`). A simple in-memory cache keyed by `configDir` is enough.
2. Render `a.email || a.label` in `AccountBadge.jsx`; keep `label` as a tooltip /
   secondary line so the user's nickname isn't lost.

Sketch (server):

```js
// simple memo so the list stays fast
const profileCache = new Map(); // configDir -> { email, name, plan, at }
async function emailFor(configDir) {
  const hit = profileCache.get(configDir);
  if (hit && Date.now() - hit.at < 3600_000) return hit.email;
  const p = await fetchProfile(configDir);
  profileCache.set(configDir, { ...(p || {}), at: Date.now() });
  return p?.email || null;
}
// in GET /api/accounts mapping:
email: await emailFor(a.configDir),
```

Sketch (UI, `AccountBadge.jsx`):

```jsx
<button className="acct-label" onClick={() => setViewing(a)}
        title={a.label}>{a.email || a.label}</button>
```

## Affected files

- `server/index.js` (`GET /api/accounts`, ~L151)
- `server/accounts.js` (reuse `fetchProfile`; optionally export a cached helper)
- `web/src/AccountBadge.jsx` (label rendering, ~L68)

## Implementation steps

1. Add a cached `emailFor(configDir)` (or extend the existing mapping) in the server.
2. Add `email` to each account object in the `/api/accounts` response.
3. Update `AccountBadge.jsx` to prefer `email`, fall back to `label`.
4. Confirm the panel still renders quickly (cache prevents N network calls per poll).

## Acceptance criteria

- [ ] A logged-in account shows its email (e.g. `doducminh1511@gmail.com`) in the panel.
- [ ] Accounts that are logged out / expired gracefully fall back to the label.
- [ ] The account list does not become noticeably slower (email is cached).

## Risks / notes

- Profile fetch requires a valid token; when `loggedIn === false`, skip the call and
  show the label.
- Keep `label` editable — it's still useful for distinguishing multiple accounts with
  similar emails or before first profile fetch.
