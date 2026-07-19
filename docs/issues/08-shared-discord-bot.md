# 08 — Single Discord bot configured via `.env`

- **Type:** Feature
- **Priority:** P3
- **Effort:** S
- **Labels:** `enhancement`, `bot`, `config`, `security`
- **Depends on:** 03 (`.env` config)

## Problem

The bot config is a confusing mix of a committed mock JSON file and ad-hoc env reads.
Consolidate to a **single bot configured entirely via `.env`**, and remove the
committed secret. (Config cleanup / secret hygiene — not tied to any production/
multi-tenant plan.)

## Root cause / current behavior

`server/bot.js` reads config with a fallback to a JSON file:

- `server/bot.js:18` → `const TOKEN = process.env.DISCORD_TOKEN || cfg.discordToken;`
- `:19` → `DISCORD_CHANNEL || cfg.channelId`
- `:20` → `AGILE_API || cfg.api || "http://localhost:4311"`
- `:22` → `DISCORD_MENTION || cfg.mentionUserId`

`cfg` comes from a config file, and the repo contains `bot.config.mock.json` with a
**real-looking token/channel/mention committed** — a secret-hygiene problem. The
`.gitignore` already ignores the real `bot.config.json`, but the mock leaks example
secrets and the dual config path is confusing.

## Proposed fix

1. Make `.env` the single source of truth for the bot (load `dotenv` in `bot.js`, per
   issue 03):

   | Var | Meaning |
   |-----|---------|
   | `DISCORD_TOKEN` | bot token (required to run bot) |
   | `DISCORD_CHANNEL` | channel id for notifications |
   | `AGILE_API` | server API base (default `http://localhost:4311`) |
   | `DISCORD_MENTION` | user id to @mention on events (optional) |
   | `DISCORD_PREFIX` | command prefix (default `!`) |

2. Keep `bot.config.json` support as an optional local fallback, but **remove the
   committed `bot.config.mock.json`** (replace with a documented `.env.example` block).
   Rotate the leaked token if it was ever real.
3. Document running the bot: `npm run bot` reads only `.env`.

## Affected files

- `server/bot.js` (load dotenv; `.env`-first config; drop hard dependency on mock)
- **remove** `bot.config.mock.json` (move its keys into `.env.example` as comments)
- `.env.example` (all `DISCORD_*`, `AGILE_API`)
- `.gitignore` (already ignores `bot.config.json`; ensure `.env` ignored — issue 03)
- `BOT.md` (update setup docs)

## Implementation steps

1. Add `import "dotenv/config"` (or import `server/config.js`) at the top of `bot.js`.
2. Make config `.env`-first; keep optional `bot.config.json` fallback for local dev.
3. Delete `bot.config.mock.json`; add its fields to `.env.example` with placeholder
   values; rotate the token if real.
4. Update `BOT.md` to describe `.env`-only setup.
5. Verify `npm run bot` starts using only `.env`.

## Acceptance criteria

- [ ] `npm run bot` starts using only `.env` (no committed secrets needed).
- [ ] No real/secret-looking tokens remain committed in the repo.
- [ ] `AGILE_API` default matches the actual API port (`4311`) and is sourced from
      `SERVER_PORT` (issue 03).
- [ ] Bot still posts notifications and responds to the configured prefix.

## Risks / notes

- **Secret rotation**: `bot.config.mock.json` currently contains a real-looking token —
  if it was ever a live token, rotate it in the Discord developer portal regardless.
- Port note: `bot.js` defaulting `AGILE_API` to `:4311` is **correct** — `4311` is the
  API server port (`server/index.js`); `:5311` is only the Vite dev-server port that
  proxies to `4311`. Source the default from `SERVER_PORT` (issue 03), keep `4311`.
