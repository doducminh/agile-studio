# 18 — Dialog `📊 Usage` bổ sung các thông số như tab Usage của Claude Code

**Type:** Enhancement · **Priority:** P3 · **Effort:** M · **Depends on:** 02, 14

## Vấn đề

Dialog `📊 Usage · <email>` hiện mới có: tên/email/gói/tổ chức + thanh 5h, 7 ngày, theo model
và bảng limit. So với panel **Account & Usage** của Claude Code (ảnh tham chiếu) còn thiếu:

- **Auth method** (đăng nhập Claude AI hay API key).
- Dòng reset ngắn gọn kiểu "Resets in 2h" / "Resets in 4d" cạnh mỗi thanh.
- Link **Manage usage on claude.ai**.
- Khối **"What's contributing to your limits usage?"** có toggle **Day / Week** + ghi chú
  "ước lượng, chỉ từ máy này".
- Nút làm mới ngay trong dialog.

## Kỳ vọng

Dialog usage đủ dùng như một trang usage: biết đăng nhập kiểu gì, còn bao lâu tới reset,
và **cái gì đang ăn quota**.

## Cách sửa

**Server**
- `server/accounts.js`: `authMethodFor(configDir)` → `claudeai` | `apikey-helper` | `apikey` | `null`
  (đọc credential OAuth, rồi `settings.json:apiKeyHelper`, rồi `ANTHROPIC_API_KEY`).
- `GET /api/accounts/:id/usage` trả thêm `authMethod`.
- `GET /api/accounts/:id/attribution?window=day|week` (mới): gom **session đã lưu trong store**
  của đúng account đó trong 24h / 7 ngày → `totals` + `byModel` + `byProject`
  (token, $, số công việc, ≈% cửa sổ 5h — lấy từ số liệu per-job của issue #18/PR #13).

**Web** (`web/src/UsageModal.jsx`, `styles.css`)
- Mục **Tài khoản**: Phương thức đăng nhập · Tài khoản · Email · Tổ chức · Gói · config dir.
- Mục **Usage**: "Phiên (5 giờ)" / "Tuần (7 ngày)" kèm dòng `reset sau 2h`, các thanh theo model,
  link `Quản lý usage trên claude.ai ↗`, bảng limit như cũ.
- Mục **Điều gì đang chiếm quota?**: toggle **24 giờ / 7 ngày**, tổng công việc + token,
  thanh phân bổ theo model và theo project, ghi chú giới hạn của số liệu, empty state.
- Nút `↻` làm mới trong header dialog.

## Vì sao KHÔNG copy nguyên các dòng của Claude Code

Panel của Claude Code có "87% of your usage was at >150k context" và mục attribution cho
skills/subagents/plugins/MCP — những số này lấy từ **transcript nội bộ của chính CLI**, API
`/api/oauth/usage` không trả về. Ở đây dùng dữ liệu app thật sự có (token + % cửa sổ 5h mỗi
session) và **ghi rõ là ước lượng cục bộ**, thay vì bịa cho giống ảnh.

## Kiểm thử

`GET /api/accounts/<id>/attribution?window=day|week` với session dựng sẵn: lọc đúng cửa sổ thời
gian, đúng account (`usageAccount || activeAccount`), gom đúng theo model/project, sắp xếp giảm
dần theo token. Dialog hiện đủ 3 mục, toggle 24h/7 ngày đổi số liệu, `↻` nạp lại.
