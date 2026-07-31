# D8 — Hướng dẫn sử dụng

**Type:** Docs · **Priority:** P3 · **Effort:** S · **Depends on:** D1–D7

## Vấn đề

`README.md` ở gốc repo là tài liệu công khai (tiếng Anh, có badge và ảnh chụp màn hình) giới thiệu
Agile Studio như một orchestrator cho quy trình **PM → BA → DA → Dev → QC → PO**. Sau D1–D7, app có
thêm cả một mảng tính năng mới mà README không nhắc gì — người lạ vào repo sẽ không biết nó tồn tại,
và người dùng đã cài cũng không biết bắt đầu từ đâu.

## Kỳ vọng

Người chưa từng dùng đọc README là **hiểu tính năng làm gì** và **chạy được một bộ tài liệu đầu tiên**
mà không phải hỏi ai.

## Cách làm

### 1. Bổ sung vào `README.md` gốc

**Tiếng Anh, cùng giọng và cùng bố cục** với phần đang có (không viết tiếng Việt trong README công khai):

- Thêm mảng tính năng vào phần "Why Agile Studio?" và bảng tính năng: viết tài liệu sản phẩm theo
  chuẩn quốc tế (arc42/C4, ISO/IEC/IEEE 29148, IEEE 1016, 26514, 15289).
- Một mục mới **"Product documentation"**: bộ tài liệu là gì, chuẩn quyết định số file, luồng
  khảo sát → duyệt dàn ý → viết → chấm điểm → xuất.
- Ảnh chụp màn hình đặt trong `docs/` theo đúng cách đặt tên hiện có (`docs/01-dashboard.png` →
  thêm `docs/0N-docs-progress.png`, `docs/0N-docs-score.png`).
- Mục **Requirements** bổ sung công cụ tuỳ chọn: Python + `python-docx`, Microsoft Word hoặc
  LibreOffice, `doc-protect-tool`, Vale, Graphviz — kèm câu "Studio tự dò và cài giúp".

### 2. Trang hướng dẫn riêng — `docs/product-documentation.md`

Chi tiết hơn README, có mục lục:

1. **Quickstart** — tạo bộ tài liệu đầu tiên trong 5 bước, kèm ảnh.
2. **Chọn chuẩn nào** — bảng so sánh 5 chuẩn: dùng khi nào, gồm mấy file, hợp với ai.
   Kèm bảng **thuật ngữ**: tên mục của chuẩn giữ nguyên tiếng Anh, mỗi tên một dòng giải thích
   tiếng Việt (§2/N11) — đây cũng chính là nội dung các tooltip trong giao diện.
3. **Phạm vi** — toàn bộ / theo feature; lọc theo đóng góp git khi chỉ cần viết cho phần việc của
   một người.
4. **Mẫu Word** — chuẩn bị mẫu thế nào, style nào cần có, bảng Kiểm soát tài liệu được dò ra sao,
   ba cấp mẫu (toàn cục / project / bộ tài liệu).
5. **Chốt dàn ý** — vì sao có bước này, sửa gì được, lưu preset.
6. **Ba cách chạy** — đánh đổi tốc độ ↔ token ↔ nhất quán, khi nào chọn cái nào.
7. **Chi phí token** — nhãn `⛽`, ngưỡng hỏi 50K, việc nào miễn phí (chấm điểm, bắt lỗi, xuất file).
8. **Chấm điểm** — 7 tiêu chí nghĩa là gì, chỉnh trọng số, đọc khuyến nghị.
9. **Bắt lỗi từ ngữ** — 6 nhóm, nhóm nào chặn xuất bản, từ điển thuật ngữ.
10. **Xuất bản** — Word, PDF thường, PDF chống sao chép; nói thẳng bản raster không dùng được với
    trình đọc màn hình và không tìm kiếm được (§2/N7 — trung thực về giới hạn bảo vệ).
11. **Xử lý sự cố** — thiếu Python · Word đang mở file · mẫu thiếu style · hết quota giữa chừng ·
    LibreOffice làm mục lục sai.

### 3. Cập nhật `CLAUDE.md`

Thêm mảng tính năng mới vào phần trạng thái dự án để phiên Claude Code sau nắm được ngữ cảnh.

## Kiểm thử

1. Đưa README cho người chưa từng dùng → họ chạy được một bộ tài liệu mà không hỏi thêm.
2. Mọi ảnh chụp trong README và trang hướng dẫn khớp giao diện thật sau D1–D7 (không còn ảnh mockup).
3. Mọi lệnh và đường dẫn trong hướng dẫn chạy đúng trên máy sạch.
4. Mục "Xử lý sự cố" phủ đủ các lỗi đã gặp khi kiểm thử D1–D7.
5. README công khai **không có chữ tiếng Việt** và không nhắc tới `docs/issues/` (thư mục riêng).

## Ghi chú

D1–D7 mỗi feature tự cập nhật phần tài liệu của mình khi làm xong; **D8 là bước gom lại và viết
hoàn chỉnh cho người dùng cuối**, làm sau khi cả 7 feature đã được duyệt.
