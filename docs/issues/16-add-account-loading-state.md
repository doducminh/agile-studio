# 16 — "Thêm account" bị rewind về form đầu, không có loading; usage của account mới không được nạp

**Type:** Bug · **Priority:** P2 · **Effort:** S · **Depends on:** 02, 11, 13

## Vấn đề

Flow `👤 Thêm account Claude` → `▶ Lấy link đăng nhập` → dán code → `✓ Xác nhận & thêm`:

1. **Modal quay ngược về form đầu tiên rồi mới tự đóng sau một lúc.**
   `AccountLogin.jsx` dùng CHUNG một biến `step` cho cả "đang ở bước nào" lẫn "đang chờ server"
   (`setStep("busy")`). Vì phần render bước 1 có điều kiện `step !== "code"`, nên ngay khi bấm
   `Xác nhận & thêm` modal hiện lại ô "Tên gợi nhớ cho account… ▶ Lấy link đăng nhập" —
   trông như thao tác bị huỷ. Thực ra request `POST /api/accounts/login/code` vẫn đang chạy:
   server ghi code vào stdin của `claude auth login` rồi **chờ tiến trình đóng, tối đa 20 giây**
   (`server/index.js`). Khi nó trả về, modal đóng — nên trải nghiệm là "quay về form rồi tự đóng".
   Chỉ có duy nhất một chữ "Đang xử lý…" nhỏ ở footer, không có spinner, không nói đang chờ gì.

2. **Limit (usage) của account vừa thêm không được lấy mới.**
   `AccountLogin` gọi `onDone()` = `load()` của `AccountBadge`, mà `load()` cố tình gọi
   `/api/accounts` **không kèm `?usage=1`** (để khỏi gọi API usage mỗi lần đổi danh sách),
   và giữ lại usage cũ theo id. Account mới chưa từng có usage → thanh % nằm ở `—`
   cho tới khi người dùng tự bấm `↻`.

## Kỳ vọng

- Trong lúc chờ, modal **giữ nguyên bước hiện tại** (disabled) + spinner + câu giải thích
  đang chờ gì và đã chờ bao lâu; không cho đóng modal giữa chừng (backdrop/✕).
- Khi xong: hiện xác nhận "✓ Đã thêm account …" một nhịp ngắn rồi đóng.
- Sau khi thêm/đăng nhập lại thành công: **tự lấy usage của đúng account đó** ngay.

## Cách sửa

- `web/src/AccountLogin.jsx`: tách `busy` ("" | "start" | "code") ra khỏi `step`
  (`label | code | done`); đếm số giây đã chờ; disable input/nút/đóng khi `busy`;
  thêm bước `done`; `onDone(accountId)` truyền id account vừa thêm.
- `web/src/AccountBadge.jsx`: `load()` trả promise; thêm `afterLogin(id)` = `load()` rồi
  `refreshOne(id)` (fallback `refreshAll()` nếu không có id); dùng cho cả thêm mới và relogin.
- `web/src/styles.css`: `.spinner`, `.modal-busy`, `.modal-ok`.

## Kiểm thử

1. Thêm account → sau khi bấm `Xác nhận & thêm`, modal **vẫn ở bước code**, mờ đi, có spinner
   và bộ đếm giây; ✕ / click nền không đóng được.
2. Thành công → hiện "✓ Đã thêm account…" → đóng → account mới xuất hiện **kèm % (5h)**
   mà không cần bấm `↻`.
3. Sai code → quay lại bước code với thông báo lỗi, không mất link/loginId.
