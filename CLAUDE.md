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
1. **Theo dõi PR #4, #7, #8, #9** — chờ maintainer review/merge. Thứ tự: **#4 trước**,
   rồi #7/#8 (đều stacked trên #4); #9 độc lập off `main`.
2. **Issue #6 text** vẫn mô tả bản UI phức tạp cũ → chỉ sửa được nếu có quyền write upstream
   (hiện READ-only). `docs/issues/05-*.md` đã sửa về scope "file vật lý". Issue #10 đã revert
   (responsive) → nếu làm lại thì dùng layout **stacked** (không off-canvas drawer).
3. **killChild trên Windows** (đang làm): `runner.js` dùng `process.kill(-pid)` (POSIX group)
   — Windows không chạy + `useShell=true` thì `detached=false` = không group. Cần `taskkill
   /T /F /PID`. Verify: chạy app thật, tạo session, pause, xác nhận cây tiến trình chết.
4. **Feature còn lại (mới có doc, chưa code):**
   - **04** pluggable storage (JSON/SQLite/Postgres) — `docs/issues/04-*.md`.
5. **Ghi chú kỹ thuật cần kiểm chứng:** lệnh `claude auth login --claudeai` có thể lỗi thời;
   schema plugin của Claude Code (`enabledPlugins`) tuỳ phiên bản.

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
