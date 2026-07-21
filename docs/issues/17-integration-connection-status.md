# 17 — Hiện trạng thái kết nối của Storage & Discord bot (kèm lý do + nút thử lại)

**Type:** Feature · **Priority:** P2 · **Effort:** M · **Depends on:** 04, 08

## Vấn đề

Storage (`STORAGE_DRIVER` + `DATABASE_URL`) và Discord bot (`DISCORD_TOKEN`) đều được cấu hình
qua `.env`, nhưng **UI không hề cho biết chúng có kết nối được hay không**:

- **Storage**: nếu Postgres sai/không chạy, `store/index.js` ném lỗi ngay lúc import → **cả server
  chết** (web trắng, không có lý do trên UI). Nếu DB rơi *sau* khi khởi động, mỗi lần flush chỉ
  in `store persist failed: …` ra console — người dùng vẫn thao tác bình thường trong khi
  **không có gì được lưu**.
- **Discord bot**: chạy ở tiến trình riêng (`npm run bot`). Thiếu token / sai token / sai channel
  id thì bot chỉ log ra terminal rồi idle; UI không biết bot sống hay chết.

## Kỳ vọng

Trên UI có chỗ hiện trạng thái kết nối của cả hai; khi hỏng thì **bấm vào xem được lý do**
và **thử lại được** (kể cả ép tải lại trang).

## Cách sửa

**Storage** (`server/store/*`)
- Không sập server nữa: kết nối lỗi → chạy **degraded** (in-memory) + ghi lại lý do; UI cảnh báo
  rõ "dữ liệu KHÔNG được lưu". Kết nối lại sẽ lấy document trên DB làm chuẩn.
- Mỗi backend thêm `ping()` (postgres `SELECT 1`, sqlite `SELECT 1`, json = dir còn ghi được)
  để `/api/integrations?probe=1` kiểm tra thật chứ không chỉ báo theo lần ghi cuối.
- Theo dõi `connected / error / lastOkAt / lastErrorAt`; `flush()` cập nhật trạng thái.
- `seededFrom`: đánh dấu khi DB rỗng và được nạp từ `studio.json` (xem "Ghi chú" bên dưới).
- Export `storageStatus({probe})` và `retryStorage()`.

**Bot** (`server/bot.js`)
- Tự báo trạng thái về server: `POST /api/bot/status` lúc khởi động, khi ready, khi login lỗi,
  khi WS lên/xuống, và heartbeat 15s.
- Mở WebSocket tới server **ngay từ đầu** (trước cả khi đăng nhập Discord) → vẫn nhận được lệnh
  `bot:retry` khi đang lỗi.
- Nhận `bot:retry` → `client.login()` lại rồi báo kết quả.

**Server** (`server/index.js`)
- `GET /api/integrations[?probe=1]` → `{ storage, bot }` kèm `state` + `reason` + `hint`.
- `POST /api/integrations/storage/retry`, `POST /api/integrations/bot/retry`.
- Bot im lặng > 45s = `down` ("tiến trình bot không chạy"). Thiếu token = `off` (thử lại vô ích →
  báo phải sửa `.env`).
- Broadcast `integrations:changed` để UI cập nhật ngay.

**Web** (`web/src/IntegrationStatus.jsx`, `App.jsx`, `styles.css`)
- Khối "Kết nối" dưới panel account: 2 dòng có chấm màu (🗄 Storage · driver, 🤖 Discord bot).
- Bấm vào → modal chi tiết: driver/đích (che mật khẩu DB), lý do lỗi, gợi ý xử lý, thời điểm ghi
  thành công gần nhất… + nút **↻ Thử lại kết nối** và **⟳ Tải lại trang**.
- Poll 20s + cập nhật ngay khi có sự kiện `integrations:changed`.

## Ghi chú — DB có "tự seed" dữ liệu không?

Có, và chỉ đúng một trường hợp: **DB rỗng lúc khởi động thì được nạp từ `<DATA_DIR>/studio.json`
của máy đó** (đường di cư json → DB, đã có sẵn trong `sqlite.js` / `postgres.js`). Không có dữ liệu
mẫu/demo nào được tạo ra. Trước đây việc này diễn ra **im lặng**; nay có log ở server và dòng
"đã nạp dữ liệu sẵn có từ studio.json" trong modal trạng thái. Bảng `agile_state` vẫn được tạo tự
động (`CREATE TABLE IF NOT EXISTS`). `accounts.json` **không** nằm trong DB (vẫn theo máy).

## Kiểm thử

1. `STORAGE_DRIVER=postgres` + `DATABASE_URL` sai → server **vẫn chạy**, dòng Storage đỏ, modal
   ghi `connect ECONNREFUSED …` + cảnh báo mất dữ liệu; bấm Thử lại → báo lại lỗi.
2. Sửa `DATABASE_URL` đúng → bấm Thử lại → xanh, dữ liệu trên DB được nạp.
3. `sqlite` với `DATA_DIR` có sẵn `studio.json` → xanh + "đã nạp dữ liệu sẵn có từ studio.json",
   `GET /api/projects` trả về đúng dữ liệu cũ.
4. Chạy bot không có `DISCORD_TOKEN` → dòng bot xám "chưa cấu hình", Thử lại báo phải sửa `.env`.
5. Tắt tiến trình bot → sau ~45s chuyển đỏ "không chạy".
