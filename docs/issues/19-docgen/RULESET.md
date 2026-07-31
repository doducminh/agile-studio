# Bộ luật viết tài liệu — nguyên tắc, tiêu chí chấm điểm, luật ngôn ngữ

Tài liệu nền cho tính năng **Tài liệu sản phẩm** (D1–D8). Toàn bộ nội dung ở đây dựa trên các
chuẩn công khai của ngành, không dựa trên bất kỳ dự án hay tài liệu nội bộ nào.

---

## 1. Chuẩn ngành tham chiếu

| Chuẩn / khung | Dùng để làm gì trong tính năng này |
|---|---|
| **ISO/IEC/IEEE 26514** — thiết kế và phát triển thông tin cho người dùng | Khung nội dung, điều hướng, accessibility |
| **ISO/IEC/IEEE 26515** — làm tài liệu trong môi trường agile | Tài liệu sinh theo feature, cập nhật tăng dần |
| **ISO/IEC/IEEE 26513** — người kiểm thử và người rà soát | Cơ sở cho bộ tiêu chí chấm điểm và checklist rà soát |
| **ISO/IEC/IEEE 15289** — life-cycle information items | Danh mục hạng mục bắt buộc của mỗi loại tài liệu |
| **ISO/IEC/IEEE 29148** — kỹ nghệ yêu cầu | Cấu trúc SRS/StRS, mã yêu cầu, thuộc tính, traceability |
| **IEEE 1016** — mô tả thiết kế phần mềm | Các viewpoint thiết kế bắt buộc |
| **ISO/IEC/IEEE 42010** — mô tả kiến trúc | Stakeholder → mối quan tâm → viewpoint → view |
| **arc42** | Khung 12 mục cho tài liệu kiến trúc |
| **C4 model** | 4 mức sơ đồ: Context → Container → Component → Code |
| **Diátaxis** | Phân loại nội dung: tutorial / how-to / reference / explanation |
| **ISO/IEC 25010** | Danh mục thuộc tính chất lượng cho mục yêu cầu phi chức năng |
| **ISO 82079-1** | Nguyên tắc viết hướng dẫn sử dụng |
| **Google / Microsoft style guide** | Luật ngôn ngữ: câu chủ động, ngắn, nhất quán |
| **WCAG 2.2 · PDF/UA** | Alt text, thứ bậc heading, bảng có hàng tiêu đề |
| **Architecture Decision Record** (Nygard) | Mục `Architecture Decisions` |

---

## 2. Mười một nguyên tắc thiết kế

### N1 — Tách nội dung khỏi trình bày

Agent chỉ sinh **IR** (biểu diễn trung gian, JSON). Trình bày do renderer quyết định, dựa trên mẫu
`.docx` mà người dùng cung cấp. Một nội dung → xuất được nhiều mẫu, nhiều định dạng. Đổi mẫu không
phải viết lại nội dung.

### N2 — Mọi khẳng định phải có nguồn

Mỗi khối IR mang `sources: [{ file, lines, commit }]`. Khối nào không có nguồn phải tự khai là
`assumption` hoặc `provided-by-owner`. Đây là cơ chế chống bịa mạnh nhất và là cơ sở chấm tiêu chí
"Kiểm chứng được".

### N3 — Khung tài liệu theo viewpoint, không tự chế

Bộ tài liệu do **chuẩn** quyết định, không do thói quen. Chuẩn khai báo dạng dữ liệu (danh sách tài
liệu + mục bắt buộc + loại nội dung của từng mục), nên thêm chuẩn mới không phải sửa engine.

Năm chuẩn hỗ trợ ở D1: arc42 + C4 · ISO/IEC/IEEE 29148 · IEEE 1016 + ISO/IEC/IEEE 42010 ·
ISO/IEC/IEEE 26514 · ISO/IEC/IEEE 15289.

### N4 — Traceability hai chiều

Mã `FR-##` từ tài liệu agile của project (đã có sẵn trong Studio) gắn vào từng luồng nghiệp vụ và
từng màn hình. Sinh traceability matrix ở phụ lục. Project không có tài liệu agile → tiêu chí này
**vô hiệu hoá và chia lại trọng số**, không trừ điểm oan.

### N5 — Glossary bắt buộc

