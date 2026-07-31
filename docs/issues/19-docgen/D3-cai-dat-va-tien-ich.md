# D3 — Cài đặt & tiện ích

**Type:** Feature · **Priority:** P1 · **Effort:** M · **Depends on:** — (làm song song với D1) · **Mockup:** MH 8

## Vấn đề

- Tính năng tài liệu cần công cụ ngoài: Python + `python-docx`, Microsoft Word hoặc LibreOffice,
  [`doc-protect-tool`](https://github.com/doducminh/doc-protect-tool), Vale, Graphviz.
  Bắt người dùng tự tìm rồi gõ đường dẫn là trải nghiệm tệ.
- Khối "Kết nối" (issue 17) nằm trong sidebar, chiếm quá nhiều chỗ và chỉ hiện được 2 dòng.
- Modal Cài đặt hiện tại (`SettingsModal.jsx`) là một form phẳng, không có chỗ cho mẫu Word,
  preset dàn ý, hồ sơ chấm điểm, tiện ích.
- Mẫu Word chưa có chỗ khai báo — mỗi bộ tài liệu phải chọn lại từ đầu.

## Kỳ vọng

Một **modal Cài đặt kiểu `claude.ai/settings`**: ô tìm kiếm, danh mục trái chia nhóm, nội dung phải,
✕ góc trên. Studio **tự rà máy**, thiếu công cụ thì đề xuất và **cài giúp sau khi xác nhận**;
nhập đường dẫn thủ công chỉ là lối thoát cuối.

## Cách làm

### Sidecar — `agile-studio/docgen/`

- `detect.py` — rà PATH, thư mục cài quen thuộc, registry (Windows), môi trường Python, gói pip →
  trả JSON `{ name, found, version, path, how }` cho: Python, python-docx, Word COM, LibreOffice,
  doc-protect-tool, Vale, Graphviz.
- `install.py` — chạy sau khi người dùng xác nhận: `pip install …`, tải repo tiện ích về thư mục
  tiện ích của Studio, tạo `.env` từ `.env.example`. In từng bước ra stdout để UI hiện tiến trình.
- `styleprobe.py` — đọc mẫu `.docx` → named style (font, cỡ, màu, table style) **và dò bảng
  "Kiểm soát tài liệu"** có sẵn trong mẫu (Q16): trả danh sách dòng nhận ra được, để D4 điền giá trị
  vào đúng bảng của mẫu thay vì dựng bảng mới.

### Server — vẫn trong `server/routes/docgen.js` (Q19)

Route của D3 thêm vào **cùng tệp** mà D1 đã tạo, không đụng `server/index.js` lần nữa.

- `GET /api/tools` · `POST /api/tools/detect` · `POST /api/tools/:name/install` ·
  `PUT /api/tools/:name` (đường dẫn thủ công)
- `GET|POST /api/doc-templates` · `GET /api/doc-templates/:tid/styles`
- Thiếu công cụ **không làm sập** gì cả: chỉ khoá đúng tính năng phụ thuộc, giống cơ chế degraded
  của issue 17. WS `tools:changed`.

**Điểm chạm duy nhất với mã sẵn có:** `web/src/IntegrationStatus.jsx` — khối "Kết nối" trong sidebar
thu thành một nút `⚙ Cài đặt`. Đây là tệp của issue 17, đã merge cục bộ, không nằm trong stack PR
đang treo nên an toàn.

> **Cân nhắc:** ban đầu định gộp `python`/`docProtect`/`pdfConverter`/`vale` vào `/api/integrations`
> của issue 17. Bỏ ý đó — làm vậy phải sửa mã của issue 17 đang chờ upstream. Thay vào đó `/api/tools`
> đứng riêng, và UI hiển thị chung một chỗ. Cùng trải nghiệm, không đụng mã đang treo.

### Web

- `SettingsModal.jsx` dựng lại theo bố cục claude.ai — **giữ nguyên mọi mục cũ**, thêm nhóm mới:
  - **Cài đặt**: Chung (có **ngưỡng hỏi token**, mặc định 50K — Q13) · Account · Kết nối · Model & chi phí
  - **Tài liệu**: Tiện ích · Mẫu tài liệu · Preset dàn ý · Hồ sơ chấm điểm
  - **Tuỳ chỉnh**: Skill
- Khối "Kết nối" trong sidebar thu thành **một nút `⚙ Cài đặt`** kèm chấm trạng thái
  (`● 5/6 kết nối`), bấm vào mở modal đúng ở mục Kết nối.
- **Mẫu tài liệu 3 cấp** (Q15): mục "Mẫu tài liệu" ở modal = cấp toàn cục; mỗi project có mục riêng
  (để trống = kế thừa); bước 3 của wizard đè cho một bộ tài liệu. UI luôn hiện đang kế thừa từ đâu.

## Kiểm thử

1. Máy chưa có `doc-protect-tool` → mục Tiện ích báo thiếu kèm việc nó dùng để làm gì;
   "Cài giúp tôi" hiện 3 bước và chạy được; từ chối → chỉ mất tuỳ chọn PDF bảo vệ.
2. Gỡ Python khỏi PATH nhưng còn ở `C:\Python312` → "Rà lại máy" vẫn tìm ra.
3. Cài giúp thất bại (không có quyền) → báo lý do thật + hiện ô nhập đường dẫn thủ công.
4. Tải mẫu Word lên → bảng style hiện đúng font/cỡ/màu; mẫu thiếu style `Code` → cảnh báo, không sập.
5. Mẫu có sẵn bảng "Kiểm soát tài liệu" → `styleprobe` nhận ra và liệt kê đúng các dòng;
   mẫu không có → báo "không tìm thấy" và đề xuất dựng mới.
6. Đặt mẫu toàn cục, đè ở project, đè tiếp ở một bộ tài liệu → UI hiện đúng cấp đang áp dụng.
7. Đổi ngưỡng hỏi token từ 50K xuống 10K → hộp thoại xác nhận xuất hiện sớm hơn (kiểm cùng D1).
8. Modal: gõ vào ô tìm kiếm lọc đúng mục; ✕ đóng; mọi mục cũ của `SettingsModal` vẫn hoạt động.

## Không thuộc phạm vi

Dùng mẫu để render (D4) · gọi doc-protect-tool (D5) · chạy Vale (D7).
