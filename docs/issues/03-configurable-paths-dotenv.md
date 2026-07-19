# 03 — Configurable paths via `.env` (dotenv) instead of hardcoded `projects/`

- **Type:** Bug / Chore
- **Priority:** P1
- **Effort:** S–M
- **Labels:** `enhancement`, `config`, `chore`

## Problem

All generated files land in a hardcoded `projects/` directory (and a few other fixed
locations). There's no way to configure where output is written. The user wants a
`.env` to configure parameters — first of all, the directory where files are created.

## Root cause / current behavior

Hardcoded locations, no dotenv loaded anywhere:

- `server/scaffold.js:20` → `const PROJECTS_DIR = join(APP_ROOT, "projects");`
- `server/index.js:23` → `const REQ_UPLOAD = join(APP_ROOT, "requirements");`
- `server/store.js:7` → `const DIR = join(homedir(), ".agile-studio");`
- `server/accounts.js:14` → `const DIR = join(homedir(), ".agile-studio");`

Only ad-hoc `process.env` reads exist today (e.g. `AGILE_SKILLS_DIR` in
`scaffold.js:19`, `CLAUDE_CONFIG_DIR` in `accounts.js:22`, Discord vars in `bot.js`).
There is no `dotenv` dependency and no `.env` / `.env.example`.

## Proposed fix

1. Add `dotenv` and load it **once, first**, at server entry (top of
   `server/index.js`, before other imports read env), and in `server/bot.js`.
2. Introduce env-overridable path resolvers with today's values as defaults, so
   existing behavior is unchanged when `.env` is absent:

   | Env var | Default | Used by |
   |---------|---------|---------|
   | `PROJECTS_DIR` | `<app>/projects` | `scaffold.js` |
   | `REQUIREMENTS_DIR` | `<app>/requirements` | `index.js` upload |
   | `AGILE_SKILLS_DIR` | `<app>/.skill` | `scaffold.js` (already read) |
   | `DATA_DIR` | `~/.agile-studio` | `store.js`, `accounts.js` |
   | `CLAUDE_BIN` | auto-detect | runner/login (issue 01) |
   | `SERVER_PORT` / `WEB_PORT` | current ports | server / vite |

3. Ship `.env.example` documenting every variable. Ensure `.gitignore` ignores `.env`
   (it already ignores `bot.config.json`, `accounts.json`, `projects/`, `requirements/`).

Sketch:

```js
// server/config.js
import "dotenv/config";
import { join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const config = {
  appRoot: APP_ROOT,
  dataDir: process.env.DATA_DIR || join(homedir(), ".agile-studio"),
  projectsDir: process.env.PROJECTS_DIR || join(APP_ROOT, "projects"),
  requirementsDir: process.env.REQUIREMENTS_DIR || join(APP_ROOT, "requirements"),
  skillsDir: process.env.AGILE_SKILLS_DIR || join(APP_ROOT, ".skill"),
  serverPort: Number(process.env.SERVER_PORT) || 4311,   // API (index.js)
  webPort: Number(process.env.WEB_PORT) || 5311,         // Vite dev server
};
```

`web/vite.config.js` must read the same ports so the dev proxy keeps targeting the API
(otherwise changing `SERVER_PORT` breaks `/api` + `/ws`).

Then import `config.*` in `scaffold.js`, `index.js`, `store.js`, `accounts.js`
instead of the local constants.

## Affected files

- **new** `server/config.js`, `.env.example`
- `server/index.js` (load dotenv first; use `config.requirementsDir`, port)
- `server/scaffold.js` (`PROJECTS_DIR`, `SKILLS_DIR`)
- `server/store.js`, `server/accounts.js` (`DATA_DIR`)
- `server/bot.js` (load dotenv; see issue 08)
- `.gitignore` (add `.env`, `.env.local`)

## Implementation steps

1. `npm i dotenv`; add `server/config.js` that imports `dotenv/config`.
2. Replace hardcoded path constants with `config.*` across the four server files.
3. Create `.env.example` with all variables + comments.
4. Add `.env` to `.gitignore`.
5. Verify defaults reproduce current behavior; verify overrides take effect.

## Acceptance criteria

- [ ] With no `.env`, behavior is identical to today (defaults).
- [ ] Setting `PROJECTS_DIR=D:\out` causes generated project docs to be written there.
- [ ] Setting `DATA_DIR` relocates `studio.json` / accounts data.
- [ ] `.env` is git-ignored; `.env.example` is committed.

## Risks / notes

- Load order matters: dotenv must run **before** any module reads `process.env`.
  Centralizing in `server/config.js` (imported first) avoids ordering bugs.
- This issue is a prerequisite for 04, 05, 08 (they all read config from `.env`).
- Windows paths in `.env` should be documented (use forward slashes or escaped
  backslashes to avoid surprises).

### Forward-compatibility rules (so 04, 05, 08 don't force breaking changes)

1. **`server/config.js` = single source of truth for env.** Migrate the existing
   scattered reads into it now (`AGILE_SKILLS_DIR`, `CLAUDE_CONFIG_DIR`, Discord/
   `AGILE_API`); later features add keys here, not new scattered reads.
2. **Env is lowest precedence (defaults only).** Don't freeze runtime-overridable
   values (`model`, `economy`, `allowCommands`) in config — the skill/plugin-settings
   file (#05) and `store.getSettings()` layer on top.
3. **Reserve namespaced keys now** in `.env.example` (commented): `CLAUDE_BIN` (#01);
   `STORAGE_DRIVER`/`DATABASE_URL`/`SQLITE_PATH` (#04); `DISCORD_*`/`AGILE_API` (#08).
   `AGILE_API` default = `http://localhost:${SERVER_PORT}` (`4311`), not the Vite
   port `5311`.
