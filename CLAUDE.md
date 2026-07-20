# CLAUDE.md — handoff / project state

Bối cảnh cho phiên Claude Code tiếp theo (kể cả trên máy khác). Cập nhật 2026-07-20.

## Dự án
**Agile Studio** — công cụ điều phối nhiều agent Claude Code theo quy trình
PM → BA → DA → Dev → QC → PO. Server Express + WS, web React (Vite), 1 Discord bot.

- **Repo git gốc:** `H:/duy-agile-studio` (không phải thư mục app). Upstream:
  `TranDuy13/agile-studio` (mình chỉ có quyền READ). Fork của mình:
  `doducminh/agile-studio` (remote tên `fork`).
- **App** nằm ở `agile-studio/` · **docs đóng góp** ở `docs/issues/`.
- **Chạy app:** `cd agile-studio && npm run dev` → API `:4311`, web Vite `:5311`
  (proxy `/api`,`/ws` → 4311), bot. Node 26. Đã thêm dep `dotenv`.
- **Kiểm thử nhanh:** `cd agile-studio && npx vite build --config web/vite.config.js`
  và `SERVER_PORT=<cổng rảnh> node server/index.js` (rồi curl `/api/accounts`).
- **gh CLI** KHÔNG có trên PATH → gọi bằng đường dẫn đầy đủ:
  `"C:\Program Files\GitHub CLI\gh.exe"`. Đã đăng nhập tài khoản `doducminh`.

## Nhánh (branches)
| Nhánh | Nội dung |
|-------|----------|
| `main` | Sạch, khớp `origin/main` (upstream). Dùng làm base cho PR mới. |
| `personal/local-work` | **Nhánh làm việc chính** — TẤT CẢ code (01–15) + `docs/issues/` + `.claude/settings.json`. Làm việc tiếp ở đây. |
| `fix/login-email-env-paths` | 01–03 → **PR #4**. Đã push lên `fork`. |
| `fix/account-login-ux` | 09,11–15 (stacked trên #4) → **PR #7**. Đã push lên `fork`. |
| `feat/discord-bot-env-08` | 08 bot qua `.env` + xoá mock (stacked trên #4) → **PR #8**. |
| `feat/project-claude-settings-05` | 05 `.claude/settings.json` vật lý (off `main`) → **PR #9**. |
| `wip/local-01-15` | Snapshot an toàn (backup). |

## GitHub issues & PRs (trên `TranDuy13/agile-studio`)
- **#1/#2/#3** (bug: ENOENT, email, .env) → **PR #4** (`Fixes #1 #2 #3`).
- **#5** (UX gộp: 09,11–15) → **PR #7** (`Fixes #5`, stacked trên #4 — merge #4 trước).
- **#6** (05 skill/plugin/role settings) → **PR #9** (`Fixes #6`, off `main`). Đã làm gọn
  thành file `.claude/settings.json` vật lý (không còn code sinh tự động).
- **08** (Discord bot qua `.env`) → **PR #8** (không có GitHub issue tương ứng; off #4).
  Đã xoá `bot.config.mock.json` (token giả, không rotate).
- **killChild Windows** (`taskkill /T /F`) → **PR #10** (off #4).
- **04** (pluggable storage json|sqlite) → **PR #11** (off #4). node:sqlite built-in;
  Postgres CHƯA làm (YAGNI, throw lỗi rõ).

## Đã xong
- **01** `spawn claude ENOENT`: `server/claudeBin.js` resolve Claude CLI (env `CLAUDE_BIN`
  → PATH → vị trí cài thường gặp incl. binary kèm VSCode ext; shell chỉ cho `.cmd`).
- **02** hiện email account thật (cache `emailFor`, thêm `email` vào `/api/accounts`).
- **03** dotenv + `server/config.js` (paths/ports theo `.env`, mặc định giữ nguyên).
- **09** làm mới usage khi F5 (mount) + khi focus tab (debounce 30s).
- **11** chặn thêm account trùng email. **12** login chỉ mở 1 tab.
- **13** nickname tuỳ chọn (hiện nickname, nếu trống → email).
- **14** dialog usage hiện dòng Fable (`fablePct`). **15** icon trạng thái + popover chú thích.
- **05** file `.claude/settings.json` mặc định (permissions Read/Web, defaultMode acceptEdits).

## Việc cần làm tiếp (TODO)
1. **Theo dõi PR** — chờ maintainer review/merge. Thứ tự: **#4 trước**, rồi #7/#8/#10/#11
   (đều stacked trên #4); #9 độc lập off `main`.
2. **Issue #6 text** vẫn mô tả bản UI phức tạp cũ → chỉ sửa được nếu có quyền write upstream
   (hiện READ-only). `docs/issues/04,05` đã sửa về scope đã ship. Issue #10 (responsive) đã
   revert → nếu làm lại dùng layout **stacked** (không off-canvas drawer).
3. **Postgres cho 04** (nếu deploy shared/hosted): thêm `store/postgres.js` — buộc chuyển
   store API sang async + `await` mọi call-site. Hiện throw lỗi rõ khi `STORAGE_DRIVER=postgres`.
4. **Ghi chú kỹ thuật:** ~~`claude auth login --claudeai`~~ đã kiểm — VẪN hợp lệ trên CLI
   2.1.215 (`--claudeai` là mặc định; có thêm `--email` prefill). Schema plugin
   (`enabledPlugins`) vẫn tuỳ phiên bản.

## Cấu hình cá nhân (chỉ của mình — KHÔNG commit)
`.claude/settings.local.json` bị gitignore nên KHÔNG theo nhánh sang máy khác.
**Trên máy mới, tạo lại file `.claude/settings.local.json` với nội dung:**
```json
{
  "permissions": {
    "allow": ["Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)", "Bash(*)", "WebFetch(*)", "WebSearch(*)"]
  },
  "enabledPlugins": {
    "ponytail@ponytail": true,
    "caveman@caveman": true,
    "ui-ux-pro-max@ui-ux-pro-max-skill": true
  },
  "defaultMode": "acceptEdits"
}
```

## Tài liệu
`docs/issues/`: spec từng issue (01–15), `README.md` (index), `SOLUTIONS-01-02-03.md`,
`SOLUTIONS-09-15.md` (nhật ký cách sửa + commit message), `drafts/` (bản nháp đã đăng).
