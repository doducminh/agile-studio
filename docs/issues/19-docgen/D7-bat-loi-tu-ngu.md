# D7 — Bắt lỗi từ ngữ technical

**Type:** Feature · **Priority:** P2 · **Effort:** M · **Depends on:** D2, D3 · **Mockup:** MH 6

## Vấn đề

Lỗi nguy hiểm nhất của tài liệu sinh tự động là **nói về thứ không tồn tại**: một tên class, một
endpoint, một bảng CSDL nghe rất hợp lý nhưng không có trong mã nguồn. Người đọc tin, đi tìm, không
thấy, mất niềm tin vào cả bộ tài liệu.

Bên cạnh đó: cùng một khái niệm gọi ba tên khác nhau giữa các mục; thuật ngữ bị dịch sai
("gieo mầm dữ liệu" thay cho `seed`); mật khẩu và host nội bộ lọt vào bản phát hành; dấu vết công cụ
(tên trợ lý AI, tên tệp cấu hình agent) còn sót lại. Không có gì tự động bắt những thứ này.

## Kỳ vọng

Bộ luật chạy trên nội dung, mỗi phát hiện có mức nghiêm trọng và **đề xuất sửa cụ thể**. Hai nhóm
nặng nhất **chặn xuất bản chính thức**. Có thể cắm thêm Vale để dùng style guide của Google/Microsoft.

## Cách làm

### Symbol index — phạm vi thực tế

Nhóm "Sai sự thật" (và tiêu chí "Kiểm chứng được" của D6) dựa vào một **chỉ mục định danh** trích từ
mã nguồn: tên class, interface, hàm export, endpoint, bảng CSDL, khoá cấu hình. Với repo đa ngôn ngữ
thì đây là một tiểu dự án, không phải một dòng spec. Phạm vi chốt cho D7:

- **Trích bằng regex theo từng ngôn ngữ**, không dựng AST. Bắt đầu với JS/TS, C#, Python, SQL, JSON
  cấu hình. Thêm ngôn ngữ = thêm một tệp luật.
- **Chấp nhận bỏ sót.** Mục tiêu là bắt được lỗi rõ ràng, không phải phủ 100%.
- **Tuyệt đối không chặn khi nghi ngờ.** Định danh không tìm thấy trong ngôn ngữ *chưa hỗ trợ* thì
  báo `không kiểm chứng được (chưa hỗ trợ .kt)`, **không** báo là sai. Một bộ bắt lỗi hay báo nhầm
  sẽ bị tắt sau ba ngày.
- Chỉ báo mức **Nặng** khi định danh trông giống hệt quy ước của ngôn ngữ *đã hỗ trợ* mà vẫn không
  có trong chỉ mục — kèm gợi ý tên gần nhất theo khoảng cách Levenshtein.

### `server/docgen/lint.js` — 6 nhóm luật, chạy bằng luật, **miễn phí token**

| Nhóm | Ví dụ | Mức | Cách phát hiện |
|---|---|---|---|
| **Sai sự thật** | tài liệu nhắc `IOrderValidator` mà mã nguồn không có | Nặng | Đối chiếu mọi định danh trong IR với **symbol index** trích từ repo (class, interface, endpoint, bảng, khoá cấu hình) |
| **Bảo mật** | mật khẩu trong connection string; IP nội bộ của máy phát triển | Nặng | Regex + danh sách host nội bộ do người dùng khai; **miễn trừ theo bảng**, có ghi lý do |
| **Dấu vết công cụ** | tên trợ lý AI, tên tệp cấu hình agent | Nặng | Danh sách từ cấm, chỉnh được; lưu ý "Ai" tiếng Việt là dương tính giả |
| **Nhất quán** | `endpoint` / `điểm cuối` / `API route` lẫn lộn | Vừa | So với từ điển thuật ngữ; biến thể áp đảo làm chuẩn |
| **Dịch sai** | "gieo mầm dữ liệu" thay cho `seed` | Vừa | Danh sách thuật ngữ không được dịch |
| **Chính tả tên riêng** | `keycloak` → `Keycloak` | Nhẹ | Từ điển tên riêng công nghệ |

Ba nhóm đầu **chặn xuất bản chính thức** cho tới khi sửa hoặc miễn trừ **có ghi lý do**
(phối hợp D5). Bản nháp không bị chặn.

### Glossary — từ điển thuật ngữ (§2/N5)

Mỗi bộ tài liệu có một glossary: thuật ngữ chuẩn · biến thể cấm · có dịch hay không. Agent đề xuất
khi khảo sát (D1), người dùng sửa, và **dùng lại cho bộ sau**. Đây vừa là đầu vào của nhóm "Nhất quán"
vừa là nội dung mục **Glossary** của arc42 §12.

### Vale — tiện ích tuỳ chọn

Cùng cơ chế với `doc-protect-tool` (D3): Studio tự dò, hỏi cài, chọn style pack (Google / Microsoft).
Phát hiện của Vale **ghi rõ nguồn** (nhãn `Vale · Google`, tên luật `Google.Passive`) và **tắt được
từng luật**, không lẫn với luật nội bộ. Không có Vale thì 6 nhóm luật nội bộ vẫn chạy đủ.

### Server

- `GET /api/doc-jobs/:jid/findings`
- `POST /api/doc-jobs/:jid/findings/:fid/{apply,ignore,exempt}` — `exempt` bắt buộc có lý do
- `GET|PUT /api/doc-jobs/:jid/glossary`
- WS `doc:finding`

### Web — `DocLint.jsx`

Danh sách phát hiện nhóm theo mức, mỗi dòng: nhãn nhóm · mô tả · vị trí (tài liệu §mục) ·
đề xuất sửa · nút Sửa / Bỏ qua / Miễn trừ. Nút "Sửa tất cả loại nhất quán" cho nhóm sửa hàng loạt.

## Kiểm thử

1. Cấy vào IR một tên class không tồn tại → bị bắt ở mức Nặng, đề xuất tên gần nhất trong repo.
2. Cấy một connection string có mật khẩu và một IP nội bộ → cả hai bị bắt; IP nằm trong bảng đã
   miễn trừ thì **không** bị bắt.
3. Cấy một từ trong danh sách cấm → bị bắt; câu tiếng Việt bắt đầu bằng "Ai" → **không** bị bắt.
4. Dùng lẫn `endpoint` và `điểm cuối` → nhóm Nhất quán báo, "Thống nhất" sửa hết một lần.
5. Còn lỗi nặng → xuất bản chính thức bị chặn; miễn trừ có lý do → xuất được, lý do lưu lại.
6. Chưa cài Vale → 6 nhóm nội bộ vẫn chạy; cài Vale → có thêm phát hiện gắn nhãn nguồn, tắt được
   từng luật.
7. Sửa từ điển thuật ngữ rồi chạy lại → số phát hiện nhóm Nhất quán đổi theo.
8. Toàn bộ lượt kiểm tra **không tiêu token**.
9. **Không báo nhầm:** repo có file `.kt` (ngôn ngữ chưa hỗ trợ) → định danh trong đó được báo
   "không kiểm chứng được", **không** bị xếp vào nhóm Sai sự thật.
10. `npm test` (hạ tầng test dựng ở D6) chạy xanh cho `lint.js`; mỗi nhóm luật có ca bắt được và
    ca không được bắt nhầm.

## Không thuộc phạm vi

Chấm điểm (D6 — dùng chung kết quả nhóm Bảo mật cho tiêu chí 7, nhưng là feature riêng).
