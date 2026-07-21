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
| `fix/killchild-windows-taskkill` | killChild `taskkill /T /F` (stacked trên #4) → **PR #10**. |
| `feat/pluggable-storage-04` | 04 storage json/sqlite/postgres + workspace vào DB (stacked #4) → **PR #11**. |
| `feat/project-management` | xoá project + bulk-add folder/git-repo (stacked trên #11) → **PR #12**. |
| `feat/session-usage-metrics` | token + %5h mỗi công việc (stacked trên #12) → **PR #13**. |
| `feat/responsive-stacked-10` | responsive stacked CSS (off `main`) → **PR #20** / issue #19. |
| `fix/add-account-loading-16` | loading + chờ trạng thái khi thêm account, refresh usage account mới. **LOCAL** (chưa PR). |
| `feat/integration-status-17` | trạng thái kết nối Storage + Discord bot (lý do + thử lại). **LOCAL**. |
| `feat/usage-dialog-details-18` | dialog usage: auth method, reset ngắn, link claude.ai, phân bổ quota. **LOCAL**. |
| `wip/local-01-15` | Snapshot an toàn (backup). |

**16–18 làm LOCAL trước theo yêu cầu**: đã commit trên 3 nhánh riêng (như 3 PR) và merge
`--no-ff` vào `personal/local-work`. **Chưa** tạo issue/PR trên `TranDuy13/agile-studio`,
chưa push nhánh nào lên `fork`. Spec: `docs/issues/16..18-*.md` (thư mục riêng, không push).

## GitHub issues ↔ PRs (trên `TranDuy13/agile-studio`)
Mọi issue do `doducminh` tạo → tự sửa body được (tác giả). Mọi PR đã gắn `Fixes #N` (auto-close khi merge).
| Issue | PR | Nội dung |
|-------|-----|----------|
| **#1 #2 #3** | **#4** | ENOENT · email account · path `.env` |
| **#5** | **#7** | UX account/login (09,11–15) |
| **#6** | **#9** | `.claude/settings.json` vật lý (thu gọn từ bản UI cũ) |
| **#14** | **#11** | pluggable storage json/sqlite/postgres + file vào DB + concurrent |
| **#15** | **#8** | Discord bot qua `.env` + xoá mock token |
| **#16** | **#10** | killChild Windows (`taskkill /T /F`) |
| **#17** | **#12** | xoá project + bulk-add folder/git-repo |
| **#18** | **#13** | đo token + %5h mỗi công việc |
| **#19** | **#20** | responsive stacked layout (CSS-only, ≤820px) |

Body issue #1,2,3,5,6 đã thêm banner "✅ Shipped in PR #N". Issue #14–18 mới tạo (mô tả + shipped).

## Chi tiết PR
- **04** (pluggable storage json|sqlite|**postgres**) → **PR #11** / issue **#14** (off #4). In-memory model
  (`store/state.js`) + backend ghi 1 document; API giữ SYNC (0 call-site đổi). node:sqlite
  built-in; postgres cho **nhiều máy chung 1 DB** (`DATABASE_URL`, `pg` optional, lazy import).
  **File cũng vào DB:** `server/workspace.js` mirror docs workspace (`projects/<slug>`) +
  upload requirement vào store khi dùng DB driver; đĩa chỉ là bản làm việc cho agent
  (materialize trước khi chạy / trước khi UI đọc, sync ngược trong `persist()`).
  Workspace **mode "repo"** (`document/` trong repo code) KHÔNG bị mirror/ghi đè.
- **Quản lý project** → **PR #12** / issue **#17** (stacked #11). Xoá project (cascade, không đụng file đĩa);
  `GET /api/drives`, `GET /api/scan?path&mode=folders|repos&depth`, `POST /api/projects/bulk`;
  UI: tab "Quét hàng loạt" trong AddProjectModal + nút 🗑 mỗi project.
- **Postgres concurrent-safe** (đã gộp vào **PR #11**): flush = locked read-modify-write
  (`SELECT … FOR UPDATE`) + merge delta → 2 máy sửa entity KHÁC nhau không clobber;
  cùng entity = last-writer-wins; poll 4s để hội tụ. `mergeDoc()` trong `store/postgres.js`.
- **Usage/công việc** → **PR #13** (stacked #12). Mỗi session cộng dồn **token** (từ
  `result.usage`) + **≈ % limit 5h** (delta 5h% đầu/cuối job). Hiện trên SessionCard.
- **Đã verify vòng agent thật**: session project 9 (Dev) chạy → ghi `DEV_F04_*.md` ra đĩa →
  `syncDocsBack` nạp vào Postgres `docFiles` (nội dung markdown thật). Materialize→ghi→sync OK.

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
- **16** modal thêm account: `busy` tách khỏi `step` (không rewind về form đầu), spinner +
  đếm giây + chặn đóng giữa chừng + bước "done"; `onDone(id)` → `AccountBadge` lấy usage
  của đúng account vừa thêm.
- **17** trạng thái kết nối: storage KHÔNG còn làm sập server khi DB lỗi (chạy degraded
  in-memory + báo lý do + `retryStorage()`); mỗi backend có `ping()`; bot tự báo trạng thái
  (`POST /api/bot/status`, heartbeat 15s, WS mở trước khi login Discord, nhận `bot:retry`);
  `GET /api/integrations[?probe=1]` + `POST /api/integrations/{storage,bot}/retry`;
  UI khối "Kết nối" trong sidebar (`web/src/IntegrationStatus.jsx`).
- **18** dialog usage: `authMethod`, dòng "reset sau 2h", link claude.ai, nút ↻,
  khối "Điều gì đang chiếm quota?" (toggle 24h/7 ngày) từ
  `GET /api/accounts/:id/attribution` — gom session theo model/project.

## Việc cần làm tiếp (TODO)
1. **Theo dõi PR** — chờ maintainer review/merge. Thứ tự: **#4** → #7/#8/#10/#11 (stacked #4)
   → **#12** (sau #11) → **#13** (sau #12); #9 độc lập off `main`.
2. **Body issue tự sửa được** vì `doducminh` là tác giả (dù chỉ READ repo). Đã đồng bộ banner
   "Shipped" cho #1,2,3,5,6. Responsive (spec 10) đã làm xong → issue #19 / PR #20.
3. **DB có tự seed không? (đã kiểm)** Không có dữ liệu demo. Chỉ một đường: **DB rỗng lúc
   khởi động → nạp toàn bộ `<DATA_DIR>/studio.json` của máy đó** (`readStudioJson()` trong
   `sqlite.js`/`postgres.js`), bảng tạo tự động bằng `CREATE TABLE IF NOT EXISTS`.
   `accounts.json` KHÔNG vào DB. Trước đây im lặng; sau #17 có log server + hiện
   "đã nạp dữ liệu sẵn có từ studio.json" trong modal trạng thái (`seededFrom`).
   Đã verify bằng sqlite + DATA_DIR có studio.json → `/api/projects` trả đúng dữ liệu cũ.
4. **Nếu muốn đưa 16–18 lên upstream:** tạo issue + PR (base `main`, stacked sau #11/#13 vì
   #17 đụng `server/store/*`, #18 đụng `server/index.js` phần session metrics của PR #13).
5. **Storage postgres — ceiling còn lại:** merge whole-document, poll 4s. Nếu cần realtime/
   throughput cao thì đổi sang change-feed per-row (LISTEN/NOTIFY) thay vì poll. Hiện đủ
   cho vài máy cá nhân.
6. **Ghi chú kỹ thuật:** ~~`claude auth login --claudeai`~~ đã kiểm — VẪN hợp lệ trên CLI
   2.1.215 (`--claudeai` là mặc định; có thêm `--email` prefill). Schema plugin
   (`enabledPlugins`) vẫn tuỳ phiên bản.

## Quy ước (yêu cầu của chủ repo)
- **Comment trong code phần mình viết: TIẾNG ANH** (không chú thích tiếng Việt). Chuỗi
  runtime hướng người dùng vẫn tiếng Việt theo app.
- **`docs/issues/` là thư mục RIÊNG của chủ repo:** KHÔNG push lên PR, KHÔNG trỏ tới nó
  trong PR/commit message gửi upstream.

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
