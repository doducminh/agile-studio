# 05 — Project-wide skill / plugin / role settings file (`.claude/settings.json`-style)

- **Type:** Feature
- **Priority:** P2
- **Effort:** S (bản đã ship) · M (bản đầy đủ, để sau)
- **Labels:** `enhancement`, `skills`, `plugins`, `config`
- **Depends on:** 03 (`.env` config)

## ✅ Đã ship (scope chốt — PR #9, issue #6)

Chốt lại: **chỉ ship 1 file `.claude/settings.json` vật lý, commit vào repo** — KHÔNG
làm loader/merger nhiều tầng, KHÔNG UI panel, KHÔNG plugin applier. File mặc định:

```json
{
  "permissions": { "allow": ["Read(*)", "WebFetch(*)", "WebSearch(*)"] },
  "enabledPlugins": {},
  "defaultMode": "acceptEdits"
}
```

- Permissions mặc định chỉ đọc (an toàn cho contributor mới clone).
- Không bật plugin nào mặc định; `defaultMode: acceptEdits`.
- Override cá nhân đặt ở `.claude/settings.local.json` (đã gitignore), không theo repo.

Phần "Proposed fix" bên dưới là **bản thiết kế đầy đủ CHƯA làm** — giữ lại làm tham chiếu
nếu sau này cần settings động (role toggle, model, plugin per-project). Đừng nhầm là scope
hiện tại.

## Problem (bản đầy đủ — để sau)

The user wants project-wide configuration, analogous to Claude Code's
`.claude/settings.json` — a single declarative place to configure, for the whole
project:

- **roles/skills**: which agile roles run, plus model / economy / permissions;
- **plugins**: which Claude Code plugins (and their marketplaces) are enabled for the
  agents this app spawns.

Today all of this is scattered/implicit and changing it needs code edits.

> **Terminology (to avoid confusion):** this app's "skills" are the markdown role packs
> in `.skill/<role>.md` (PM/BA/DA/Dev/QC/PO). Claude Code **plugins** are a different,
> external thing — bundles that ship commands / agents / Claude-Code Skills / hooks /
> MCP servers, installed from a marketplace. This issue configures **both** from one
> file: the app's role packs *and* which Claude Code plugins the spawned CLI should use.

## Root cause / current behavior

Configuration is spread across disconnected places, and plugins aren't managed at all:

- Global runtime settings: `store.getSettings()` / `setSettings()` (`server/store.js:113`)
  — `model`, `economy`, `maxBudgetUsd`, webhooks, `preferredAccount`, `switchThreshold`,
  `allowCommands`.
- Role definitions & order hardcoded: `ROLE_ORDER` / `ROLE_META` (`server/runner.js:42`)
  and the workflow/templates in `server/scaffold.js` (`WORKFLOW`, `SEED`, `UPSTREAM`).
- App skill packs: markdown under `.skill/<role>.md` via `ensureSkillLibrary`,
  `readSkill`, `listSkills`, `saveSkill` (`server/scaffold.js`).
- **Plugins: not controlled.** The CLI is spawned (`runClaude` / `runClaudeStream`,
  `server/runner.js`) with only `CLAUDE_CONFIG_DIR` + flags; whatever plugins happen to
  be enabled in that config dir apply. There is no per-project plugin declaration.

There is **no single declarative settings file** for roles or plugins.

## Proposed fix (CHƯA làm — bản đầy đủ để sau)

A layered settings model with an on-disk file resembling `.claude/settings.json`,
covering roles **and** plugins.

1. **File**: `<skillsDir>/settings.json` (global) and optional
   `<projectDocsDir>/settings.json` (per-project override). Example:

   ```json
   {
     "model": "claude-sonnet-4-6",
     "economy": true,
     "allowCommands": true,
     "roles": {
       "pm":  { "enabled": true },
       "ba":  { "enabled": true },
       "da":  { "enabled": true },
       "dev": { "enabled": true },
       "qc":  { "enabled": true },
       "po":  { "enabled": false }
     },
     "skillsDir": ".skill",
     "plugins": {
       "marketplaces": [
         { "name": "acme", "source": "github:acme/claude-plugins" }
       ],
       "enabled": {
         "code-reviewer@acme": true,
         "test-runner@acme": false
       }
     }
   }
   ```

