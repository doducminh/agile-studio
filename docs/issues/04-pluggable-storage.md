# 04 — Pluggable storage adapter (JSON / SQLite / Postgres)

- **Type:** Feature
- **Priority:** P2
- **Effort:** L
- **Labels:** `enhancement`, `storage`, `architecture`
- **Depends on:** 03 (`.env` config)

## Problem

Everything is persisted to a single JSON file (`~/.agile-studio/studio.json`), plus
loose files on disk (project docs, requirement uploads). The user wants an option to
store this data in a **database** (or similar) for equal-or-better performance and
more flexibility, and considers **supporting multiple storage backends** necessary.

## Background — what to use (research)

For AI-agent orchestration tools (sessions, runs, logs, orchestration state), the
2025–2026 norm is a **pluggable persistence layer** with multiple backends behind one
interface (e.g. LangGraph checkpointers support SQLite/Postgres/Redis/Mongo):

- **SQLite** — the standard first database for local/single-instance agents: no
  server, one file, WAL mode handles concurrency. Great default upgrade from JSON.
- **PostgreSQL** — the standard once writes are concurrent across processes, or when a
  single shared/hosted instance wants access control, replication, and better
  concurrent-write behavior. (With **pgvector** it can also do semantic/vector search —
  only relevant if agent "memory"/RAG is added later; out of scope now.)

**Decision:** adapter interface with **JSON (default, zero-config) / SQLite (local) /
Postgres (shared/hosted)**, selected by `STORAGE_DRIVER` in `.env`. The app stays
single-tenant — no per-user isolation is in scope.

## Root cause / current behavior

`server/store.js` mixes the storage engine (JSON read/write of one file) with the
domain API. The exported `store` object already defines a clean method surface that
becomes the adapter interface:

- Projects: `listProjects`, `addProject`, `getProject`
- Requirements: `listRequirements`, `addRequirement`, `getRequirement`,
  `setRequirementStatus`, `addRequirementFile`, `removeRequirementFile`,
  `deleteRequirement`
- Runs: `startRun`, `finishRun`
- Logs: `listLogs`, `appendLog`, `clearLogs`
- Sessions: `listSessions`, `saveSession`, `deleteSession`
- Session logs: `listSessionLogs`, `appendSessionLog`
- Schedules: `listSchedules`, `getSchedule`, `saveSchedule`, `deleteSchedule`
- Settings: `getSettings`, `setSettings`

Callers only import `{ store }` from `server/store.js`, so swapping the engine behind
that object requires no call-site changes.

## Proposed fix

1. Define the adapter contract = the existing `store` method set. Keep it async-capable
   (return promises) so DB drivers fit; JSON driver can remain sync internally but the
   public API should tolerate `await` for forward-compat. (Evaluate: either make all
   callers `await`, or keep sync for JSON/SQLite and async only for Postgres — pick
   one and document it. Sync + SQLite via `better-sqlite3` keeps call sites unchanged.)
2. Split into drivers selected by `STORAGE_DRIVER`:

   ```
   server/store/index.js        // picks driver from process.env.STORAGE_DRIVER
   server/store/json.js         // current implementation (default)
   server/store/sqlite.js       // better-sqlite3, WAL
   server/store/postgres.js     // pg, schema
   ```

   ```js
   // server/store/index.js
   const driver = (process.env.STORAGE_DRIVER || "json").toLowerCase();
   export const store = driver === "postgres" ? await makePostgres()
                      : driver === "sqlite"   ? makeSqlite()
                      :                          makeJson();
   ```

3. **Schema** (relational drivers): tables mirroring today's JSON shape —
   `projects`, `requirements`, `requirement_files`, `runs`, `logs`, `sessions`,
   `session_logs`, `schedules`, `settings`. Preserve current fields (e.g. project
   `repo_path` UNIQUE; requirement `status`, `files`, `day`; log cap of 500;
   session cap of 60; session_log cap of 1000 — enforce via query LIMIT/trim).
4. **Migration**: a one-shot `migrate` script that reads `studio.json` and inserts into
   the chosen DB. Keep JSON as the fallback default so nothing breaks out of the box.
5. Recommend `STORAGE_DRIVER` default = `json`; document how to switch.

## Affected files

- `server/store.js` → split into `server/store/{index,json,sqlite,postgres}.js`
  (or keep `store.js` as re-export shim to avoid churn in importers)
- `server/index.js`, `server/bot.js` (import unchanged if shim kept)
- `.env.example` (`STORAGE_DRIVER`, `DATABASE_URL`, `SQLITE_PATH`)
- `package.json` (`better-sqlite3`, `pg` as optional/deferred deps)

## Implementation steps

1. Extract current logic into `store/json.js` unchanged; make `store/index.js` return it.
2. Decide sync-vs-async contract; if going async, wrap callers with `await`.
3. Implement `store/sqlite.js` (schema + prepared statements, WAL pragma).
4. Implement `store/postgres.js` (schema, connection pool via `DATABASE_URL`).
5. Add `migrate` script (JSON → DB) and document it.
6. Test the full app against `json`, then `sqlite`, then `postgres`.

## Acceptance criteria

- [ ] `STORAGE_DRIVER=json` (or unset) → identical behavior to today.
- [ ] `STORAGE_DRIVER=sqlite` → app runs, data persists in a `.sqlite` file (WAL).
- [ ] `STORAGE_DRIVER=postgres` with `DATABASE_URL` → app runs against Postgres.
- [ ] Migration script moves existing `studio.json` data into the chosen DB.
- [ ] No REST/WS behavior changes; only the storage engine differs.

## Risks / notes

- `better-sqlite3` and `pg` are native/heavier deps — make them **optional** (only
  required when their driver is selected) so JSON users don't pay the cost.
- Sync-vs-async is the main design decision; `better-sqlite3` is sync, `pg` is async.
  Simplest: make the public store API async everywhere and `await` at call sites.
- Enforce the existing caps (logs 500, sessions 60, session logs 1000) in SQL.
- `pgvector` / semantic memory is explicitly **out of scope** here — note it as a
  future extension if agent long-term memory is added.
