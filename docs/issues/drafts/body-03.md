**Suggested labels:** `enhancement`, `config`

## Description

Currently every generated file lands in a hardcoded `projects/` directory (plus a few
other fixed locations), with no way to configure it. Request: add a `.env` to configure
parameters — first of all, the directory where files are created/written.

## Current behavior

Hardcoded locations, no dotenv loaded anywhere:

- `server/scaffold.js:20` → `const PROJECTS_DIR = join(APP_ROOT, "projects");`
- `server/index.js:23` → `const REQ_UPLOAD = join(APP_ROOT, "requirements");`
- `server/store.js:7` → `const DIR = join(homedir(), ".agile-studio");`
- `server/accounts.js:14` → `const DIR = join(homedir(), ".agile-studio");`

Only a few ad-hoc `process.env` reads exist (`AGILE_SKILLS_DIR`, `CLAUDE_CONFIG_DIR`,
the Discord vars). There is no `dotenv` dependency and no `.env` / `.env.example`.

## Proposal

1. Add `dotenv`, loaded **once, as early as possible** at the top of `server/index.js`
   (before other modules read env) and in `server/bot.js`.
2. Centralize paths in a config module, keeping today's values as defaults (no behavior
   change when `.env` is absent):

   | Env var | Default | Used by |
   |---------|---------|---------|
   | `PROJECTS_DIR` | `<app>/projects` | `scaffold.js` |
   | `REQUIREMENTS_DIR` | `<app>/requirements` | `index.js` |
   | `AGILE_SKILLS_DIR` | `<app>/.skill` | `scaffold.js` (already read) |
   | `DATA_DIR` | `~/.agile-studio` | `store.js`, `accounts.js` |
   | `CLAUDE_CONFIG_DIR` | `~/.claude` | `accounts.js` (already read) |
   | `SERVER_PORT` | `4311` | `index.js` (API) |
   | `WEB_PORT` | `5311` | `web/vite.config.js` (dev server) |

   ```js
   // server/config.js
   import "dotenv/config";
   import { join, dirname } from "node:path";
   import { homedir } from "node:os";
   import { fileURLToPath } from "node:url";
   const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
   export const config = {
     appRoot: APP_ROOT,
     dataDir: process.env.DATA_DIR || join(homedir(), ".agile-studio"),
     projectsDir: process.env.PROJECTS_DIR || join(APP_ROOT, "projects"),
     requirementsDir: process.env.REQUIREMENTS_DIR || join(APP_ROOT, "requirements"),
     skillsDir: process.env.AGILE_SKILLS_DIR || join(APP_ROOT, ".skill"),
     claudeConfigDir: process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"),
     serverPort: Number(process.env.SERVER_PORT) || 4311,
     webPort: Number(process.env.WEB_PORT) || 5311,
   };
   ```

   `web/vite.config.js` must read the same values so the dev proxy keeps pointing at
   the API port (otherwise changing `SERVER_PORT` silently breaks `/api` + `/ws`):

   ```js
   const API = Number(process.env.SERVER_PORT) || 4311;
   server: { port: Number(process.env.WEB_PORT) || 5311, proxy: {
     "/api": `http://localhost:${API}`,
     "/ws": { target: `ws://localhost:${API}`, ws: true },
   } }
   ```

3. Ship a `.env.example` documenting every variable; ensure `.gitignore` ignores `.env`
   (it already ignores `bot.config.json`, `accounts.json`, `projects/`, `requirements/`).

## Forward-compatibility with the later features (04, 05, 08)

This issue is the config foundation the other features build on. To make sure those
land **without breaking changes**, this config layer should follow three rules:

1. **`server/config.js` is the single source of truth for env.** Migrate the existing
   scattered `process.env` reads into it now — `AGILE_SKILLS_DIR` (`scaffold.js:19`),
   `CLAUDE_CONFIG_DIR` (`accounts.js:22`), and the Discord/`AGILE_API` vars
   (`bot.js:18–22`). Later features then **add keys here**, never re-introduce
   scattered reads. (`CLAUDE_BIN` from #01 also lives here.)
2. **Env = lowest precedence (defaults only), never authoritative.** Runtime settings
   that other features override at runtime — `model`, `economy`, `allowCommands` etc.
   from `store.getSettings()` and the future skill/plugin-settings file (#05) — must
   **not** be frozen in config. Precedence contract: `defaults < .env < global settings
   < per-project settings < per-run`.
3. **Reserve namespaced keys now** (commented in `.env.example`) so naming is stable
   and no rename is needed later:

   | Feature | Reserved env keys |
   |---------|-------------------|
   | #01 login/runner | `CLAUDE_BIN` / `CLAUDE_CLI_PATH` |
   | #04 storage | `STORAGE_DRIVER` (default `json`), `DATABASE_URL`, `SQLITE_PATH` |
   | #05 skill/plugin settings | (file-based; uses `AGILE_SKILLS_DIR`) |
   | #08 Discord bot | `DISCORD_TOKEN`, `DISCORD_CHANNEL`, `DISCORD_MENTION`, `DISCORD_PREFIX`, `AGILE_API` |

Notes that keep specific features non-breaking:

- **#04 storage:** keep `DATA_DIR` generic — don't assume it only holds `studio.json`.
  When a DB driver is selected, `accounts.json` and other files may still live under
  `DATA_DIR` while records move to the DB. Adding `STORAGE_DRIVER`/`DATABASE_URL` is
  purely additive.
- **#08 Discord bot:** `AGILE_API` should default to `http://localhost:${SERVER_PORT}`
  (i.e. `4311`, the API) — **not** the Vite dev port `5311`. The current `bot.js`
  default of `4311` is already correct; keep it, and source the port from config.

## Definition of Done

- [ ] With no `.env`, behavior is identical to today (defaults).
- [ ] Setting `PROJECTS_DIR=D:\out` writes generated project docs there.
- [ ] Setting `DATA_DIR` relocates `studio.json` / account data.
- [ ] Setting `SERVER_PORT` moves the API and the Vite dev proxy follows it (`/api` +
      `/ws` still work).
- [ ] All existing scattered `process.env` reads (`AGILE_SKILLS_DIR`,
      `CLAUDE_CONFIG_DIR`, Discord/`AGILE_API`) go through `server/config.js`.
- [ ] `.env.example` reserves the namespaced keys for #04/#08 (commented).
- [ ] `.env` is git-ignored; `.env.example` is committed.

## Notes

- Load order matters: dotenv must run **before** any module reads `process.env` —
  centralizing in `server/config.js` (imported first) avoids ordering bugs.
- This is a prerequisite for the later features (pluggable storage #04, skill/plugin
  settings #05, Discord bot #08) since they all read config from `.env`.
  See **Forward-compatibility** above for the rules that keep them non-breaking.
- Windows paths in `.env` should use `/` or `\\` to avoid escaping surprises.

> I'm happy to open a PR for this. 🙌