2. **Precedence** (lowest → highest):
   `defaults` < `.env` < global `settings.json` < per-project `settings.json` <
   per-run overrides (RunModal). Merge into the effective config the orchestrator uses.

3. **Wire-up — roles/model**: the orchestrator loop in `server/index.js` (iterates
   `ROLE_ORDER`, spawns each role) skips roles where `enabled === false` and reads
   `model` / `economy` / `allowCommands` from the merged config instead of only
   `store.getSettings()`.

4. **Wire-up — plugins**: translate the `plugins` block into what Claude Code actually
   reads, at spawn time in `runner.js`. Cleanest integration: **materialize a project-scoped
   `.claude/settings.json`** in the run cwd (or the account's `CLAUDE_CONFIG_DIR`) that
   sets `enabledPlugins` and registers the marketplaces, then spawn the CLI so it picks
   them up. (Confirm the exact keys — `enabledPlugins`, marketplace registration — against
   the installed Claude Code version; add unknown marketplaces via a pre-run
   `claude plugin marketplace add <source>` if needed.) Apply enable/disable per project
   so different projects can use different plugin sets.

5. **UI**: extend `web/src/SettingsModal.jsx` with (a) role toggles + model, and (b) a
   plugins panel (list marketplaces, toggle plugins on/off). Persist via a new
   `/api/settings` extension (e.g. `/api/settings/project`). Keep `store.getSettings()`
   working as one precedence layer.

## Affected files

- **new** settings loader/merger, e.g. `server/settings.js` (reads env + files, merges)
- **new/changed** plugin applier in `server/runner.js` (write project `.claude/settings.json`
  / register marketplaces before spawn)
- `server/index.js` (orchestrator: honor `roles[x].enabled`, merged model/economy;
  settings API endpoints)
- `server/scaffold.js` (respect configured `skillsDir`; already partly env-driven)
- `web/src/SettingsModal.jsx` (role toggles + model + plugins panel)
- `.env.example` (path to settings file, if configurable)

## Implementation steps

1. Define the schema (roles + model/economy + `plugins`) and a
   `loadEffectiveSettings(projectDocsDir)` merger.
2. Replace direct `store.getSettings()` reads in the run path with the merged result.
3. Make role iteration skip disabled roles.
4. Add the plugin applier: map `plugins.enabled` / `plugins.marketplaces` to a
   project-scoped `.claude/settings.json` (+ marketplace registration) before spawn.
5. Add UI controls (roles, model, plugins) in `SettingsModal.jsx` + persistence endpoints.
6. Document the file, precedence, plugin format, and examples in README.

## Acceptance criteria

- [ ] A `settings.json` can disable a role (e.g. `po`) and that role is skipped in runs.
- [ ] `model` / `economy` / `allowCommands` can be set via the file without code edits.
- [ ] A plugin listed under `plugins.enabled` is actually active for the spawned agents
      (and a disabled one is not); its marketplace is registered automatically.
- [ ] Per-project settings override global settings; both override `.env`/defaults.
- [ ] Existing runs with no settings file behave exactly as today (no plugins forced).

## Risks / notes

- Keep compatible with existing `store.settings`; treat `store.getSettings()` as one
  precedence layer, not the source of truth.
- **Verify Claude Code's plugin config contract** for the installed CLI version — key
  names (`enabledPlugins`), marketplace registration, and whether project-level
  `.claude/settings.json` is honored in headless (`-p`) mode. This is the main unknown;
  spike it before building the UI.
- Don't over-engineer to mirror Claude Code settings 1:1 — scope to what the orchestrator
  consumes (roles, model, economy, allowCommands, budget) plus plugin enable/marketplace.
- Keep app "skills" (`.skill/*.md`) and Claude Code "plugins/skills" clearly separated in
  both the UI and docs so users aren't confused by the overlapping word.
- Per-project file should live with the project's docs workspace so it travels with the
  project (ties into issue 03).
