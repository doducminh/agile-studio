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
| `wip/local-01-15` | Snapshot an toàn (backup). |

## GitHub issues & PRs (trên `TranDuy13/agile-studio`)
- **#1/#2/#3** (bug: ENOENT, email, .env) → **PR #4** (`Fixes #1 #2 #3`).
- **#5** (UX gộp: 09,11–15) → **PR #7** (`Fixes #5`, stacked trên #4 — merge #4 trước).
- **#6** (05 skill/plugin/role settings) → CHƯA có PR. Đã làm gọn thành file
  `.claude/settings.json` vật lý (không còn code sinh tự động).

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
1. **Theo dõi PR #4, #7** — chờ maintainer review/merge (merge #4 trước #7).
2. **PR cho #6 (05)** nếu muốn: tách commit `.claude/settings.json` ra nhánh sạch (off
   nhánh UX hoặc main), mở PR `Fixes #6`.
3. **Cập nhật doc/issue cho đúng scope đã chốt:** issue #6 + `docs/issues/05-*.md` vẫn mô tả
   bản UI phức tạp cũ → sửa về "ship file `.claude/settings.json` vật lý". Issue #10 đã revert
   (responsive) → nếu làm lại thì dùng layout **stacked** (không dùng off-canvas drawer).
4. **Feature còn lại (mới có doc, chưa code):**
   - **04** pluggable storage (JSON/SQLite/Postgres) — `docs/issues/04-*.md`.
   - **08** 1 Discord bot cấu hình qua `.env` — `docs/issues/08-*.md` (kèm xoá
     `bot.config.mock.json` đang lộ token, rotate token).
5. **Ghi chú kỹ thuật cần kiểm chứng:** lệnh `claude auth login --claudeai` có thể lỗi thời;
   `killChild` (runner) chưa kill được cây tiến trình trên Windows (cần `taskkill /T /F`);
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
