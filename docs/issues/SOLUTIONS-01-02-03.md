# Implemented fixes — issues 01, 02, 03

Status: **implemented in the working tree, not committed** (commit when contribution is
approved). Verified locally on Windows 11 / Node 26.

Paths are relative to the app folder `agile-studio/`.

## New dependency

- `dotenv` (`^17`) added to `dependencies` (used by issue 03). `package.json` +
  `package-lock.json` changed.

## Files touched (all three issues)

**Created**
- `server/config.js` — single source of truth for env / paths / ports (issue 03).
- `server/claudeBin.js` — Claude CLI path resolver (issue 01).
- `.env.example` — documents every env var + reserved keys for #04/#08.

**Modified**
- `server/store.js` — data dir from `config.dataDir` (03).
- `server/accounts.js` — data dir + `defaultConfigDir()` from config; new cached
  `emailFor()` (02, 03).
- `server/scaffold.js` — `SKILLS_DIR`/`PROJECTS_DIR` from config (03).
- `server/index.js` — load config first; `REQ_UPLOAD`/`PORT` from config (03); resolve
  Claude bin in login route (01); add `email` to `GET /api/accounts` (02).
- `server/runner.js` — both `spawn("claude", …)` sites use the resolver (01).
- `web/vite.config.js` — dev port + proxy target from config (03).
- `web/src/AccountBadge.jsx` — render `email || label` (02).
- `.gitignore` — ignore `.env` / `.env.local` (03).

---

## Issue 03 — configurable paths via `.env` (dotenv)

**What:** all hardcoded paths/ports now resolve through `server/config.js`, which loads
`dotenv` once and exposes defaults identical to the old behavior. `vite.config.js`
reuses the same module so the dev proxy always follows `SERVER_PORT`.

**Key design points**
- `server/config.js` is imported **first** in `index.js` so `.env` is loaded before any
  module reads env.
- Env vars: `DATA_DIR`, `PROJECTS_DIR`, `REQUIREMENTS_DIR`, `AGILE_SKILLS_DIR`,
  `CLAUDE_CONFIG_DIR`, `CLAUDE_BIN`, `SERVER_PORT` (4311), `WEB_PORT` (5311).
- No `.env` ⇒ unchanged behavior (defaults).

**Verified:** `SERVER_PORT=4399 node server/index.js` booted on 4399; `config` object
resolves all defaults correctly.

**Suggested commit**
```
feat(config): load .env via dotenv and make paths/ports configurable

Add server/config.js as the single source of truth for env-driven paths
(DATA_DIR, PROJECTS_DIR, REQUIREMENTS_DIR, AGILE_SKILLS_DIR) and ports
(SERVER_PORT, WEB_PORT). Route store.js, accounts.js, scaffold.js and
index.js through it; vite.config.js reuses it so the dev proxy follows
SERVER_PORT. Defaults match previous behavior; ship .env.example and
gitignore .env.
```

## Issue 01 — fix `spawn claude ENOENT`

**What:** new `server/claudeBin.js` resolves the Claude CLI (env `CLAUDE_BIN` → `PATH`
via `where`/`which` → known install locations incl. the VSCode-bundled
`native-binary/claude.exe`) and reports whether a Windows `.cmd`/`.bat` needs
`shell: true`. The login route and both `runner.js` spawn sites now use it. Missing CLI
returns a clear "set CLAUDE_BIN" error instead of a raw 500.

**Verified:** `resolveClaudeBin()` returns
`…/anthropic.claude-code-2.1.214-win32-x64/resources/native-binary/claude.exe`
(`useShell:false`) on this machine where `claude` is not on PATH. Full interactive login
still needs manual testing (see below).

**Note for a standalone PR:** `claudeBin.js` imports `config.js` only for the optional
`CLAUDE_BIN`. If issue 01 must not depend on issue 03, read `process.env.CLAUDE_BIN`
directly there instead.

**Suggested commit**
```
fix(runner): resolve Claude CLI path to fix `spawn claude ENOENT` on Windows

Bare spawn("claude", ...) failed when claude wasn't on PATH and couldn't
run .cmd shims. Add server/claudeBin.js (env CLAUDE_BIN -> PATH -> known
locations incl. VSCode-bundled binary; shell:true only for .cmd/.bat) and
use it in the login route and both runner spawns. Surface a clear error
when the CLI is missing.
```

## Issue 02 — show real account email

**What:** `emailFor(configDir)` (cached, 1h TTL) reuses `fetchProfile`;
`GET /api/accounts` includes `email` (only fetched when `loggedIn`). `AccountBadge`
renders `email || label`, keeping the nickname in the tooltip.

**Verified:** `/api/accounts` returned `"email":"doducminh1115@gmail.com"` for the
logged-in default account.

**Suggested commit**
```
feat(accounts): show real account email instead of the nickname label

Add a cached emailFor() (reuses fetchProfile) and include `email` in
GET /api/accounts for logged-in accounts. AccountBadge renders the email
with the label as tooltip fallback.
```

---

## Recommended commit split

Three commits (foundation first), since `index.js` is touched by all:

1. **03** — `config.js`, `.env.example`, `.gitignore`, `package.json`/lock, path
   changes in `store.js`/`accounts.js`/`scaffold.js`/`index.js`, `vite.config.js`.
2. **01** — `claudeBin.js`, login spawn in `index.js`, both spawns in `runner.js`.
3. **02** — `emailFor` in `accounts.js`, `email` in `index.js` `/api/accounts`,
   `AccountBadge.jsx`.

(If each becomes a separate upstream PR, land 03 first — 01 and the config parts build
on it. See the standalone note under issue 01.)

## Remaining manual verification

- **Login (01):** start the app, click **Thêm account**, confirm a login URL is
  returned (no `ENOENT`) and the code exchange adds the account. If `claude` is not on
  PATH, the VSCode-bundled binary is used automatically; otherwise set `CLAUDE_BIN`.
- **Run (01):** trigger an agent run and confirm Claude spawns and streams events.
- **Email (02):** open the accounts panel and confirm the email shows instead of
  "Default".
- **Paths (03):** set `PROJECTS_DIR=D:/agile-out` in `.env`, create a project, confirm
  docs are generated there; set `SERVER_PORT` and confirm the web dev proxy still works.

## Known follow-ups (documented, not done here)

- Windows process-tree kill in `killChild` (`runner.js`) still uses POSIX groups — see
  issue 01 "Related notes" (`taskkill /PID <pid> /T /F`).
- Verify the `claude auth login --claudeai` subcommand against the installed CLI version.
- For `.cmd` installs, passing a very long `-p <prompt>` through a shell can be fragile;
  prefer resolving to `claude.exe` or set `CLAUDE_BIN`.
