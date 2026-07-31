# D4 — Xuất Word theo mẫu doanh nghiệp

**Type:** Feature · **Priority:** P1 · **Effort:** **M** · **Depends on:** D2, D3 · **Mockup:** MH 2 (bước 3), MH 7

> Trước là L. Giảm xuống M vì **D2 đã dựng xong `render.py` bản tối thiểu** (theme mặc định) —
> D4 chỉ mở rộng chính tệp đó, không viết lại từ đầu.

## Vấn đề

Sau D2 đã có `.docx` mở được bằng Word, nhưng nó dùng theme mặc định của chính Studio: không phải
font, không phải màu, không phải kiểu bảng của công ty. Tài liệu gửi cho khách phải trông như tài
liệu của công ty.

Cạm bẫy phải tránh: **nhúng thẳng style vào mã**. Font, cỡ chữ, màu heading, màu nền bảng nằm trong
hàm dựng tài liệu thì đổi mẫu là phải sửa mã, và mỗi khách một bản script gần giống nhau — sửa một
lỗi trình bày phải sửa ở nhiều nơi.

## Kỳ vọng

Nội dung (IR) hoàn toàn không mang màu/cỡ chữ. Renderer **nạp mẫu `.docx` làm base** và ánh xạ nội
dung vào named style của chính mẫu đó. Đổi mẫu → đổi toàn bộ diện mạo, không đụng nội dung.

## Cách làm

### Mở rộng `agile-studio/docgen/render.py` (đã có từ D2)

- Mở mẫu Word bằng `python-docx` làm document gốc; không có mẫu thì giữ nguyên đường đi của D2 —
  theme mặc định ở [`RULESET.md`](./RULESET.md) §3.
- Ánh xạ khối IR → style của mẫu: `p → Normal`, `H1..H4 → Heading 1..4`, `table → table style của mẫu`,
  `code → style Code` (thiếu thì dự phòng Consolas 9pt nền `#F3F3F3`), `bullets/num → List Bullet /
  List Number`, `num.restart → đánh số thủ công` ([`RULESET.md`](./RULESET.md) §6 #5).
- **Bảng "Kiểm soát tài liệu" (Q16):** nếu `styleprobe` (D3) tìm thấy bảng có sẵn trong mẫu → điền
  giá trị vào đúng ô, **giữ nguyên bố cục và style của mẫu**; dòng chuẩn thiếu thì thêm vào cuối bảng
  theo đúng style đó. Không tìm thấy → dựng bảng mới bằng table style của mẫu.
- Bắt buộc **fixed table layout** chuẩn hoá theo bề rộng vùng in của mẫu ([`RULESET.md`](./RULESET.md) §6 #4).
- Chèn field mục lục `TOC \o "1-3" \h \z \u`; header/footer theo mẫu, footer in **Phân loại**.
- `figure`: chèn ảnh + caption + **alt text bắt buộc** (§2/N7); đánh số hình **liên tục xuyên tài liệu**.
- `agile-studio/docgen/flow.py`: vẽ sơ đồ từ khối `flow` theo quy ước §3
  (`if …` thoi đỏ · `return …` viên xanh lá · `DB: …` hình bình hành · còn lại chữ nhật bo).
  Có Graphviz thì dùng, không có thì vẽ bằng Pillow.
- Ghi file **idempotent**, in số khối đã ghi để tự kiểm ([`RULESET.md`](./RULESET.md) §6 #9).
  Luôn `PYTHONIOENCODING=utf-8`.

### Server

Endpoint `export` và lịch sử `docgen.exports` **đã có từ D2**; D4 chỉ thêm việc truyền `templateId`
xuống `render.py` và trả về cảnh báo khi mẫu thiếu style.

### Web

- Bước 3 của wizard: chọn mẫu (kế thừa toàn cục → project → job, Q15), bảng style đã dò, cảnh báo
  style thiếu.
- Tab **Xuất bản** đã có từ D2, D4 thêm nhãn "đang dùng mẫu …" trên mỗi tệp đã xuất.

## Kiểm thử

1. Cùng một bộ tài liệu, xuất với 2 mẫu Word khác nhau → nội dung y hệt, diện mạo khác hoàn toàn.
2. Mẫu có sẵn bảng Kiểm soát → bảng trong file xuất ra **giữ đúng bố cục mẫu**, giá trị được điền;
   thêm dòng "Trạng thái" theo đúng style bảng đó.
3. Mẫu không có bảng Kiểm soát → dựng mới bằng table style của mẫu, không dùng màu hard-code.
4. Bảng có ô chứa chuỗi dài (connection string) → cột không bị bóp hẹp (fixed layout).
5. Mục lục: mở file, cập nhật field → số trang đúng, 3 cấp.
6. Mọi hình có caption **và** alt text; số hình chạy liên tục qua các mục; khối `flow` giờ ra sơ đồ
   thật chứ không còn là danh sách bước như ở D2.
7. **Không hồi quy D2:** bỏ mẫu đi → vẫn xuất được đúng như bản D2, không lỗi.
8. Mẫu thiếu style `Code` → cảnh báo trên UI và dùng bản dự phòng, file vẫn xuất được.
9. Chạy xuất hai lần liên tiếp → kết quả giống nhau (idempotent).

## Không thuộc phạm vi

PDF (D5) · chấm điểm (D6) · bắt lỗi (D7).
