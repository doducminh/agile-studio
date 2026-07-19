<!-- DRAFT for github.com/TranDuy13/agile-studio · edit freely before opening the issue -->
<!-- Suggested title: -->
# [Bug] Account login and every agent run fail with `spawn claude ENOENT` (Windows)

**Suggested labels:** `bug`, `windows`, `runner`

## Description

On Windows, clicking **Thêm account (đăng nhập)** ("Add account / login") fails immediately:

```
POST http://localhost:5311/api/accounts/login/start 500 (Internal Server Error)
```

Server log:

```
spawn claude ENOENT
```

The same root cause breaks **every agent run**, not just login — any workflow that
spawns Claude Code fails the same way.

## Steps to reproduce

1. Run `npm run dev` on Windows.
2. Open the **Tài khoản Claude** panel → click **+** (Add account).
3. Enter a nickname → **Lấy link đăng nhập** (Get login link).
4. → The modal shows `spawn claude ENOENT`; `/api/accounts/login/start` returns 500.

## Environment

- OS: Windows 11
- Node: `<fill in>` · npm: `<fill in>`
- Claude Code installed via: `<npm global / native installer / VSCode extension>`
- App: `main` branch

## Root cause

The app spawns the Claude CLI by bare name, with no path resolution and no `shell: true`:

- `server/index.js` (~line 180) — login: `spawn("claude", ["auth", "login", "--claudeai"], …)`
- `server/runner.js` (~line 94) — `runClaude`: `spawn("claude", args, { cwd, env, detached: true })`
- `server/runner.js` (~line 140) — `runClaudeStream`: `spawn("claude", args, …)`

Two compounding problems on Windows:

1. **Not resolvable** — `spawn("claude")` relies on `PATH`. If Claude isn't on `PATH`
   (e.g. it's only bundled with the VSCode extension at
   `…\resources\native-binary\claude.exe`), Node throws `ENOENT`.
2. **Windows `.cmd` gotcha** — even when installed via npm, the entry is a `claude.cmd`
   shim; Node's `spawn` without `shell: true` cannot execute `.cmd` files → `ENOENT`.

## Proposed fix

Add a shared resolver (e.g. `server/claudeBin.js`) used by both `index.js` and `runner.js`:

1. Honor the `CLAUDE_BIN` / `CLAUDE_CLI_PATH` env var if set.
2. Probe `PATH` (`where` on Windows, `which` elsewhere), accepting `.cmd`/`.exe`.
3. Fall back to common install locations (`%APPDATA%\npm\claude.cmd`,
   `~/.claude/local/claude(.exe)`, the VSCode-extension-bundled binary).
4. Prefer spawning an absolute `.exe` directly (safe for passing a long prompt via
   `-p`); only enable `shell: true` when the target is a `.cmd`/`.bat`.
5. When the CLI can't be found, return a clear UI error ("set `CLAUDE_BIN`") instead of
   a raw 500.

## Definition of Done

- [ ] When Claude is available (PATH / npm `.cmd` / `.exe` / `CLAUDE_BIN`),
      `login/start` returns a login URL with no `ENOENT`.
- [ ] An agent run spawns Claude and streams events successfully on Windows.
- [ ] When Claude is genuinely missing, the UI shows a "set `CLAUDE_BIN`" message
      instead of a 500.

## Related notes (could be split into smaller issues)

- **Windows process kill:** `killChild` (`server/runner.js:12`) uses POSIX-style
  `process.kill(-pid)` + `detached: true`, which does not kill the process tree on
  Windows. A `taskkill /PID <pid> /T /F` branch is needed.
- **Verify the login subcommand:** `claude auth login --claudeai` may be outdated
  versus the current CLI (`claude setup-token` / interactive `/login`). The headless
  login flow should be confirmed against the installed CLI version.

> I'm happy to open a PR for this if the maintainer agrees on the approach. 🙌
