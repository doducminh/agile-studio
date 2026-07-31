# D6 — Chấm điểm theo chuẩn quốc tế

**Type:** Feature · **Priority:** P2 · **Effort:** M · **Depends on:** D2 · **Mockup:** MH 5

## Vấn đề

Kiểm tra tài liệu bằng mắt không trả lời được những câu quan trọng: bộ tài liệu **đã đủ mục theo
chuẩn chưa**, có bao nhiêu phần **kiểm chứng được**, thuật ngữ có **nhất quán** không, có **truy vết**
về yêu cầu không. Đếm số trang hay số bảng thì dễ, nhưng không nói lên chất lượng.

## Kỳ vọng

Điểm số **giải thích được**: mỗi tiêu chí là một hàm chạy trên IR, kèm danh sách bằng chứng, và
khuyến nghị hành động được. Trọng số chỉnh theo khách hàng.

## Cách làm

### `server/docgen/score.js` — 7 tiêu chí, chạy bằng luật, **miễn phí token**

Tiêu chí 1 "Đầy đủ" đọc **`accept`** do chuẩn khai báo ở D1 (`minBlocks`, `mustHave`, `minSources`,
`noEmptyCells`) — không hard-code điều kiện trong engine.

| # | Tiêu chí | Cách đo | Chuẩn |
|---|---|---|---|
| 1 | Đầy đủ | mục bắt buộc của chuẩn có mặt và không rỗng / tổng mục bắt buộc | 15289, 26514 |
| 2 | Traceability | tỷ lệ `FR-##` được nhắc ở ít nhất một mục thiết kế; tỷ lệ flow có mã yêu cầu | 29148 |
| 3 | Nhất quán thuật ngữ | 1 − (số lần dùng biến thể ngoài từ điển / tổng lần dùng thuật ngữ) | style guide |
| 4 | Kiểm chứng được | tỷ lệ khối IR có `sources` hợp lệ (file tồn tại, định danh tồn tại trong mã) | 26513 |
| 5 | Trình bày & điều hướng | có mục lục, heading không nhảy cấp, hình/bảng được đánh số và tham chiếu | 26514 |
| 6 | Accessibility | tỷ lệ hình có alt text, bảng có hàng tiêu đề, độ tương phản của mẫu | WCAG 2.2, PDF/UA |
| 7 | An toàn thông tin | 1 − (phát hiện bảo mật chưa xử lý / tổng khối) — secret, host nội bộ, từ cấm | [`RULESET.md`](./RULESET.md) §5 |

Xếp loại: `≥ 90` Tốt · `75–89` Khá · `60–74` Đạt · `< 60` Chưa đạt.

Tiêu chí không áp dụng được (ví dụ Traceability khi project không có tài liệu agile) thì **vô hiệu hoá và
chia lại trọng số**, không trừ điểm oan.

### Trọng số & hồ sơ chấm (Q12)

`docgen.profiles` — mỗi hồ sơ là bộ trọng số 7 tiêu chí, tổng 100%. Seed sẵn vài hồ sơ
("Cân bằng", "Khách hàng nhà nước" nâng Đầy đủ + An toàn, "Nội bộ kỹ thuật" nâng Kiểm chứng được).
Quản lý ở Cài đặt → Hồ sơ chấm điểm (D3).

### Server

- `GET /api/doc-jobs/:jid/score` · `POST` để chấm lại — **miễn phí**
- `POST /api/doc-jobs/:jid/score/comment` — nhận xét định tính bằng agent, **tốn token**
- `GET|POST|PUT|DELETE /api/doc-profiles`
- Mọi endpoint tốn token trả `{ estTokens }` để UI áp quy ước ngưỡng 50K (Q13, đã có từ D1).

### Test tự động — lần đầu tiên trong repo

Repo hiện **không có script `test`** nào. Bộ chấm điểm là hàm thuần trên dữ liệu nên test rất rẻ:

- Dùng `node --test` có sẵn của Node — **không thêm dependency**.
- `npm test` → chạy `node --test server/**/*.test.js`.
- Phạm vi hẹp, chỉ hai thứ: `score.js` (D6) và `lint.js` (D7). Không cố phủ UI.
- Mỗi tiêu chí có ít nhất một ca "đạt" và một ca "không đạt" trên IR dựng sẵn trong test.

Đây là hạ tầng dùng chung, nên D6 dựng và D7 dùng lại.

### Web — `DocScore.jsx`

Tổng điểm + 7 tiêu chí có cột trọng số chỉnh được + bảng điểm theo từng tài liệu + danh sách
**khuyến nghị kèm mức tăng điểm dự kiến** và nút "Giao agent" (có nhãn token).

## Kiểm thử

1. Chấm bộ tài liệu đã viết xong → điểm từng tiêu chí kèm danh sách bằng chứng, không có điểm nào
   không giải thích được.
2. Bỏ alt text của 10 hình → tiêu chí Accessibility giảm đúng tỷ lệ; thêm lại → tăng đúng mức
   khuyến nghị đã dự báo.
3. Đổi hồ sơ chấm từ "Cân bằng" sang "Khách hàng nhà nước" → tổng điểm đổi đúng theo công thức.
4. Project không có tài liệu agile → tiêu chí Traceability bị vô hiệu, trọng số chia lại, UI ghi rõ lý do.
5. Sửa một mục cho `sources` trỏ tới file không tồn tại → Kiểm chứng được giảm, mục đó vào danh sách
   bằng chứng.
6. "Chấm lại" chạy trong vài giây và **không tiêu token**; "Nhận xét chi tiết" có nhãn `⛽`.
7. Chấm khi mới viết 8/12 mục → tiêu chí Đầy đủ phản ánh đúng, không báo lỗi.
8. `npm test` chạy xanh; mỗi tiêu chí có ca đạt và ca không đạt.
9. Đổi `accept` của một mục trong khai báo chuẩn (D1) → điểm Đầy đủ đổi theo, không phải sửa
   `score.js`.

## Không thuộc phạm vi

Bắt lỗi từ ngữ (D7 — dùng chung dữ liệu nhưng là feature riêng) · xuất file (D4, D5).
