# 11 — Guard against adding a duplicate Claude account

- **Type:** Bug
- **Priority:** P2
- **Effort:** S
- **Labels:** `bug`, `accounts`

## Problem

Logging in and adding a Claude account that is **already** in the list succeeds
silently, creating a duplicate entry (same real Claude account appears twice). There is
no guard.

## Root cause / current behavior

- "Add account" always mints a **new** id: `id = "acc-" + Date.now().toString(36)`
  (`server/index.js`, `login/start`), so a second login of the same Claude account
  produces a different id.
- `addAccount({ id, label, configDir })` (`server/accounts.js`) only de-dupes by **id**
  (`loadAccounts().filter((a) => a.id !== id)` + `dedupe` on id). Different id + same
  underlying Claude account → not detected → duplicate row.
- Identity that actually matters is the **account email** (from `fetchProfile` /
  `emailFor`), not the id or the fresh config dir.

## Proposed fix

Before finalizing an add (in `login/code` after a successful login, `server/index.js`),
resolve the new account's email and reject if another account already has it.

- Use `emailFor(configDir)` (added in issue 02) to get the email of the just-logged-in
  config dir.
- Compare against `emailFor` of existing accounts; if a different account already has
  the same email, **abort**: don't call `addAccount`, clean up the temp config dir, and
  return a clear error (`"Account <email> đã tồn tại trong danh sách."`).
- Optionally: instead of a hard reject, offer to *re-login into the existing account*
  (reuse its `configDir`) — but the minimum is a guard + clear message.

Sketch (`server/index.js`, in `/api/accounts/login/code` before `addAccount`):

```js
const email = await emailFor(entry.configDir);
if (email) {
  const dup = loadAccounts().find((a) => a.id !== entry.id && (await emailFor(a.configDir)) === email);
  // (resolve emails first; pseudo-code) — if dup exists:
  //   try { rmSync(entry.configDir, { recursive: true }); } catch {}
  //   logins.delete(loginId);
  //   return res.status(409).json({ error: `Account ${email} đã tồn tại.` });
}
```

(Resolve existing emails with `Promise.all` rather than `await` in `find`.)

## Affected files

- `server/index.js` (`/api/accounts/login/code` — duplicate check before `addAccount`)
- `server/accounts.js` (optionally add an `emailFor`-based `findAccountByEmail` helper)
- `web/src/AccountLogin.jsx` (surface the 409 error message in the modal)

## Acceptance criteria

- [ ] Logging in as an account already present shows a clear "already exists" message
      and does **not** add a second row.
- [ ] The temporary config dir created for the aborted add is cleaned up.
- [ ] Adding a genuinely new account still works.

## Risks / notes

- Email resolution needs a valid token (the login just succeeded, so it should be
  available). If the email can't be read, fall back to allowing the add (don't block on
  a transient profile-fetch failure) but log a warning.
- Re-login of an expired account (which reuses the same id/configDir) must **not** be
  treated as a duplicate — the guard only applies to *new* adds (different id, same email).
