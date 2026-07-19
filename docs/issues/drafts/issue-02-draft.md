<!-- DRAFT for github.com/TranDuy13/agile-studio · edit freely before opening the issue -->
<!-- Suggested title: -->
# [Bug/UX] Accounts panel shows "Default" instead of the account's real email

**Suggested labels:** `bug`, `ux`, `accounts`

## Description

In the **Tài khoản Claude** ("Claude accounts") panel, each account shows the
user-typed nickname/label (e.g. `Default`) instead of the real Claude account email.
Expected: show the actual email (e.g. `doducminh1511@gmail.com`) so it's easy to tell
which account is in use.

## Current behavior

- The UI renders the user-typed label:
  `web/src/AccountBadge.jsx` (~line 68) → `{a.label}`.
- The list endpoint doesn't return an email:
  `server/index.js` (~line 151, `GET /api/accounts`) only returns `id, label,
  disabled, loggedIn, usage`.
- The email is **already obtainable** — `fetchProfile(configDir)`
  (`server/accounts.js:108`) calls `/api/oauth/profile` and returns
  `{ email, name, plan, org }` — but it's only used by the detailed usage endpoint,
  not the list.

## Proposed fix

1. Add `email` to `GET /api/accounts` via `fetchProfile`. Since it's a network call,
   **cache it per `configDir`** (email rarely changes) so the list stays fast —
   similar to how `usage` is only fetched on demand (`?usage=1`).
2. Render `a.email || a.label` in the UI; keep `label` as a fallback/tooltip so the
   nickname isn't lost.

Server sketch:

```js
const profileCache = new Map(); // configDir -> { email, at }
async function emailFor(configDir) {
  const hit = profileCache.get(configDir);
  if (hit && Date.now() - hit.at < 3600_000) return hit.email;
  const p = await fetchProfile(configDir);
  profileCache.set(configDir, { email: p?.email || null, at: Date.now() });
  return p?.email || null;
}
// in GET /api/accounts: email: await emailFor(a.configDir),
```

UI sketch (`AccountBadge.jsx`):

```jsx
<button className="acct-label" title={a.label} onClick={() => setViewing(a)}>
  {a.email || a.label}
</button>
```

## Definition of Done

- [ ] A logged-in account shows its real email in the panel.
- [ ] A logged-out / expired account gracefully falls back to the label.
- [ ] The account list is not noticeably slower (email is cached).

## Notes

- Only fetch the profile when `loggedIn === true`.
- Keep `label` editable — it's still useful when multiple accounts share an email or
  before the first profile fetch.

> I'm happy to open a PR for this. 🙌
