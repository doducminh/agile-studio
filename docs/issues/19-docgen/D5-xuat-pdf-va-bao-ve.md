# D5 — Xuất PDF & bản chống sao chép

**Type:** Feature · **Priority:** P2 · **Effort:** M · **Depends on:** D4 · **Mockup:** MH 7

## Vấn đề

Sau D4 mới chỉ có `.docx`. Tài liệu gửi ra ngoài cần PDF, và với tài liệu nhạy cảm cần bản **chống
sao chép**. Chuỗi việc này gồm nhiều bước rời: chuyển sang PDF (và phải cập nhật mục lục trước khi
chuyển), rồi gọi [`doc-protect-tool`](https://github.com/doducminh/doc-protect-tool) để tạo bản bảo
vệ. Làm tay thì phải nhớ cú pháp từng bước và dễ quên bước cập nhật mục lục.

## Kỳ vọng

Xuất PDF ngay trong app, **hai mức** (Q3):

- **PDF thường** — có text, copy và tìm kiếm được, đọc được bằng trình đọc màn hình.
- **PDF chống sao chép** — raster 300DPI (mỗi trang là một ảnh, không còn lớp text), có watermark,
  mã hoá AES-256 (cấm copy/sửa, cho in), **giữ link bấm được**.

Chạy được trên máy **không có Word** (LibreOffice là đường mặc định). Không có `doc-protect-tool`
thì chỉ mất tuỳ chọn bản bảo vệ.

## Cách làm

### Sidecar

- `topdf.py` — `.docx → PDF`, hai đường:
  1. **LibreOffice** — `soffice --headless --convert-to pdf`. Đây là **đường mặc định trong tài
     liệu**: chạy được trên Windows / Linux / macOS, không cần bản quyền, kiểm thử được trên CI.
     Hạn chế: mục lục kém tin cậy hơn, UI phải nói rõ.
  2. **Word COM** — mở file, `Fields.Update()`, cập nhật mọi `TablesOfContents`, `Repaginate()`,
     `ExportAsFixedFormat`. Cho mục lục đúng số trang. Là **tối ưu hoá cho máy có Word**, tự động
     dùng khi phát hiện được (D3), không phải điều kiện để tính năng chạy.

  > **Vì sao đảo lại so với Q5.** Word COM chỉ chạy Windows, không kiểm thử được trên CI, và phần
  > lớn người dùng upstream không có Word — nếu tài liệu trình bày nó là đường chính thì D5 thành
  > PR khó review nhất và tính năng trông như chỉ dùng được trên một máy. Về hành vi thì không đổi:
  > máy có Word vẫn tự dùng Word.
- `protect.py` — gọi `make_pdf.py` của `doc-protect-tool` theo đường dẫn D3 đã dò, truyền
  `WATERMARK`, `RASTER_DPI`, `JPEG_QUALITY`, `USER_PASSWORD`, tiêu đề/tác giả. Không nhúng lại mã
  của tool — nó là repo riêng, có vòng đời riêng (Q4).

### Server

- `POST /api/doc-jobs/:jid/export { formats:["docx","pdf","pdf-protected"], destDir, draft }`
- Ghi `docgen.exports`: tên file, định dạng, dung lượng, thời điểm, bộ chuyển đã dùng.
- **Chặn bản chính thức khi còn lỗi nặng** (phối hợp D7): nhóm "Sai sự thật" và "Bảo mật" phải xử lý
  hoặc miễn trừ có ghi lý do. Bản nháp thì vẫn xuất được, có đóng dấu.
- Toàn bộ bước xuất **miễn phí token**.

### Web

Hộp thoại `⬇ Xuất…` thêm 2 định dạng; khi tích "PDF chống sao chép" mà thiếu tiện ích → hiện lý do
và link tới Cài đặt → Tiện ích. Danh sách "Đã xuất ra máy" gắn nhãn `🔒 chống sao chép` / `thường`.

### Ghi chú trung thực (§2/N7)

Bản raster **phá huỷ accessibility và khả năng tìm kiếm**. Vì vậy: luôn giữ `.docx` và PDF có text;
bản bảo vệ là *bản phát hành thêm*, không thay thế. Giữ nguyên nguyên tắc của `doc-protect-tool`:
không hidden-text, không poisoning, không metadata giả — PDF ảnh chỉ là rào cản, chốt chặn thật là
kiểm soát truy cập.

## Kiểm thử

1. **Máy chỉ có LibreOffice** (đường mặc định) → PDF thường xuất được, copy được text, UI báo rõ
   mục lục có thể không đúng số trang.
2. Máy có thêm Word → tự dùng Word COM, mục lục đúng số trang, UI ghi rõ đang dùng bộ chuyển nào.
3. PDF chống sao chép: không chọn được text; có watermark; **link vẫn bấm được**; thử copy/sửa bị
   chặn nhưng in được.
4. Đặt `USER_PASSWORD` → PDF hỏi mật khẩu khi mở; để trống → mở tự do nhưng vẫn cấm copy/sửa.
5. Gỡ đường dẫn `doc-protect-tool` → tuỳ chọn bản bảo vệ bị khoá kèm lý do; `.docx` và PDF thường
   vẫn xuất bình thường.
6. Còn lỗi nặng chưa xử lý → bản chính thức bị chặn, bản nháp vẫn xuất được và có đóng dấu.
7. Xuất bộ 6 file của chuẩn 15289 → 18 tệp (docx + pdf + pdf bảo vệ), lịch sử xuất ghi đủ.
8. Word đang giữ một file → file đó bị bỏ qua có báo, các file còn lại xuất bình thường.

## Không thuộc phạm vi

Render `.docx` (D4) · chấm điểm (D6) · bắt lỗi (D7).
