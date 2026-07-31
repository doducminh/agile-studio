# D2 — Viết nội dung, theo dõi tiến độ & xuất `.docx` tối thiểu

**Type:** Feature · **Priority:** P1 · **Effort:** L · **Depends on:** D1 · **Mockup:** MH 4, MH 7

> **Đây là mốc "cầm được sản phẩm".** D2 kết thúc là đã mở được file Word thật — xấu, chưa theo mẫu
> công ty, nhưng có chữ. Không đi ba feature liền mà không có gì cầm được.

## Vấn đề

Sau D1 mới có dàn ý, chưa có chữ nào. Và khi agent bắt đầu viết, cách duy nhất để biết nó đang làm
gì là đọc log terminal — không biết còn bao nhiêu mục, mục nào tắc, tài liệu nào xong.

Hai vấn đề nữa mà kế hoạch ban đầu bỏ sót:

- **Không có đường sửa tay.** Đọc thấy một câu sai thì sửa ở đâu? Sửa trong file `.docx` xuất ra thì
  lần render sau mất sạch. Mỗi lỗi nhỏ phải giao lại cho agent là tốn token và không chắc ra đúng.
- **Không có cách viết lại phần đã cũ.** Mã nguồn đổi thì mục nào cần viết lại? Không biết thì chỉ
  còn cách viết lại cả bộ.

## Kỳ vọng

Duyệt dàn ý xong, agent viết nội dung từng mục; nội dung **đọc và sửa được ngay trong app**; tiến độ
hiện theo từng mục, cập nhật realtime; tạm dừng / tiếp tục / đổi cách chạy được giữa chừng; và
**xuất ra `.docx` mở bằng Word được**.

## Cách làm

### Dữ liệu

Thêm `docgen.ir` và `docgen.exports` — lược đồ IR ở [`README.md`](./README.md) §5. Mỗi mục là một
đối tượng JSON độc lập.