Mỗi bộ tài liệu có một glossary: thuật ngữ chuẩn · biến thể cấm · có dịch hay không. Agent đề xuất
khi khảo sát, người dùng sửa, và nó được dùng lại cho bộ sau. Đây là đầu vào của bộ bắt lỗi từ ngữ,
đồng thời là nội dung mục **Glossary** của arc42 §12.

### N6 — Phân loại thông tin theo Diátaxis

Mỗi mục IR mang `kind: reference | howto | explanation | tutorial`. Không trộn reference với how-to
trong một mục. Văn phong áp theo `kind`: reference thì định danh súc tích, how-to thì đánh số bước;
lựa chọn văn phong của người dùng chỉ chi phối phần `explanation`.

### N7 — Accessibility là bắt buộc, PDF raster là tuỳ chọn

Mọi hình có chú thích **và** alt text; heading không nhảy cấp; bảng có hàng tiêu đề lặp lại.
**Luôn giữ bản `.docx` và PDF có text**; PDF raster chống sao chép là *bản phát hành thêm*, không
thay thế. Hướng dẫn phải ghi rõ bản raster không đọc được bằng trình đọc màn hình và không tìm
kiếm được.

Giữ nguyên tắc bảo vệ **trung thực**: không hidden-text, không poisoning, không metadata giả.
PDF ảnh chỉ là rào cản — OCR vẫn đọc được; chốt chặn thật là kiểm soát truy cập.

### N8 — Phiên bản và lịch sử sinh từ thay đổi thật

So sánh IR giữa hai lần dựng để sinh dòng lịch sử ("§6 thêm 2 luồng; §10 cập nhật 4 chỉ tiêu").
Phiên bản theo `major.minor`: major khi đổi cấu trúc mục, minor khi đổi nội dung. Sửa tay được.

### N9 — Cổng chất lượng chạy được, không phải lời khuyên

Mỗi tiêu chí chấm điểm là một hàm chạy trên IR, trả về điểm **kèm danh sách bằng chứng**.
Chi tiết ở §4. Không có điểm nào không giải thích được.

### N10 — Một engine, nhiều cấu hình

Khác biệt giữa các sản phẩm là **dữ liệu**, không phải mã: chuẩn · preset dàn ý · mẫu Word 3 cấp ·
hồ sơ trọng số chấm điểm · glossary. Không fork engine cho từng sản phẩm.

### N11 — Không dịch tên chuẩn và tên mục của chuẩn

Tên tài liệu và tên mục do chuẩn quy định thì **giữ nguyên tiếng Anh**, kèm **tooltip giải thích một
dòng bằng tiếng Việt**. Dịch chúng ra tiếng Việt vừa sai nghĩa vừa mất khả năng tra cứu ngược về
chuẩn gốc — "Building Block View" thành "khung nhìn khối", "Technical Debt" thành "nợ kỹ thuật",
"Life-cycle Information Items" thành "bộ hạng mục vòng đời" đều là những cách nói không ai dùng.

| Giữ nguyên tiếng Anh | Dịch sang tiếng Việt |
|---|---|
| Tên mục của chuẩn: `Building Block View`, `Runtime View`, `Cross-cutting Concepts`, `Architecture Decisions`, `Quality Requirements`, `Risks and Technical Debt`, `Glossary`… | Từ thông thường mô tả thao tác hoặc trạng thái: phạm vi, tiến độ, mục, nguồn, trọng số, bản nháp, khảo sát |
| Tên tài liệu chuẩn: `Software Architecture Document`, `Software Requirements Specification`, `Software Design Description`, `User Documentation`, `Life-cycle Information Items` | Nhãn do chính tính năng này đặt ra: Đầy đủ, Nhất quán thuật ngữ, Kiểm chứng được, An toàn thông tin |
| Thuật ngữ kỹ thuật đã quen: `endpoint`, `raster`, `watermark`, `alt text`, `preset`, `commit`, `seed`, `traceability`, `accessibility` | Từ có tương đương tự nhiên: hàng đợi, ràng buộc, mục lục, chân trang, phân loại |

Quy tắc quyết định: **nếu bản dịch không xuất hiện trong văn nói của người làm nghề thì đừng dịch.**
Áp dụng cho cả giao diện Studio và nội dung tài liệu do agent sinh ra.

