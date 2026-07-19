# 01 — Login & agent runs fail with `spawn claude ENOENT`

- **Type:** Bug
- **Priority:** P0 (blocker)
- **Effort:** M
- **Labels:** `bug`, `windows`, `runner`, `login`

## Problem

Using **Thêm account (đăng nhập)** ("Add account / login") fails immediately:

```
POST http://localhost:5311/api/accounts/login/start 500 (Internal Server Error)
```

The server log shows:

```
spawn claude ENOENT
```

The same root cause breaks **every agent run**, not just login — any workflow that
spawns Claude Code will fail the same way.

## Root cause / current behavior

The app spawns the Claude CLI by bare name with no path resolution:

- `server/index.js:180` — login: `spawn("claude", ["auth", "login", "--claudeai"], …)`
- `server/runner.js:94` — headless run: `spawn("claude", args, { cwd, env, detached: true })`
- `server/runner.js:140` — streaming run: `spawn("claude", args, { … })`

On this machine `claude` is **not on `PATH`**. Verified:

- `where claude` / `Get-Command claude` → not found.
- `%APPDATA%\npm` has no `claude.cmd`.
- The only `claude.exe` present is bundled inside the VSCode extension:
  `…\.vscode\extensions\anthropic.claude-code-<ver>-win32-x64\resources\native-binary\claude.exe`.

Two compounding issues:

1. **Not resolvable** — bare `spawn("claude")` relies on `PATH`, which doesn't contain it.
2. **Windows `.cmd` gotcha** — even when Claude is installed via npm, the entry is a
   `claude.cmd` shim. Node's `spawn` without `shell: true` cannot execute `.cmd`
   files and throws `ENOENT`.

## Proposed fix

Add a shared resolver `server/claudeBin.js` and use it everywhere Claude is spawned.

```js
// server/claudeBin.js  (sketch)
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";

let cached;
export function resolveClaudeBin() {
  if (cached) return cached;
  // 1) explicit override
  const envBin = process.env.CLAUDE_BIN || process.env.CLAUDE_CLI_PATH;
  if (envBin && existsSync(envBin)) return (cached = envBin);
  // 2) PATH lookup (where on win, which elsewhere)
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    const out = execFileSync(cmd, ["claude"], { encoding: "utf8" }).split(/\r?\n/)[0].trim();
    if (out && existsSync(out)) return (cached = out);
  } catch { /* fall through */ }
  // 3) known install locations
  const home = homedir();
  const candidates = [
    process.env.APPDATA && join(process.env.APPDATA, "npm", "claude.cmd"),
    join(home, ".claude", "local", "claude"),          // native installer
    join(home, ".claude", "local", "claude.exe"),
    // VSCode extension bundled binary (last resort; version-globbed at runtime)
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return (cached = c);
  throw new Error("Không tìm thấy Claude CLI. Đặt CLAUDE_BIN trong .env trỏ tới claude(.exe/.cmd).");
}

// spawn options that work for both .exe and .cmd on Windows
export function claudeSpawn() {
  const bin = resolveClaudeBin();
  const useShell = process.platform === "win32" && /\.(cmd|bat)$/i.test(bin);
  return { bin, useShell };
}
```

Then in `index.js` / `runner.js`:

```js
const { bin, useShell } = claudeSpawn();
const child = spawn(bin, args, { cwd, env, detached: !useShell, shell: useShell });
```

Notes:
- Prefer an absolute `.exe` (native binary) and spawn **without** shell — safest for
  passing large `-p <prompt>` arguments. Only enable `shell: true` when the resolved
  target is a `.cmd`/`.bat`.
- Surface a clear, actionable error in the UI when the CLI can't be found
  (tell the user to set `CLAUDE_BIN`) instead of a raw 500.

## Affected files

- `server/index.js` (login route ~L180)
- `server/runner.js` (`runClaude` ~L94, `runClaudeStream` ~L140)
- **new** `server/claudeBin.js`
- `.env.example` — document `CLAUDE_BIN` (ties into issue 03)

## Implementation steps

1. Add `server/claudeBin.js` with `resolveClaudeBin()` + `claudeSpawn()` and a cache.
2. Replace the three `spawn("claude", …)` call sites with the resolver.
3. Add `CLAUDE_BIN` to `.env.example` and README.
4. Return a friendly error from `login/start` when resolution fails (not a 500).
5. Manually test login on Windows and a real run.

## Acceptance criteria

- [ ] With Claude installed (any of: PATH, npm `.cmd`, native `.exe`, or `CLAUDE_BIN`),
      `POST /api/accounts/login/start` returns a login URL — no `ENOENT`.
- [ ] An agent run spawns Claude and streams events on Windows.
- [ ] With Claude genuinely absent, the UI shows a clear "set CLAUDE_BIN" message, not a 500.

## Risks / notes / sub-tasks

- **Windows process kill (related bug):** `killChild` (`server/runner.js:12`) uses
  POSIX `process.kill(-child.pid, …)` and `detached: true` process groups, which do
  **not** kill the Claude process tree on Windows. Add a Windows branch using
  `taskkill /PID <pid> /T /F`. Consider filing as a small follow-up issue.
- **Verify the login subcommand:** `claude auth login --claudeai` may be outdated for
  the current CLI. Current Claude Code typically uses interactive `/login` or
  `claude setup-token`. Confirm the correct headless/token flow against the installed
  CLI version; the login route's stdin-code exchange may need updating accordingly.
- If bundling/pointing at the VSCode extension binary, its path is version-specific
  (`…-<version>-win32-x64`) — glob the newest rather than hardcoding a version.