Nguyên tắc bắt buộc (§2/N2): mọi khối IR mang `sources: [{ file, lines, commit }]`; khối không có
nguồn phải tự khai `assumption` hoặc `provided-by-owner`. Đây là nền cho D6 (tiêu chí "Kiểm chứng
được"), D7 (nhóm lỗi "Sai sự thật") **và** cho việc phát hiện mục đã cũ ngay trong feature này.

### Viết — `server/docgen/write.js`

Trạng thái job: `writing → editing`. Ba cách chạy (Q9), **đổi được khi đang chạy** qua
`PATCH /api/doc-jobs/:jid { run: { engine } }`:

| engine | Cách chạy |
|---|---|
| `per-doc` (mặc định) | mỗi tài liệu một session, chạy song song |
| `single` | một tiến trình viết tuần tự, giữ ngữ cảnh xuyên suốt |
| `per-section` | mỗi mục một session |

Đổi engine giữa chừng: dừng gọn session thừa, giữ nguyên IR đã ghi, không mất tiến độ.

Prompt viết được sinh từ: mục trong dàn ý + `hint` của chuẩn + `facts` của D1 + văn phong + `kind`
(reference/howto/explanation — §2/N6) + **glossary** + **luật không dịch tên mục** (§2/N11) +
yêu cầu `sources` bắt buộc.

### Sửa tay một mục (Q20)

- `PUT /api/doc-jobs/:jid/ir` — ghi đè IR của một mục, đặt `status = "edited"` và ghi `editedAt`.
- Mục `edited` **không bị agent ghi đè** ở lần viết lại. Muốn agent viết lại thì phải bấm
  "bỏ đánh dấu đã sửa tay" — có xác nhận, nói rõ nội dung sửa tay sẽ mất.
- Giao diện: mỗi mục có nút ✎; mở ra editor **theo từng khối** (đoạn văn, bảng, code, hình) chứ
  không phải một ô JSON thô — người dùng không nên phải nhìn thấy JSON.
- Sửa tay **không tiêu token**.

### Phát hiện mục đã cũ (Q21)

Vì mọi khối mang `sources` kèm `commit`, tính được mục nào đang trỏ tới file đã đổi:

1. `git diff --name-only <commit đã ghi>..HEAD` cho từng nguồn.
2. Mục nào có `sources.file` nằm trong danh sách đổi → `status = "stale"`.
3. UI hiện chấm cam ở mục đó và nút **"Viết lại N mục đã cũ"** — có nhãn token vì đây là việc tốn.
4. Mục `edited` bị đổi nguồn → vẫn báo `stale` nhưng **không** nằm trong lượt viết lại hàng loạt;
   phải chọn riêng.

Chạy khi mở job và khi bấm ↻. **Không tiêu token** — chỉ là `git diff` và so danh sách.

### Xuất `.docx` tối thiểu

`agile-studio/docgen/render.py` phiên bản đầu: IR → `.docx` bằng **theme mặc định**
([`RULESET.md`](./RULESET.md) §3), không nạp mẫu, không vẽ sơ đồ (khối `flow` tạm render thành
danh sách bước đánh số). Đủ để mở bằng Word và đọc.

- `POST /api/doc-jobs/:jid/export { docs[], formats: ["docx"], destDir, draft }`
- Ghi `docgen.exports`. **Miễn phí token.**
- Thiếu Python → nút xuất bị khoá kèm lý do và link tới Cài đặt (D3), phần còn lại vẫn chạy.
- File đang mở trong Word → báo tên file bị bỏ qua, không ném `PermissionError`
  ([`RULESET.md`](./RULESET.md) §6 #3).

D4 sẽ mở rộng chính `render.py` này để nạp mẫu công ty và bảng Kiểm soát tài liệu.

### Web — `web/src/docs/DocProgress.jsx`

Hai kiểu xem (Q11), nhớ lựa chọn theo từng job:

- **Chi tiết** — 3 cột: cây kế hoạch (màu theo trạng thái, có `edited` và `stale`) · nội dung mục
  đang viết + dòng hoạt động realtime + **nút ✎ sửa** · thống kê.
  Thống kê: Tiến độ % · Mục done/total · ước tính số trang (dòng phụ: số bảng · số hình) · thời gian
  đã chạy · Token. **Không hiện Quota 5h.**
- **Ma trận** — bảng tài liệu × mục, chiếm hết chiều ngang, cột cố định, cột `%` cuối mỗi hàng,
  ô trống phân biệt "chờ" với "chuẩn không có mục này".

Đổi cách chạy ngay trên thanh tiêu đề. Nút `⬇ Xuất…` mở hộp thoại chọn tài liệu + nơi lưu.

### Sự kiện WS

`doc:section` mỗi lần một mục đổi trạng thái · `doc:job` cho metrics tổng · `doc:export` khi xuất xong.

## Kiểm thử

1. Duyệt dàn ý 12 mục → 12 mục lần lượt `pending → writing → written`, hai kiểu xem khớp nhau.
2. Mở mục đã viết → đọc được nội dung; mọi khối có `sources` hoặc nhãn `assumption`.
3. **Xuất `.docx`** → mở bằng Word ra chữ, có heading đúng cấp, bảng có viền, mục lục có field.
4. **Sửa tay** một đoạn → mục chuyển `edited`; chạy lại lượt viết → mục đó **không bị ghi đè**;
   bỏ đánh dấu → agent viết lại và cảnh báo mất nội dung sửa tay.
5. **Mục đã cũ:** sửa một file nguồn rồi commit → mở job thấy đúng những mục trỏ tới file đó chuyển
   `stale`; "Viết lại N mục đã cũ" chỉ chạm đúng những mục ấy.
6. Mục vừa `edited` vừa `stale` → không nằm trong lượt viết lại hàng loạt.
7. Đang chạy `per-doc`, chuyển sang `single` → session thừa dừng gọn, tiến độ giữ nguyên, viết tiếp
   từ mục dang dở.
8. Tạm dừng → tiếp tục → không viết lại mục đã xong.
9. Account hết quota giữa chừng → đổi account, session `--resume` giữ ngữ cảnh.
10. Ma trận với 6 tài liệu × 41 mục không tràn ngang, không phải cuộn để thấy cột %.
11. Restart server khi đang viết → job về trạng thái lỗi có lý do, "Tiếp tục" chạy tiếp từ mục dở.
12. So 3 cách chạy trên cùng dàn ý: ghi lại thời gian, token, và độ lệch thuật ngữ (D7 đo sau).
13. Gỡ Python → tạo job, viết, sửa tay, xem tiến độ vẫn chạy; chỉ nút xuất bị khoá có lý do.

## Không thuộc phạm vi

Mẫu Word và bảng Kiểm soát tài liệu (D4) · PDF (D5) · chấm điểm (D6) · bắt lỗi (D7).