---

## 3. Hợp đồng trình bày mặc định

Áp dụng khi bộ tài liệu **không gắn mẫu Word**. Có mẫu thì mọi giá trị dưới đây bị mẫu ghi đè —
renderer đọc named style của mẫu và dùng chính chúng (N1).

| Thành phần | Giá trị mặc định |
|---|---|
| Normal | Calibri 11.5pt · line 1.25 · space after 7pt · căn đều |
| Heading 1/2/3/4 | Calibri 17 / 13.5 / 12 / 11.5pt · màu `#1F4E79` · before 12pt after 4pt |
| Bảng | header nền `#1F4E79` chữ trắng · zebra `#F2F5F9` · thân 9.5pt · **fixed layout** |
| Mã nguồn | Consolas 9pt · nền `#F3F3F3` · thụt 8pt |
| Liên kết | `#0563C1` gạch chân |
| Lề | trái/phải 0.9" · trên/dưới 0.85" |
| Header / Footer | tên tài liệu góc phải 8pt xám · phân loại + số trang ở chân trang |
| Mục lục | field `TOC \o "1-3" \h \z \u`, cập nhật lúc xuất PDF |

**Sơ đồ luồng** — quy ước hình khối: `if …` = thoi đỏ · `return …` = viên xanh lá ·
`DB: …` = hình bình hành · còn lại = chữ nhật bo. Đánh số hình **liên tục xuyên tài liệu**
(sơ đồ và ảnh chụp chung một chuỗi).

---

## 4. Bộ tiêu chí chấm điểm

Bảy tiêu chí, mỗi tiêu chí là một hàm chạy trên IR, **trọng số chỉnh được**, gom thành hồ sơ chấm
dùng lại. Điểm luôn kèm danh sách bằng chứng.

| # | Tiêu chí | Cách đo | Chuẩn |
|---|---|---|---|
| 1 | **Đầy đủ** | mục bắt buộc của chuẩn có mặt và không rỗng / tổng mục bắt buộc | 15289, 26514 |
| 2 | **Traceability** | tỷ lệ `FR-##` được nhắc ở ít nhất một mục thiết kế; tỷ lệ luồng có mã yêu cầu | 29148 |
| 3 | **Nhất quán thuật ngữ** | 1 − (số lần dùng biến thể ngoài từ điển / tổng lần dùng thuật ngữ) | style guide |
| 4 | **Kiểm chứng được** | tỷ lệ khối IR có `sources` hợp lệ (file tồn tại, định danh tồn tại trong mã) | 26513 |
| 5 | **Trình bày & điều hướng** | có mục lục, heading không nhảy cấp, hình/bảng được đánh số và tham chiếu | 26514 |
| 6 | **Accessibility** | tỷ lệ hình có alt text, bảng có hàng tiêu đề, độ tương phản của mẫu | WCAG 2.2, PDF/UA |
| 7 | **An toàn thông tin** | 1 − (phát hiện bảo mật chưa xử lý / tổng khối) | §5 |

Xếp loại: `≥ 90` Tốt · `75–89` Khá · `60–74` Đạt · `< 60` Chưa đạt.
Mỗi khuyến nghị kèm **mức tăng điểm dự kiến** và nút giao lại cho agent.

---

## 5. Bộ luật bắt lỗi từ ngữ technical

Sáu nhóm, mỗi phát hiện có mức nghiêm trọng và đề xuất sửa cụ thể.

| Nhóm | Ví dụ | Mức | Cách phát hiện |
|---|---|---|---|
| **Sai sự thật** | tài liệu ghi một interface mà mã nguồn không có | Nặng | Đối chiếu mọi định danh trong IR với symbol index trích từ repo |
| **Bảo mật** | mật khẩu trong connection string; IP nội bộ của máy phát triển | Nặng | Regex + danh sách host nội bộ do người dùng khai; miễn trừ được theo bảng, có ghi lý do |
| **Dấu vết công cụ** | tên trợ lý AI, tên tệp cấu hình agent lọt vào bản phát hành | Nặng | Danh sách từ cấm, chỉnh được. Lưu ý "Ai" tiếng Việt là dương tính giả |
| **Nhất quán** | một khái niệm gọi nhiều tên khác nhau giữa các mục | Vừa | So với từ điển thuật ngữ; biến thể áp đảo làm chuẩn |
| **Dịch sai** | dịch thuật ngữ kỹ thuật vốn không nên dịch | Vừa | Danh sách thuật ngữ không được dịch |
| **Chính tả tên riêng** | viết sai hoa/thường tên công nghệ | Nhẹ | Từ điển tên riêng công nghệ |

Ba nhóm đầu **chặn xuất bản chính thức** cho tới khi xử lý hoặc miễn trừ **có ghi lý do**.
Bản nháp không bị chặn.

**Quy ước xử lý dữ liệu nhạy cảm:** che host nội bộ bằng placeholder (`<DEV_HOST_n>`, mỗi máy một
placeholder); che `User ID`/`Password` trong connection string; khoá `*key|secret|token` →
`<api-key>`/`<secret>`; giá trị int/bool giữ làm mẫu. Bảng nào cần giữ giá trị thật thì miễn trừ
tường minh, không tắt luật toàn cục.

---

## 6. Ghi chú kỹ thuật khi sinh `.docx`

Các bẫy đã biết của `python-docx` / Word COM — ghi lại để không mất thời gian dò lại:

1. Luôn đặt `PYTHONIOENCODING=utf-8` trước khi chạy Python từ Node.
2. Truyền chuỗi nhiều dòng qua `python -c` dễ hỏng nháy trên PowerShell → viết ra file `.py` rồi chạy.
3. File đang mở trong Word gây `PermissionError` khi ghi `.docx`, và Word COM cần file đóng để xuất
   PDF → phải báo tên file bị bỏ qua thay vì ném lỗi.
4. Bảng bị autofit bóp hẹp cột khi một ô chứa chuỗi dài → phải ép **fixed layout**
   (`w:tblLayout=fixed` + `tblGrid` + chuẩn hoá tổng bề rộng theo vùng in).
5. Style `List Number` dùng bộ đếm **chung toàn document** → số chạy tiếp qua các mục.
   Cần reset theo mục thì phải đánh số thủ công.
6. `cell.text = ""` để lại một run rỗng kế thừa Normal → ghi giá trị vào run **có nội dung**,
   đừng ghi vào `runs[0]`.
7. Chèn element vào giữa document: không lọc bằng `id()` của lxml (không ổn định) — dùng vị trí
   element (slice trước `sectPr`) + `addnext` / `addprevious`.
8. Script sửa `.docx` phải **idempotent** và in số ô/khối đã đổi để tự kiểm chứng.
9. Word COM là đường duy nhất cập nhật `Fields` + `TablesOfContents` đúng số trang;
   LibreOffice headless chạy được cross-platform nhưng mục lục kém tin cậy hơn.

---

## 7. Quyết định đã chốt

| Câu hỏi | Quyết định | Làm ở |
|---|---|---|
| Khung tài liệu | Chỉ dùng **chuẩn quốc tế**; chuẩn quyết định bộ gồm mấy file. Không tự chế khung | D1 |
| Bối cảnh & stakeholder, ràng buộc, ADR, glossary | Có — và không phải tự chế: đã là mục chuẩn của arc42 (§1–3, §9, §12) | D1 |
| Trọng số 7 tiêu chí | **Chỉnh được**, gom thành hồ sơ chấm dùng lại | D6 |
| N7 — nói thẳng về giới hạn của PDF raster | Có. Luôn giữ `.docx` + PDF có text; hướng dẫn ghi rõ hạn chế | D5, D8 |
| N4 traceability | Bật khi project có tài liệu agile; không có thì vô hiệu hoá tiêu chí và chia lại trọng số | D6 |
| Vale | Có — tiện ích tuỳ chọn: tự dò, cài giúp khi xác nhận, tắt được từng luật | D3, D7 |
| Bảng "Kiểm soát tài liệu" | **Đọc từ mẫu Word có sẵn** rồi điền giá trị, giữ nguyên bố cục mẫu; chỉ đề xuất bổ sung dòng thiếu | D3, D4 |
| Ngưỡng hỏi khi tốn token | **50K**, chỉnh được; "không hỏi lại" nhớ theo loại việc | D1 |
