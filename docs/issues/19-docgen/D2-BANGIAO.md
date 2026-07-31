# D2 — Bàn giao (sẵn sàng mở PR lên upstream)

**Nhánh:** `feat/docgen-d2` (tách off `feat/docgen-d1`) · **14 commit** hơn `upstream/main`, cây làm
việc sạch · **ĐÃ push lên `origin`** (fork) · **CHƯA mở issue · CHƯA mở PR · `upstream` chưa bị đụng.**

> ## 👉 Phiên sau bắt đầu ở **§11 — MERGE VÀO `personal/local-work`**
>
> Mã docgen **đã đẩy lên fork** (`origin`), hai nhánh `feat/docgen-d1` và `feat/docgen-d2`.
> Việc kế tiếp chủ repo giao, **theo đúng thứ tự này**:
>
> 1. **§11 — merge `feat/docgen-d2` vào `personal/local-work`**, đẩy lên **fork thôi**. Phiên D3 đã
>    thử merge, gỡ xong cả 3 xung đột, rồi **hoàn tác theo yêu cầu** để không để dở dang. §11 giữ
>    nguyên kết quả điều tra + có sẵn bản vá `D3-merge-personal-local-work.patch`. **Đừng dò lại.**
> 2. **§10 — mở PR lên upstream**, và **chỉ khi chủ repo bảo làm**:
>    - PR D1 → <https://github.com/doducminh/agile-studio/pull/new/feat/docgen-d1>
>    - PR D2 → <https://github.com/doducminh/agile-studio/pull/new/feat/docgen-d2>
>    - Nhớ **đổi base sang `TranDuy13/agile-studio` nhánh `main`** — GitHub mặc định trỏ vào fork.
>
> ⛔ **Không đẩy bất cứ thứ gì lên `upstream` khi chưa được phép.** Là contributor nghĩa là *có
> quyền* push thẳng — quyền không phải là sự cho phép. Chủ repo đã nói rõ điều này.
>
> **Ba điều dễ hiểu nhầm nhất — đọc trước khi gõ lệnh:**
>
> 1. **"Phiên D3" (§9) ≠ issue D3.** Trùng tên, không liên quan. Issue **D3 — Cài đặt & tiện ích**
>    **chưa làm gì cả**. §10.3 có bảng issue nào xong / issue nào chưa.
> 2. **`DEV_LOCK_ECONOMY = true` đang ép chế độ tiết kiệm** (haiku · 1 mục/lượt · prompt rút gọn,
>    không tắt được). Cố ý cho giai đoạn phát triển, **phải đổi thành `false` trước khi ship** — và
>    **phải nói trong mô tả PR**, nếu không người review thấy `--model haiku` hardcode sẽ hiểu nhầm.
>    §7.3 và §8.3.
> 3. **`docs/issues/` không đi cùng PR** (§10.4 #3) — kể cả bản bàn giao này. Muốn tác giả đọc được
>    lý do các quyết định thì phải tóm tắt vào mô tả PR.

**Bối cảnh lịch sử của tài liệu này** (các mục dưới viết dần qua ba phiên, đọc theo thứ tự):

| Mục | Phiên | Nội dung |
|---|---|---|
| §1–§6 | D2 | Mã D2 + 13 ca kiểm thử. **Bảng giá §4 "Nhóm B" là giá CŨ**, ứng với khi tắt tiết kiệm |
| §7 | D2.1 | Log ra đĩa · chế độ tiết kiệm bị ép · project mẫu `stale-demo` · nơi lưu khi xuất |
| §8 | — | "Bắt đầu phiên mới từ đây" của phiên trước. §8.1 lệnh chạy, §8.3 hai công tắc phải nhớ |
| §9 | D3 | 5 việc chủ repo giao khi dùng thật + hồi quy D1 tự động hoá |
| §10 | → phiên sau, **bước 2** | Đưa lên upstream và mở PR — **chỉ khi được phép** |
| **§11** | **→ phiên sau, BƯỚC 1** | **Merge vào `personal/local-work`** (xung đột đã gỡ sẵn) |

## 0. Bốn quyết định chủ repo đã chốt (cuối phiên)

| Câu hỏi | Quyết định | Hệ quả |
|---|---|---|
| Ngân sách token cho kiểm thử còn lại | **Không tiêu thêm token nào** | Ca 1 (đủ 12 mục), 4b, 9, 11, 12 để chủ repo tự chạy khi tiện. §4 ghi rõ cách chạy từng ca |
| Cờ `edited` vs `status` | **Giữ trường riêng, sửa `README.md` §4** | Đã sửa: §4 có thêm hộp "Đính chính từ D2" phân vai `status` (hiển thị) và `edited` (quyền ghi đè) |
| Nhánh `feat/docgen-d2` | **Đứng yên, chờ chủ repo đọc mã** | Không merge vào `personal/local-work`, không push, không PR |
| App đang tắt | **Chủ repo tự bật lại** | `cd agile-studio && npm run dev`. Dữ liệu kiểm thử vẫn còn trong `docgen.json` — cách dọn ở §5 |

---

## 1. Trạng thái ngay lúc này — đọc trước khi làm gì

| Việc | Trạng thái |
|---|---|
| Mã D2 | Đã commit `d52c46a` trên `feat/docgen-d2`. Cây làm việc sạch (trừ `.claude/`, `agile-studio/.env`, `docs/issues/` vốn untracked) |
| Sửa của chủ repo | Vẫn nằm trong stash: `git stash list` → `park owner docs edits` (CLAUDE.md + docs/issues/README.md) |
| App | **Đang tắt.** Phiên trước đã kill `yarn dev` của chủ repo lúc 15:22 để chạy bản D2, rồi tiến trình server chết theo phiên. Chủ repo cần `npm run dev` lại |
| `docgen.json` | Có **dữ liệu rác của kiểm thử** — xem §5 để dọn |
| Backup | `~/.agile-studio/docgen.json.d2-backup` và `.pre-d2` (chụp trước khi test) |
| Tiến trình mồ côi | Có thể còn vài `claude.exe` sót lại từ lượt viết bị ngắt — `taskkill /IM claude.exe /F` nếu thấy |

## 2. Đã làm gì

**Điểm chạm với mã sẵn có: 0 dòng.** `git diff --stat feat/docgen-d1..HEAD` chỉ có 16 tệp, toàn bộ là
tệp mới hoặc tệp do D1 tạo ra. Không có `server/index.js`, `web/src/App.jsx`, `server/store.js`,
`web/src/styles.css`.

### Tệp mới

```
server/docgen/ir.js         lược đồ IR (README §5): chuẩn hoá khối agent sinh ra + đo số liệu
server/docgen/write.js      3 cách chạy, đổi giữa chừng, tạm dừng/tiếp tục, đổi account khi hết quota
server/docgen/stale.js      phát hiện mục đã cũ bằng git diff — không tiêu token
server/docgen/exporter.js   dò Python thật sự chạy được rồi gọi render.py
docgen/render.py            IR → .docx, theme mặc định (RULESET §3)
web/src/docs/DocProgress.jsx   MH 4 (2 kiểu xem) + MH 7 (tab Xuất bản)
web/src/docs/IrView.jsx        đọc nội dung một mục theo khối
web/src/docs/SectionEditor.jsx sửa tay theo từng khối, không lộ JSON
web/src/docs/ExportDialog.jsx  chọn tài liệu · định dạng · nơi lưu · đóng dấu bản nháp
```

### Tệp D1 bị sửa (đều nằm trong phạm vi cho phép)

`server/routes/docgen.js` (+298) · `server/store/docgen.js` (+44) · `server/docgen/seed.js` (+129) ·
`web/src/docs/DocJobs.jsx` · `DocOutline.jsx` (nút "▶ Bắt đầu viết" giờ dẫn sang màn tiến độ) ·
`TokenConfirm.jsx` (+1 nhãn `rewrite`) · `docgen.css` (+146).

### API thêm mới

```
POST   /api/doc-jobs/:jid/write      { only?, engine? }  → plan-approved|paused|error → writing
POST   /api/doc-jobs/:jid/stop       dừng cả khảo sát lẫn viết
PATCH  /api/doc-jobs/:jid            { run:{engine} } → đổi cách chạy NGAY khi đang chạy
GET    /api/doc-jobs/:jid/ir         dàn ý + nội dung + số liệu + lịch sử xuất, một lần gọi
PUT    /api/doc-jobs/:jid/ir         { id, blocks, traces } → sửa tay, đặt status=edited
POST   /api/doc-jobs/:jid/ir/unedit  { id } → bỏ đánh dấu để agent được ghi đè
POST   /api/doc-jobs/:jid/stale      chạy git diff, đánh dấu mục đã cũ — miễn phí token
POST   /api/doc-jobs/:jid/export     { docs[], formats:["docx"], destDir, draft }
GET    /api/doc-jobs/:jid/exports
GET    /api/doc-tools[?recheck=1]    Python + python-docx có dùng được không
WS     doc:section · doc:job · doc:export (thêm vào doc:activity của D1)
```

`GET /estimate` thêm `pending` (mục còn phải viết + token) và `stale` (mục viết lại được hàng loạt,
kèm `held` = số mục vừa cũ vừa sửa tay nên không nằm trong lượt hàng loạt).

### Quyết định trong lúc làm — cần chủ repo xác nhận

| Điểm | Đã làm thế nào | Vì sao |
|---|---|---|
| Cờ `edited` | Là **trường riêng** tồn tại song song với `status`, không phải một giá trị của `status`. **Chủ repo đã duyệt; `README.md` §4 đã sửa theo** | Mục vừa `edited` vừa `stale` phải hiện được cả hai (ca 6). Ép vào một trường thì `stale` che mất `edited` |
| `commit` trong `sources` | **Server tự đóng dấu** HEAD, không để agent tự khai | Agent bịa một sha là vô hiệu hoá luôn tính năng phát hiện mục đã cũ |
| Commit không tra được | Giữ nguyên nhãn cũ, **không** hạ xuống "written" | "Không kiểm được" khác "chắc chắn còn mới" |
| Tab của màn tiến độ | Chỉ có **Tiến độ** và **Xuất bản** | MH 7 vẽ 4 tab nhưng Chấm điểm (D6) và Lỗi thuật ngữ (D7) chưa có. Không làm tab chết |
| Đóng dấu bản nháp | Ghi ở **đầu trang + trang bìa**, chưa phải watermark chéo trang | Watermark là VML dài, để D4 làm cùng lúc nạp mẫu |
| Thử lại khi phiên thoát bất thường | Thử lại **1 lần** cho mỗi phiên khi CLI thoát ≠ 0 mà chưa ghi ra tệp nào | Đây là lỗi runner.js đã biết (§7.6 của D1-BANGIAO: `spawn` không đóng stdin). Mất cả một tài liệu vì một lần spawn hỏng thì quá đắt |
| Glossary | Lấy từ `job.meta.glossary` nếu có, không thì suy từ `facts.stack` | D1 chưa có màn sửa glossary (RULESET N5). Đây là chỗ **nợ**, nên làm ở D3 hoặc D6 |

## 3. Kiểm thử — 6 đạt / 2 một phần / 5 chưa chạy

| # | Ca | Kết quả |
|---|---|---|
| 1 | 12 mục lần lượt `pending → writing → written`, hai kiểu xem khớp | **Đạt** — chạy thật 4 mục engine `per-section`, bắt sự kiện WS đúng như trình duyệt nhận: 4/4 mục có đủ `writing → written`. Hai kiểu xem đọc cùng một trường `status` nên không thể lệch. **Chưa chạy đủ 12 mục** |
| 2 | Mở mục đã viết, mọi khối có `sources` hoặc nhãn `assumption` | **Đạt** — 14 khối: 10 có nguồn thật (đường dẫn + số dòng + commit `a9a22e8`), 4 tự khai `assumption`, **0 khối thiếu nguồn** |
| 3 | Xuất `.docx`, mở bằng Word, heading đúng cấp, bảng có viền, mục lục có field | **Đạt** — kiểm bằng XML: `Heading1/2` 34/27 half-pt màu `1F4E79`, Normal 23 half-pt line 300 căn đều, 9 bảng đều `tblLayout=fixed` + `TableGrid`, field `TOC \o "1-3" \h \z \u`, footer có `PAGE`/`NUMPAGES`. LibreOffice mở và chuyển sang PDF được → tệp hợp lệ. **Chưa mở bằng Word thật** |
| 4 | Sửa tay → `edited`; chạy lại không bị ghi đè; bỏ đánh dấu thì viết lại | **Đạt phần bảo vệ** — sửa tay đặt `edited`, và lượt viết **từ chối cả khi chỉ định đích danh** mục đó. **Chưa chạy** nhánh "bỏ đánh dấu rồi agent viết lại thật" |
| 5 | Sửa file nguồn rồi commit → đúng mục trỏ tới file đó thành `stale` | **Đạt** — repo git thật, 3 mục: mục dẫn `src/a.ts` (đã đổi) → `stale`; mục dẫn `src/b.ts` (không đổi) → vẫn `written` |
| 6 | Mục vừa `edited` vừa `stale` không nằm trong lượt viết lại hàng loạt | **Đạt** — `estimate.stale` = 1 mục, `held` = 1 mục |
| 7 | Đang `per-doc`, chuyển `single` → phiên thừa dừng gọn, viết tiếp từ mục dở | **Đạt** — 2 tài liệu chạy song song, đổi lúc t+55s khi đã xong 1 mục: `switched=true`, **0 mục bị viết lại**, 3 mục còn lại do phiên `single` viết nốt, 4/4 xong |
| 8 | Tạm dừng → tiếp tục → không viết lại mục đã xong | **Đạt** — dừng lúc 2/4, giữ nguyên 2 mục, lượt tiếp chỉ nhận 2 mục, **0 mục bị viết lại** |
| 9 | Hết quota giữa chừng → đổi account, `--resume` giữ ngữ cảnh | **Chưa chạy** — máy chỉ có **một** account đang bật. Mã đã có (copy transcript rồi `--resume`) nhưng chưa chứng minh được |
| 10 | Ma trận 6 tài liệu × 41 mục không tràn ngang | **Chưa chạy trên trình duyệt** — bảng dùng `table-layout:fixed; width:100%` nên về lý thuyết không thể tràn, và có chế độ `dense` bỏ ký hiệu khi > 22 cột. Phải nhìn mắt mới kết luận được |
| 11 | Restart server khi đang viết → job về `error` có lý do, "Tiếp tục" chạy tiếp | **Chưa chạy xong** — mã đã có (lúc khởi động, job `writing` → `error` kèm lý do, mục đang `writing` → `pending`). Phiên trước chết đúng lúc đang dựng ca này |
| 12 | So 3 cách chạy trên cùng dàn ý: thời gian, token, độ lệch thuật ngữ | **Chưa chạy đủ.** Số đo rời rạc đã có: `per-doc` 6 mục 193s / 628K · `per-section` 4 mục 113s / 457K · `single` (nửa sau của ca 7) 4 mục 168s / 236K. Khác dàn ý, khác repo → **không so sánh được**, cần một lượt đo tử tế |
| 13 | Gỡ Python → mọi thứ vẫn chạy, chỉ nút xuất bị khoá | **Đạt một phần** — máy này sẵn có một Python thiếu `python-docx` nên dò được thật: `py -3 docgen/render.py --check` → `{"ok":false,"errorKind":"missing-docx"}`, còn `python …` → `{"ok":true,"pythonDocx":"1.2.0"}`. Đây đúng là thứ `exporter.js` dựa vào để khoá nút. **Chưa xem nửa giao diện** (nút mờ + lý do + danh sách ứng viên đã thử) |

**Phát hiện phụ khi test:** trên máy này `python` trên PATH là bản đi kèm LibreOffice (3.12.13, *có*
python-docx), còn `py -3` là CPython 3.14.6 *không có* python-docx. Vì vậy `exporter.js` không hỏi
"có Python không" mà hỏi "bản nào chạy được `render.py --check`" — dò lần lượt và lấy bản đầu tiên trả lời được.

## 4. Việc còn lại

### Nhóm A — không tốn token, chỉ cần bật app rồi nhìn

```bash
cd agile-studio && npm run dev          # API :4311 · web :5311
curl -X POST http://localhost:4311/api/projects/<id>/doc-seed
```

Bộ mẫu **"Software Architecture Document — đang viết"** dựng sẵn đủ mọi trạng thái để xem giao diện
mà không chạy agent: 13 mục có nội dung thật, 1 mục `edited`, 1 mục `stale`, 1 mục `error`,
1 mục `writing`, và một lượt xuất đã ghi lại.

1. **Ca 10** — mở bộ `iso15289` (6 tài liệu), bấm **Ma trận**. Kiểm: không tràn ngang, cột `%` luôn
   thấy được, ô trống của "chuẩn không có mục này" phân biệt được với "chờ" (ô trong suốt vs ô xám).
   Thu nhỏ cửa sổ xuống < 820px để xem chế độ `dense` bỏ ký hiệu.
2. **Ca 13 nửa giao diện** — nút **⬇ Xuất…** phải mờ kèm lý do khi không dò được Python. Ép lỗi bằng
   cách đổi tạm `CANDIDATES` trong `server/docgen/exporter.js` thành `[["python-khong-ton-tai", []]]`,
   restart server, mở tab **Xuất bản**. Nửa server đã kiểm rồi (§3).
3. **Ca 3 nốt phần Word thật** — mở `.docx` đã xuất bằng Word, nhấn **F9** ở mục lục xem có điền số
   trang không. Đã kiểm bằng XML và mở được bằng LibreOffice, nhưng Word mới là thứ người dùng dùng.
4. **Sửa tay** — mở một mục, bấm ✎, sửa một đoạn, thêm một bảng, lưu. Kiểm mục chuyển `edited` và
   nút "▶ Viết lại mục này" biến mất. Không tốn token.
5. **Hồi quy D1** (§5 của `D1-BANGIAO.md`): tạo bộ tài liệu, áp preset, duyệt dàn ý, mở khoá.
   ~~Chưa chạy lại sau khi sửa D2.~~ → **XONG ở D3: `node tests/d3-regress-d1.mjs`, 70 ca, 0 token.
   Xem §9.4.** Phần cần agent thật (ca 2 · ca 7 · ca 10) vẫn ngoài tầm bài test đó.
6. `npx vite build --config web/vite.config.js` — **đã chạy lại sau hai lần sửa cuối, sạch**
   (296.12 KB js · 51.92 KB css).

### Nhóm B — tốn token, chủ repo tự chạy khi tiện

Chi phí đo được: **một lượt viết 4–6 mục trên repo nhỏ tốn 230K–630K token.**

| Ca | Cách chạy | Chi phí |
|---|---|---|
| **11** restart giữa lúc viết | Bấm ▶ Bắt đầu viết, chờ ~40s, tắt server, bật lại. Kiểm: job về `error` với lý do "Server khởi động lại khi đang viết", các mục đang `writing` về `pending`, mục đã xong vẫn còn; bấm Tiếp tục chỉ nhận mục chưa xong | ~1 lượt ngắn |
| **4** nhánh sau | Trên mục đã `edited`: bấm "↺ Bỏ đánh dấu đã sửa tay" (có hộp cảnh báo mất nội dung), rồi "▶ Viết lại mục này" | ~1 mục |
| **1** đủ 12 mục | Một bộ arc42 trọn vẹn. Cơ chế đã chứng minh ở quy mô 4–6 mục | ~600K–1M |
| **12** so 3 cách chạy | 3 lượt trên **cùng một dàn ý, cùng repo** — số hiện có (`per-doc` 193s/628K, `per-section` 113s/457K, `single` 168s/236K) khác dàn ý khác repo nên **không so sánh được** | ≈1.5M |
| **9** đổi account khi hết quota | **Cần thêm một account thứ hai đang bật.** Máy hiện chỉ có một | — |

## 5. Dọn rác kiểm thử

Phiên trước đã tạo dữ liệu thật trong `docgen.json` và trên đĩa:

```bash
# bộ tài liệu do kiểm thử tạo (tên bắt đầu bằng "Write test", "Run test", "Switch test", "Stale demo")
# — xoá bằng nút 🗑 trên tab 📚 Tài liệu, hoặc DELETE /api/doc-jobs/<id>

# project kiểm thử: "stale-demo" (id 4) trỏ vào thư mục tạm
# dữ liệu mẫu:
curl -X POST "http://localhost:4311/api/projects/1/doc-seed?clear=1"

# thư mục tạm của phiên trước (xoá cả cụm được):
#   %LOCALAPPDATA%\Temp\claude\e--gits-agile-studio\<session>\scratchpad\
#     stalerepo/  out/  out2/  t-*.mjs  payload.json  server.log
```

Nếu muốn quay lại đúng trạng thái trước khi test:
`cp ~/.agile-studio/docgen.json.pre-d2 ~/.agile-studio/docgen.json` (khi app đang tắt).

## 6. Bẫy đã dò ra, đừng dò lại

1. **Đừng khởi động server từ tool Bash.** Môi trường của tool đó làm Claude CLI thoát 1 ngay
   (`CLAUDE_CODE_GIT_BASH_PATH ...`). Chạy từ PowerShell hoặc từ terminal thật thì bình thường.
2. **`printable_width()` của python-docx trả `int` EMU, không phải `Length`** — phép trừ giữa hai
   `Length` mất kiểu, `.inches` nổ. Đã bọc lại một chỗ.
3. **`render.py` luôn in đúng một khối JSON ra stdout**, kể cả khi lỗi (`die()` thoát mã 0). Node
   parse stdout; nếu để traceback lọt ra thì phía Node chỉ báo "không đọc được kết quả".
4. **Tệp bị khoá không phải là lỗi xuất.** Route trả 200 kèm danh sách `skipped` có tên tệp; chỉ khi
   renderer không ra được gì cả mới là 400. (Lần đầu làm sai, đã sửa.)
5. **Đối chiếu đường dẫn trong dòng hoạt động** (`✍️ viết …/ir/sad/6.2.json`) phải so bằng hậu tố
   `<docKey>/<num>.json` tính sẵn lúc claim, không cắt chuỗi tại chỗ — khoá tài liệu của bộ tuỳ chọn
   có dấu `:` nên tên thư mục phải làm phẳng.
6. **Đừng chạy hai server trên cùng `docgen.json`.** Vẫn đúng như D1 dặn — phiên trước suýt mất dữ
   liệu vì server cũ của chủ repo còn sống khi bắt đầu test.

---

## 7. D2.1 — phiên làm thêm (chưa commit)

Chủ repo yêu cầu 6 việc. **Cả 6 đã xong.** Chưa commit, cây làm việc đang có thay đổi.

## 7.1 Các việc và cách giải quyết

| # | Yêu cầu | Đã làm |
|---|---|---|
| 1 | Thêm PowerShell vào `.claude/settings.json` | Tạo mới `.claude/settings.json` (trước chỉ có `settings.local.json`) với `PowerShell(*)`. Cần thật: bẫy §6 #1 nói Claude CLI thoát 1 khi spawn từ tool Bash |
| 2 | Kiểm thử phải tốn ít token nhất | **Chế độ tiết kiệm bị ép bật** ở mức rẻ nhất trong suốt giai đoạn phát triển. §7.3 |
| 3 | `stale-demo` thành dữ liệu seed tự khởi tạo | `fixtures/demo-project/` (file thuần trong source) → boot copy sang `<dataDir>/demo/stale-demo`. §7.4 |
| 4 | Đánh dấu `stale-demo` cho khác project thật · sắp xuống cuối sidebar kèm divider | Nhãn `mẫu` + tooltip giải thích + đường phân cách. §7.5 |
| 5 | Ca 11 lỗi mà không có log để xem/tải | Log ghi ra đĩa ngay khi phát sinh + lý do khi bị ngắt. §7.2 |
| 6 | Xem trực tiếp Claude đang làm gì | Tab **Console** + khung Hoạt động mở rộng được. §7.2 |
| 7 | Log lưu ở đâu nếu storage là postgres | Log là **tệp trên đĩa**, không vào DB. Và trên nhánh này `STORAGE_DRIVER=postgres` **không được đọc ở đâu cả**. §7.9 |
| 8 | Log bị xoá / ở máy khác thì hiện gì | Bốn trạng thái phân biệt được, có đóng dấu tên máy. §7.10 |
| 9 | Nơi lưu sẵn khi xuất tài liệu | Ba nút + thư mục con + ngày trong tên tệp + cảnh báo gitignore + nút mở thư mục. §7.11 |
| 10 | Bỏ nhãn "miễn phí · không tiêu token" | Chỉ hiện chi phí ở chỗ thật sự tiêu token. §7.12 |

### Đã bỏ theo yêu cầu

Bản D2.1 đầu tiên có một **cổng chặn**: chỉ `stale-demo` được chạy sinh tài liệu, project khác nhận
403, kèm biến `DOCGEN_ALLOW_ALL_PROJECTS` để mở lại. **Đã bỏ sạch** — chủ repo chốt là sẽ hoàn thiện
rồi ship nên không cần chặn.

Thứ giữ chi phí trong tầm kiểm soát bây giờ là **chế độ tiết kiệm bị ép bật** (§7.3), không phải một
danh sách trắng project. Đổi này tốt hơn ở chỗ: nó rẻ trên **mọi** project, kể cả repo thật, thay vì
chỉ rẻ vì không cho chạy.

## 7.2 Vì sao ca 11 không có log — và đã sửa thế nào

**Nguyên nhân gốc, gồm hai lỗi độc lập:**

1. `runner.js` **bóp mọi event xuống một dòng ≤ 400 ký tự** rồi bỏ phần còn lại. Tham số tool, toàn
   văn Claude nói, kết quả tool trả về, `stderr` — không có chỗ nào giữ. Riêng `stderr` chỉ được gom
   vào chuỗi lỗi khi CLI thoát ≠ 0, mà kill thì không thoát nên nó biến mất luôn.
2. Dòng duy nhất đó ghi vào `job.write.activity` — **một trường, bị dòng sau ghi đè dòng trước**.
   Nên `Run test · per-doc · kill` chỉ còn lại `"🔧 TodoWrite"`, đúng một dòng, và không có lịch sử.

Restart chỉ là *lúc* mất, không phải *lý do* mất — kể cả không restart thì cũng chỉ xem được một dòng.

**Đã sửa:**

```
server/docgen/runlog.js        MỚI — log JSONL append-only, một tệp một bộ tài liệu
  <dataDir>/docgen-work/<jobId>/run.log
  ghi bằng appendFileSync (đồng bộ, có chủ ý: mất log vì chết đúng lúc ghi chính là bug này)
  đọc lại được từ đĩa → SỐNG SÓT restart · tự rotate ở 24 MB · giữ 2000 dòng trong RAM cho realtime

server/runner.js               thêm cờ verbose (mặc định TẮT — index.js/bot.js không bị ảnh hưởng)
  tool_use   → detail = TOÀN BỘ tham số (lệnh Bash nguyên văn, đường dẫn, pattern…)
  text       → detail = toàn văn, không cắt 400
  tool_result→ kind mới: tool_result / tool_error — thứ cho biết VÌ SAO Claude bị vướng
  stderr     → phát realtime từng chunk, không đợi tới lúc thoát
  exit       → kèm mã thoát + stderr, kể cả khi = 0
  spawn      → dòng lệnh thật + toàn văn prompt đã gửi
  system     → model THẬT đã dùng, cwd, permissionMode
```

**Lý do khi bị ngắt.** Lúc boot, job đang `writing`/`surveying` vẫn về `error` như cũ, nhưng
`job.error` giờ có thêm:

- `why` — giải thích rằng CLI bị kill cùng tiến trình cha nên **không có** mã thoát hay stderr để báo
  (trả lời đúng câu hỏi "lý do cụ thể do claude code trả ra thì lại không có")
- `lastActivity` — dòng cuối agent kịp phát
- `trace` — 8 dòng cuối, hiện trong `<details>` ngay trong hộp đỏ

Kèm hai nút ngay tại hộp đỏ: **→ Mở Console** và **⬇ Tải log**.

**API mới:**

```
GET    /api/doc-jobs/:jid/log[?after=&limit=&session=&kind=&run=]
       kind=problem gom stderr + tool_error + exit + run-error — bộ lọc "chỉ chỗ vướng"
GET    /api/doc-jobs/:jid/log/download    → text/plain, attachment, detail thụt lề đọc bằng mắt được
DELETE /api/doc-jobs/:jid/log
WS     doc:log { entry }                  → Console cập nhật realtime
```

**UI mới:** `web/src/docs/RunConsole.jsx` — một component, hai kích thước:

- **tab Console** (cạnh Tiến độ / Xuất bản): lọc theo loại · lọc theo phiên · tìm trong log · khoá
  cuộn · tải log · xoá log. Bấm một dòng có `▸` để mở `detail`.
- **khung Hoạt động** ở cột nội dung: thay khung 9 dòng cũ, cùng nguồn dữ liệu, có `⛶` phình ra
  toàn màn hình.
- **màn dàn ý** cũng có Console (nút `▸ Console`), tự mở khi đang khảo sát — vì khảo sát chạy ở màn
  đó, không thể bắt người dùng sang màn tiến độ chưa tồn tại.

Chạy song song `per-doc`/`per-section` thì mỗi dòng mang nhãn phiên (`sad`, `sad §6.2`) nên lọc được
từng phiên riêng.

## 7.3 Chế độ tiết kiệm — đang bị ÉP BẬT

`server/docgen/economy.js`. **Một công tắc duy nhất cho cả giai đoạn phát triển:**

```js
export const DEV_LOCK_ECONOMY = true;
```

| Giá trị | Nghĩa |
|---|---|
| `true` *(hiện tại)* | Đang phát triển. Tiết kiệm **bị ép bật ở mức rẻ nhất**, người dùng **không tắt được** — kể cả gọi API. Phục vụ kiểm thử: mọi lượt chạy trong lúc còn issue mở đều phải rẻ |
| `false` | Xong hết issue, sắp ship. Tiết kiệm thành tuỳ chọn bình thường và **mặc định TẮT**, người dùng dùng thoải mái ở chất lượng đầy đủ |

**Xong hết issue thì đổi đúng dòng đó thành `false` — không phải sửa chỗ nào khác.**

Cấu hình bị ép (`CHEAPEST`):

| Nút | Khi bị ép | Siết gì | Đánh đổi |
|---|---|---|---|
| Ép model rẻ | **bật · haiku** | `--model` bỏ qua Cài đặt chung | Chất lượng văn |
| Giới hạn số mục/lượt | **bật · 1** | Một mục một lượt, phần còn lại giữ `pending` | Phải bấm Tiếp tục nhiều lần |
| Prompt rút gọn | **bật** | Còn **~33%** độ dài (đo được), bỏ văn phong + lược đồ 9 khối | Nội dung sơ hơn |
| Chặn khảo sát | **không bị ép** | `/survey` và `/plan/revise` → 403 | Dàn ý phải lấy từ preset |

`blockSurvey` **cố ý không bị ép**: nó *tắt tính năng* chứ không làm rẻ hơn, và luồng khảo sát vẫn
còn phải kiểm. Nó là nút duy nhất còn đổi được trong lúc bị khoá.

Thiết lập người dùng đã lưu **vẫn giữ nguyên** trong `docgen.json` — chỉ là không có hiệu lực. Lúc đổi
công tắc thành `false` thì thiết lập đó dùng lại được ngay, không mất.

Prompt rút gọn **vẫn giữ** hai thứ mà kiểm thử dựa vào: đường dẫn ghi tệp kết quả, và luật về nguồn
(ca 2 kiểm `sources`/`assumption`). Bỏ hai thứ đó là làm ca 2 vô nghĩa.

Mục bị hoãn do giới hạn **không phải lỗi**: job về `paused`, không phải `error` — trước đây `settle()`
coi mọi mục còn thiếu là lỗi nên một lượt tiết kiệm bình thường sẽ hiện hộp đỏ.

**Hai chỗ hiển thị** (chủ repo chốt "cả hai"). Đang bị ép thì cả hai đều **khoá ô tick và nói lý do**,
chứ không để bấm được rồi im lặng không có tác dụng:

- chip `🔒 Tiết kiệm khi test` trên thanh chạy của màn tiến độ và màn dàn ý, kèm `⚙` mở hộp chỉ-đọc
- mục `📚 Sinh tài liệu — tiết kiệm khi test` trong **⚙ Cài đặt** chung

Dự báo token trên các nút tự nhân theo hệ số của chế độ đang có hiệu lực, và `pending.sections` là
**số mục lượt tới thật sự viết** (đã cắt theo giới hạn), còn `pending.left` là tổng còn thiếu — nút
hiện `▶ Tiếp tục · 1 mục (còn 5 đợi lượt sau)`.

## 7.4 Project mẫu `stale-demo`

```text
agile-studio/fixtures/demo-project/     commit vào source, file THUẦN, không .git, không lồng repo
   README.md · package.json · src/reminders.js · src/notify.js · src/store.js
        │  boot copy nếu thiếu (không ghi đè tệp đã có)
        ▼
<dataDir>/demo/stale-demo/              bản chạy · repo_path của project trỏ vào đây
```

Vì sao copy chứ không trỏ thẳng vào `fixtures/`: agent chạy `--dangerously-skip-permissions` với
`cwd` = `repo_path`. Trỏ thẳng vào source nghĩa là một prompt hỏng có thể ghi vào cây làm việc của
chính Agile Studio.

`ensureDemoProject()` chạy lúc boot, tự lành cả ba tình huống:

1. chưa có project nào → tạo `stale-demo`
2. có nhưng `repo_path` đã chết → **trỏ lại** về `<dataDir>/demo/stale-demo`, giữ nguyên id nên mọi
   bộ tài liệu đã tạo vẫn còn chủ *(đã xảy ra thật: project id 4 của phiên trước trỏ vào thư mục temp
   đã bị dọn — bootstrap tự sửa)*
3. project mẫu chưa có bộ tài liệu nào → gọi `seedDocgen()` (chỉ khi trống trơn; đã có rồi thì không
   tự mọc lại, vì có thể người dùng xoá dữ liệu mẫu có chủ ý)

**Không có `git init`** — chủ repo chốt "bỏ ca 5 ở demo". Hệ quả đã lường trước: nút `↻ Tìm mục đã cũ`
trên project này sẽ báo *"Thư mục nguồn không phải repo git"*. **Đó là hành vi đúng, không phải lỗi.**
Ca 5 kiểm bằng repo git thật (đã đạt, §3).

`store.addProject()` giờ từ chối project mới **trùng tên** `stale-demo` hoặc **trùng đường dẫn**
`<dataDir>/demo/stale-demo` — trùng tên thì nhãn "mẫu" gắn sai cho một repo thật, trùng đường dẫn thì
lần boot sau bootstrap cướp mất project của người dùng. Thêm `store.setProjectPath()`.

## 7.5 Nhận dạng project mẫu trên sidebar

`stale-demo` là project kiểm thử của **cả Agile Studio**, không phải của người dùng — nên nó phải nhìn
ra ngay là khác. Ba dấu hiệu, không dùng màu lạ (màu lạ dễ bị đọc là "đang lỗi"):

| Ở đâu | Dấu hiệu |
|---|---|
| Sidebar | Luôn nằm **dưới cùng**, sau một **đường phân cách** mang chữ `PROJECT MẪU` |
| Tên project | Nhãn `mẫu` màu accent; tên hiển thị nhạt hơn khi chưa chọn |
| Tooltip | Giải thích nó là gì, nằm ở đâu, và **xoá nội dung trong đó thoải mái vì Studio dựng lại** |
| Thanh tiêu đề | Nhãn `mẫu` cạnh tên project đang mở |

Sắp thứ tự và gắn cờ ở `markAndSortProjects()` trong `server/docgen/demo.js`, gọi từ
`GET /api/projects`. Đặt ở tầng route chứ không trong `store.js`: thứ tự hiển thị là việc của tầng
trình bày, tầng lưu trữ không cần biết project nào là project mẫu.

Server trả thêm ba trường trên mỗi project mẫu: `demo: true`, `demoBadge`, `demoHint`. Sidebar chèn
đường phân cách trước phần tử `demo` đầu tiên, nên nếu sau này có nhiều project mẫu thì vẫn chỉ một
đường.

## 7.6 Kiểm thử D2.1 — 212/212 đạt, **0 token**

| Bộ | Số ca | Kiểm gì |
|---|---|---|
| `d21-modules.mjs` | 101 | economy: **ép bật thì gửi `on:false` cũng không mở được, nới từng nút cũng không lọt**, `blockSurvey` vẫn theo người dùng · runlog (ghi/lọc/**đọc lại từ đĩa sau restart**) · demo (dựng file/nhận diện/**đẩy xuống cuối + gắn nhãn**/không còn gate) · store (chặn trùng, không chặn oan) · prompt rút gọn còn 33% mà vẫn giữ luật về nguồn |
| `d21-http.mjs` | 74 | bootstrap project mẫu · **repo thật KHÔNG còn 403** · **API `on:false` không mở được khoá** · agent-settings patch một phần · estimate theo giới hạn · toàn bộ API log kể cả tải về · **ca 11: dựng job `writing` rồi nạp lại routes = restart, xác nhận có `why` + `lastActivity` + `trace` giữ được `TodoWrite`** |
| `d21-events.mjs` | 37 | Diễn giải stream-json thật của Claude bằng event ghi lại: lệnh Bash 400 ký tự không bị cắt trong `detail` · nội dung `Write` 9000 ký tự bị cắt sớm để không phình log · `tool_result` báo `EACCES` · `system` cho biết model thật · 7 ca event dị dạng không làm vỡ |

Ba tệp test đã đưa vào repo, chạy lại được bất cứ lúc nào, **không tiêu token**:

```bash
cd agile-studio
node tests/d21-modules.mjs      # 101 ca
node tests/d21-events.mjs       # 37 ca
node tests/d21-http.mjs         # 74 ca — mở server tạm ở cổng 4399, tự đóng
```

`d21-http.mjs` dùng cổng **4399** để không tranh chấp với server dev ở 4311. Nó vẫn đọc/ghi
`~/.agile-studio` thật (không có cách đổi dataDir trên nhánh này — `server/config.js` chưa tồn tại),
nên **tắt server dev trước khi chạy** thì an toàn nhất.

`npx vite build` sạch: **318.86 KB js · 57.65 KB css** (trước D2.1: 296.12 / 51.92).

**Đã KHÔNG chạy:** một lượt viết thật. Mọi yêu cầu đều kiểm được mà không tiêu token, và chủ repo đã
nói rõ không muốn tốn chi phí. Phần cần token còn lại ở §7.7.

**Dữ liệu:** đã backup `docgen.json.pre-d3` + `studio.json.pre-d3` trong `~/.agile-studio/` trước khi
test. `docgen.json` vẫn hợp lệ, 15 job như trước. `studio.json` chỉ còn id 1 (`test-monorepo-turborepo`)
và id 4 (`stale-demo`) — đúng như trước, project rác do test tạo đã dọn và test giờ tự dọn (§7.8 #5).

**Server dev của chủ repo (PID 53956 API + 34056 vite) KHÔNG bị kill** — kiểm thử chạy trên cổng 4399
riêng. Nhưng server đó **đang chạy mã cũ**: phải restart mới thấy D2.1.

## 7.7 Việc còn lại

**Không tốn token:**

1. `npm run dev` lại (bắt buộc — server đang chạy mã cũ). Boot sẽ in
   `[docgen] đã dựng repo mẫu…` / `đã tạo project mẫu…` nếu có việc phải làm.
2. Mở project `stale-demo` → tab 📚 Tài liệu → một bộ đã chốt dàn ý → **tab Console**. Bấm
   **⬇ Tải log** kiểm tệp `.log` mở được bằng Notepad.
3. Xác nhận sidebar: `stale-demo` nằm **dưới cùng**, sau đường phân cách `PROJECT MẪU`, có nhãn
   `mẫu`; hover thấy tooltip giải thích. Xác nhận chip tiết kiệm hiện `🔒` và **không tick/bỏ tick được**.
4. **Ca 10 · ca 13 nửa giao diện · ca 3 mở bằng Word thật** — vẫn còn nguyên từ §4 Nhóm A, chưa
   chạy. *(Hồi quy D1 thì xong rồi — §9.4.)*

**Tốn token — giờ rẻ hơn nhiều so với §4 (giá ở đó là khi TẮT tiết kiệm):**

| Ca | Cách chạy | Chi phí |
|---|---|---|
| **11** restart giữa lúc viết | Trên `stale-demo`, tiết kiệm đang bị ép (**1 mục** · haiku · prompt rút gọn). Bấm ▶, chờ ~20s, tắt server, bật lại. Kiểm: hộp đỏ có `why` + dòng cuối + `trace`; tab Console còn nguyên mọi dòng trước khi tắt | 1 mục trên repo 3 tệp bằng haiku — rẻ nhất có thể |
| **4** nhánh sau | Mục đã `edited` → `↺ Bỏ đánh dấu` → `▶ Viết lại mục này` | 1 mục |
| **12** so 3 cách chạy | 3 lượt trên **cùng dàn ý, cùng repo** `stale-demo`. Giới hạn 1 mục/lượt đang bị **ép** nên so không có nghĩa — phải tạm đổi `DEV_LOCK_ECONOMY` thành `false` rồi tự tắt `capSections`, giữ haiku | 3 lượt nhỏ |
| **1** đủ 12 mục | Cũng cần tạm mở khoá như trên để bỏ giới hạn 1 mục/lượt | 1 lượt 12 mục |
| **9** đổi account khi hết quota | **Vẫn cần account thứ hai.** Máy chỉ có một | — |

## 7.8 Bẫy mới dò ra ở D2.1

1. **`verbose` phải mặc định TẮT.** `index.js` và `bot.js` dùng chung `runClaude` và chỉ đọc
   `d.text`; bật mặc định là các kind mới (`stderr`, `exit`, `tool_result`) nhảy vào dòng activity
   của node role.
2. **Giới hạn số mục phải áp trong `claim()`, sau khi đã biết mục nào còn thiếu** — và **chỉ xoá tệp
   cũ của mục thật sự chạy lượt này**. Xoá cả phần bị hoãn là mất kết quả của mục `stale` đang chờ
   viết lại.
3. **Đừng nối một câu qua hai phần tử mảng rồi `join("\n")`** — câu trong log bị ngắt giữa dòng.
   Đã mắc một lần ở dòng giải thích của ca 11.
4. **Đổi chế độ tiết kiệm phải làm dự báo token tính lại.** Nếu không, nút vẫn hiện số cũ cho tới lần
   tải màn sau, và hộp hỏi ngưỡng token sẽ cảnh báo về một chi phí không còn đúng. `DocProgress` gọi
   lại `/estimate` khi `settings.economy` đổi.
5. **Test tạo project là ghi thật vào `studio.json`.** Nhánh "không chặn oan" của `addProject` chạy
   **thành công** nên nó tạo project thật — mắc hai lần liền, mỗi lần để lại một project rác. `store`
   không có `deleteProject`, nên `t-modules.mjs` giờ tự sửa `studio.json` để dọn ngay sau khi kiểm.
6. **`economy` có hai hình dạng, đừng suy `notes` ở client.** Đã sửa: `/api/agent-settings` (cả GET
   lẫn PUT) trả kèm `notes` đã tính, giống `/ir` và `/estimate`. Thêm một nút tiết kiệm chỉ phải sửa
   `economyOf()` trong `server/docgen/economy.js`.
7. **Ép cấu hình phải ép ở tầng `economyOf()`, không phải ở UI.** Nếu chỉ khoá ô tick trên màn hình
   thì `PUT /api/agent-settings { economy: { on: false } }` vẫn mở được — cái ép chỉ còn là trang trí.
   Có một ca test riêng cho đúng chuyện này (`d21-http.mjs`: "API `on:false` không mở được khoá").
8. **`DialogButtons` trước đây luôn vẽ nút OK.** Hộp thoại chỉ-đọc cần bỏ `onOk` để chỉ còn nút
   "Đóng" — một nút "Đồng ý" chẳng làm gì thì tệ hơn không có.

## 7.9 Log lưu ở đâu — và `STORAGE_DRIVER=postgres` thì sao

**Câu trả lời ngắn: log là một TỆP trên đĩa, không nằm trong cơ sở dữ liệu, và sẽ không đổi kể cả khi
postgres được dùng thật.**

```text
<dataDir>/docgen-work/<jobId>/run.log        ← log phiên agent, JSONL, append-only
<dataDir>/docgen-work/<jobId>/run.log.1      ← bản trước đó, sau khi rotate ở 24 MB
<dataDir>/docgen-work/<jobId>/ir/<doc>/<num>.json   ← tệp kết quả agent ghi ra
```

Trên máy này `<dataDir>` là `C:\Users\PC\.agile-studio`. Đường dẫn thật hiện ngay trong tab Console
(dòng trạng thái dưới cùng, và phần chữ khi log còn rỗng) nên không phải đi tra.

### Vì sao là tệp, không phải một bảng trong DB

| Lý do | Cụ thể |
|---|---|
| Kích thước | Một lượt viết sinh hàng nghìn dòng, mỗi dòng có `detail` tới 8 KB. Rotate ở **24 MB**. Đây là dữ liệu chỉ-thêm và to — sai hình dạng cho một bảng trạng thái |
| Sống sót lúc chết | Ghi bằng `appendFileSync` **đồng bộ**, một dòng một lần. Mất log vì tiến trình chết đúng lúc ghi chính là bug của ca 11; một transaction chưa commit sẽ mất đúng như vậy |
| Không làm phình state | `docgen.json` được ghi lại **toàn bộ** mỗi lần persist. Trộn log vào đó là mỗi dòng log kéo theo một lần ghi cả tệp state |

Nếu sau này storage chuyển sang postgres thì `docgen.json` (job · dàn ý · IR · export) thành bảng,
còn `run.log` **vẫn là tệp** — cùng lý do người ta không đút log ứng dụng vào DB.

### Còn `STORAGE_DRIVER=postgres` trong `agile-studio/.env`?

**Trên nhánh này nó không có tác dụng gì cả.** Đã kiểm: `STORAGE_DRIVER` và `DATABASE_URL` **không
được đọc ở bất kỳ đâu** trong `server/`. Thực tế cả tệp `.env` đang không được nạp — không có `dotenv`,
và `SERVER_PORT` cũng bị bỏ qua (`server/index.js` hardcode `const PORT = 4311`).

Toàn bộ dữ liệu đang nằm ở JSON trong `<dataDir>`:

| Tệp | Nội dung | Ai ghi |
|---|---|---|
| `studio.json` | project · requirement · session · schedule · cài đặt chung | `server/store.js` |
| `docgen.json` | bộ tài liệu · dàn ý · IR · lịch sử xuất · cài đặt agent | `server/store/docgen.js` |
| `docgen-work/<jobId>/run.log` | log phiên agent | `server/docgen/runlog.js` |

`server/store/docgen.js` có ghi rõ lý do ở đầu tệp: nhánh docgen nhắm vào `main`, nơi storage còn là
một tệp JSON, còn bản storage cắm-thay-được thì **vẫn đang review**. Khi bản đó vào, chỉ cặp
đọc/ghi trong `store/docgen.js` bị thay bằng adapter — API giữ nguyên.

> Nếu `.env` đang khiến bạn tưởng app chạy trên postgres thì đó là một cái bẫy thật, và nó **không
> phải** do D2/D2.1 gây ra — `.env` là tệp untracked có từ trước. Nên xoá hai dòng
> `STORAGE_DRIVER`/`DATABASE_URL` khỏi đó, hoặc nạp `.env` cho tử tế, ở một issue riêng.

## 7.10 Log không có ở máy này thì hiện gì

Đây là hệ quả trực tiếp của §7.9: **nhánh `local-work` lưu dữ liệu vào database, nhưng log là tệp cục
bộ nên nó KHÔNG đi theo DB.** Mở một bộ tài liệu ở máy B trong khi nó chạy ở máy A thì máy B không có
tệp log. Trước D2.1 bản này, cả ba tình huống đó đều ra đúng một câu *"Chưa có log cho bộ tài liệu
này"* — sai, và làm người dùng tưởng tính năng hỏng.

Giờ mỗi lượt chạy **đóng dấu tên máy** vào job (`job.write.logHost`, `job.survey.logHost`) cùng đường
dẫn tệp. `runlog.logState()` ghép ba dữ kiện — *job đã từng chạy chưa*, *tệp có tồn tại không*, *lượt
đó chạy ở máy nào* — thành bốn trạng thái phân biệt được:

| state | Khi nào | Hiện gì |
|---|---|---|
| `never` | Job chưa chạy lượt nào | *"Chưa có log. Log được ghi từ lúc bấm Khảo sát hoặc Bắt đầu viết."* Kèm đường dẫn tệp và câu nhắc nó **không** đi theo sang máy khác. **Không** phải cảnh báo |
| `ok` | Có tệp, đọc được | Log bình thường |
| `other-host` | Đã chạy, không có tệp, `logHost` ≠ máy này | 🖥 *"Log của lượt chạy này nằm ở máy khác"* — nêu **tên cả hai máy**, đường dẫn ở máy kia, và nói rõ log là tệp trên đĩa nên không đi theo cơ sở dữ liệu. Nhắc thêm: bộ tài liệu / dàn ý / nội dung thì vẫn đủ ở đây |
| `missing` | Đã chạy, không có tệp, cùng máy | 📄 *"Không còn tệp log"* — thường do xoá `docgen-work` hoặc đổi `dataDir`. Nhắc rằng nội dung đã viết vẫn còn |
| `unreadable` | Có tệp mà mở không được | 🔒 quyền truy cập hoặc tệp bị khoá, kèm đường dẫn |

Hai điểm cố ý:

- **`⬇ Tải log` bị mờ** khi `state ≠ ok`, và `GET /log/download` trả **404 kèm đúng câu giải thích đó**
  thay vì gửi một tệp rỗng. Gửi tệp rỗng là tệ hơn báo lỗi: người dùng mở ra thấy trắng và không biết
  vì sao.
- **Câu giải thích viết ở server** (`logStateMessage()`), dùng chung cho cả màn hình lẫn body của 404,
  nên hai nơi không thể lệch nhau.

Job tạo trước D2.1 không có `logHost` → rơi vào `missing` thay vì `other-host`. Đúng hơn là khẳng định
sai về một cái máy nào đó.

## 7.11 Nơi lưu khi xuất tài liệu

`server/docgen/dests.js`. Trước đó hộp Xuất bắt lội hộp thoại native mỗi lần, hoặc tự gõ đường dẫn.

**Hai nút bấm một cái là xong** (đường dẫn do server dò nên đúng theo từng máy và từng OS):

| Nút | Đường dẫn | Ghi chú |
|---|---|---|
| Trong repo agile-studio | `agile-studio/exports/` | **Mặc định.** Đã thêm vào `.gitignore`. Mở bằng IDE ngay được |
| Tải xuống | `~/Downloads` *(dò cả tên đã bản địa hoá)* | Chỗ ai cũng biết tìm |

> **Sửa ở phiên D3 (§9.1):** nút thứ ba **"Thư mục dữ liệu Studio"** (`<dataDir>/exports/`) **đã bị bỏ**
> theo yêu cầu của chủ repo. `DEST_DATA` vẫn còn export trong `dests.js` vì bài test dùng nó làm một
> đường dẫn chắc chắn nằm ngoài repo git — nó chỉ không còn là một nút gợi ý.

Nút chỉ là gợi ý — vẫn gõ tay hoặc bấm **Chọn…** được như trước. Lần sau mở lại thì nhớ chỗ dùng gần
nhất **của bộ đó**, rồi mới đến chỗ dùng gần nhất nói chung, rồi mới đến mặc định.

**Bốn cải tiến kèm theo:**

1. **Thư mục con theo project và bộ tài liệu** — `<đích>/<project>/<tên bộ>/`. Sáu tệp của một bộ đổ
   chung một chỗ với bộ khác thì lần thứ hai là lẫn hết. Tắt được. Tên project/bộ đi qua `safeSeg()`
   vì tên do người dùng đặt có thể chứa `:` `/` `?` — Windows từ chối thẳng; chữ có dấu thì giữ nguyên.
2. **Ngày trong tên tệp** — `… v1.0 2026-07-31.docx`. Không ghi đè bản cũ, giữ lịch sử để so. Tắt được.
3. **Cảnh báo khi thư mục đích chưa được gitignore** — hiện trong hộp thoại *trước* khi bấm, và lưu
   vào lịch sử xuất *sau* khi ghi. Cảnh báo, **không chặn**: có người cố ý muốn commit tài liệu cùng mã.
4. **Nút 📂 Mở thư mục** — trong toast sau khi xuất, và trên từng dòng lịch sử xuất. Mở **thư mục**,
   không mở tệp: mở `.docx` là chạy Word, đó không phải việc một nút "mở thư mục" được phép làm.

**Đường dẫn cuối cùng hiện ngay trong hộp thoại** trước khi bấm Xuất, vì với thư mục con thì chỗ tệp
nằm không còn là chỗ vừa chọn.

### Bẫy: `git check-ignore` và thư mục chưa tồn tại

Mẫu `exports/` (có gạch chéo cuối) chỉ khớp **thư mục**. `git check-ignore exports` trả "không ignore"
khi thư mục **chưa tồn tại** — git không có cách biết nó là thư mục. Mà hộp Xuất kiểm *trước* khi tạo
thư mục, nên đúng lúc cần nhất thì câu trả lời sai.

Cách sửa: hỏi git về một **đường dẫn con** (`<dir>/.agile-studio-probe`). Tệp nằm trong thư mục bị
ignore thì cũng bị ignore, và câu hỏi đó git trả lời đúng dù đường dẫn có tồn tại hay không. Có test
cho cả hai chiều (đã ignore / chưa ignore).

Vẫn dùng `git check-ignore` chứ không tự đọc `.gitignore` rồi so chuỗi: nó tính cả `.gitignore` lồng
nhau, `.git/info/exclude` và `core.excludesFile`. Ở repo này mẫu nằm trong `agile-studio/.gitignore`
(lồng một cấp) — tự so chuỗi là sai ngay ca đầu tiên.

## 7.12 Bỏ nhãn "miễn phí · không tiêu token"

Chỉ hiện chi phí **ở chỗ thật sự tiêu token**. Dán nhãn "miễn phí" lên mọi hành động không gọi model
làm loãng, và làm cái nhãn có token mất trọng lượng.

Đã bỏ: nhãn ở chân hộp Xuất · nhãn cạnh nút `↻ Tìm mục đã cũ` · nhãn ở tab Xuất bản · biến thể
`free` của `TokenChip` (giờ không còn ai dùng) · CSS `.tok.free` · ba tooltip *"— không tiêu token"*.

**Giữ lại** hai câu trong hộp duyệt dàn ý (`⛽ ~X token là chi phí của bước viết sau này — chốt dàn ý
không tiêu token nào`): việc của chúng là nói **chi phí nằm ở đâu**, không phải trấn an rằng cái này
miễn phí.

---

## 8. BẮT ĐẦU PHIÊN MỚI TỪ ĐÂY

## 8.1 Ba lệnh đầu tiên

```bash
cd e:/gits/agile-studio/agile-studio

npm run dev                  # BẮT BUỘC — server đang chạy có thể là mã cũ
node tests/d3-router.mjs && node tests/d3-regress-d1.mjs && node tests/d21-modules.mjs \
  && node tests/d21-events.mjs && node tests/d21-http.mjs
                             # phải ra 55 + 70 + 102 + 37 + 75 = 339 đạt · 0 lỗi · 0 token
                             # (212 → 339 sau phiên D3, xem §9)
npx vite build --config web/vite.config.js
                             # phải sạch: ~322.63 KB js · ~57.84 KB css
```

`tests/d21-http.mjs` mở server tạm ở cổng **4399** nên không tranh chấp với `npm run dev` ở 4311.
Nhưng nó vẫn đọc/ghi `~/.agile-studio` thật, nên **tắt dev server trước khi chạy test** thì an toàn nhất.

## 8.2 Trạng thái git — ~~chưa commit gì của D2.1~~ ĐÃ CŨ

> **Mục này nói về lúc bắt đầu phiên D3.** Từ đó tới giờ D2.1 và cả ba việc của D3 **đều đã commit**
> — bảng commit ở **§9**. Giữ lại nguyên văn để đối chiếu danh sách tệp.

| Việc | Trạng thái |
|---|---|
| Nhánh | `feat/docgen-d2` · commit cuối `d52c46a` (phần D2 gốc) |
| D2.1 | **Toàn bộ chưa commit.** 14 tệp sửa + 8 tệp/thư mục mới |
| Push · issue · PR · merge | **Chưa làm gì cả** |
| Stash của chủ repo | Vẫn còn: `git stash list` → `park owner docs edits` |
| Backup dữ liệu | `~/.agile-studio/{docgen,studio}.json.pre-d3` (chụp trước khi test D2.1) |

Tệp/thư mục **mới** của D2.1 (đang untracked):

```text
agile-studio/fixtures/demo-project/          repo mẫu, file thuần
agile-studio/tests/d21-*.mjs                 3 bộ test, 212 ca, 0 token
agile-studio/server/docgen/runlog.js         log phiên agent ra đĩa
agile-studio/server/docgen/economy.js        chế độ tiết kiệm + công tắc DEV_LOCK_ECONOMY
agile-studio/server/docgen/demo.js           dựng project mẫu + nhận dạng + sắp sidebar
agile-studio/server/docgen/dests.js          nơi lưu khi xuất + kiểm gitignore
agile-studio/web/src/docs/RunConsole.jsx     tab Console + khung Hoạt động
agile-studio/web/src/docs/EconomyChip.jsx    chip + hộp cấu hình tiết kiệm
.claude/settings.json                        quyền PowerShell
```

Tệp **sửa**: `server/{index,runner,store}.js` · `server/store/docgen.js` ·
`server/routes/docgen.js` · `server/docgen/{write,survey}.js` ·
`web/src/{App,SettingsModal,styles.css}` · `web/src/docs/{DocJobs,DocOutline,DocProgress,ExportDialog,Dialog,SectionEditor,TokenConfirm,docgen.css}` ·
`agile-studio/.gitignore`.

## 8.3 Hai công tắc phải nhớ

| Công tắc | Ở đâu | Bây giờ | Khi nào đổi |
|---|---|---|---|
| `DEV_LOCK_ECONOMY` | `server/docgen/economy.js` | `true` — ép haiku + 1 mục/lượt + prompt rút gọn, **không tắt được** | Đổi thành `false` **khi xong hết issue**. Lúc đó tiết kiệm thành tuỳ chọn và mặc định tắt |
| `exports/` | `agile-studio/.gitignore` | đã thêm | Đừng bỏ — tệp `.docx` là binary hàng MB |

## 8.4 Việc còn lại, theo thứ tự nên làm

### A · Không tốn token — làm trước, chỉ cần mắt

1. **Nhìn sidebar**: `stale-demo` phải nằm dưới cùng, sau đường phân cách `PROJECT MẪU`, có nhãn `mẫu`,
   hover ra tooltip. Mở nó → thanh tiêu đề cũng có nhãn `mẫu`.
2. **Chip tiết kiệm** phải hiện `🔒`, tick vào **không có tác dụng**, bấm `⚙` ra hộp chỉ-đọc kèm lý do.
   Mở `⚙ Cài đặt` chung → mục `📚 Sinh tài liệu` cũng khoá y vậy.
3. **Tab Console** trên một bộ đã chốt dàn ý. Chưa chạy lần nào thì phải nói "chưa có log" **kèm đường
   dẫn tệp**, không phải cảnh báo đỏ.
4. **Hộp Xuất**: ba nút nơi lưu, nút "Trong repo agile-studio" phải có nhãn xanh `đã gitignore`. Bấm
   thử nút "Chọn…" rồi trỏ vào `agile-studio/server` → phải hiện **cảnh báo đỏ chưa gitignore**. Xem
   dòng "Tệp sẽ nằm ở:" đổi theo ô "Tạo thư mục con".
5. **Xuất thật một bộ** (miễn phí, chỉ chạy Python) → kiểm thư mục con `<project>/<bộ>/`, tên tệp có
   ngày, nút `📂 Mở thư mục` trong toast và trong lịch sử xuất.
6. **Ca 10 · ca 13 nửa giao diện · ca 3 mở bằng Word thật** — còn nguyên từ §4 Nhóm A. Cả ba đều
   **phải nhìn bằng mắt**, không tự động hoá được.
   *(Hồi quy D1 đã tách ra khỏi danh sách này — xem §9.4.)*

### B · Tốn token — rẻ vì đang bị ép tiết kiệm

| Ca | Cách chạy | Chi phí |
|---|---|---|
| **11** restart giữa lúc viết | Trên `stale-demo`. Bấm ▶ (1 mục · haiku · prompt rút gọn), chờ ~20s, tắt server, bật lại. Kiểm hộp đỏ có `why` + dòng cuối + `trace`, và tab Console còn nguyên mọi dòng | 1 mục trên repo 3 tệp |
| **4** nhánh sau | Mục `edited` → `↺ Bỏ đánh dấu` → `▶ Viết lại mục này` | 1 mục |
| **1** và **12** | Cần bỏ giới hạn 1 mục/lượt → phải tạm đổi `DEV_LOCK_ECONOMY` thành `false` | vài lượt |
| **9** đổi account khi hết quota | **Vẫn cần account thứ hai.** Máy chỉ có một | — |

### C · Nợ đã biết, chưa làm

| Nợ | Ghi ở |
|---|---|
| Màn sửa glossary (RULESET N5) | §2, "Glossary" |
| Watermark chéo trang cho bản nháp | §2, "Đóng dấu bản nháp" |
| Tab Chấm điểm (D6) · Lỗi thuật ngữ (D7) | §2, "Tab của màn tiến độ" |
| `.env` có `STORAGE_DRIVER`/`DATABASE_URL` mà **không ai đọc** — dễ tưởng đang chạy postgres | §7.9. Nên xử ở issue riêng |
| Ca 5 (tìm mục đã cũ) không chạy được trên project mẫu vì cố ý không `git init` | §7.4 |

## 8.5 Đừng dò lại — bẫy đã biết

§6 (bẫy của D2) và §7.8 (bẫy của D2.1) là hai danh sách đó. Ba cái đắt nhất:

1. **Đừng chạy hai server trên cùng `docgen.json`** (§6 #6) — mất dữ liệu.
2. **Đừng khởi động server từ tool Bash** (§6 #1) — Claude CLI thoát 1 ngay. PowerShell thì bình thường.
3. **Ép cấu hình phải ép ở tầng server, không phải ở UI** (§7.8 #7) — khoá ô tick mà API vẫn nới được
   thì cái ép chỉ là trang trí.

---

## 9. Phiên D3 — chủ repo giao thêm

> ⚠ **"Phiên D3" ≠ issue D3.** Tên trùng nhau nhưng không liên quan. Issue **D3 — Cài đặt & tiện ích**
> (modal kiểu claude.ai, tự dò/cài Python·Word·Vale·Graphviz) **CHƯA làm gì cả**. Đây chỉ là *phiên
> làm việc thứ ba*. Xem §10.3 trước khi mở PR cho bất cứ issue nào.

**Năm việc, đã làm xong và đã commit cả năm.** Bốn việc chủ repo giao (§9.1–§9.3, §9.5) cộng một
việc lấy từ danh sách nợ của chính bản bàn giao này (§9.4). **Không tiêu một token nào.**

### Trạng thái git — lần đầu có commit kể từ `d52c46a`

| Commit | Nội dung |
|---|---|
| `5c042f9` | **D2.1** — toàn bộ phần treo từ phiên trước (log · tiết kiệm · project mẫu · nơi lưu) |
| `db60989` | §9.1 — bỏ nút "Thư mục dữ liệu Studio" |
| `693f89d` | §9.2 — dời nút `＋ Chạy feature` khỏi topbar |
| `344b4f8` | §9.3 — route theo hash + sửa bug đổi project |
| `fd2c49b` | §9.4 — hồi quy D1 thành bộ test tự động |
| `88ec188` | §9.5 — nút mở thư mục nói ra kết quả + nút chép đường dẫn |

Vẫn **chưa** push · **chưa** issue · **chưa** PR · **chưa** merge vào `personal/local-work`.
Stash `park owner docs edits` của chủ repo vẫn còn nguyên.

**Cố ý không commit:** `agile-studio/.env` (untracked và **không** được `.gitignore` — nên `git add -A`
là commit nhầm nó, xem §7.9), `.claude/settings.local.json`, và `docs/issues/` (chủ repo đang có
sửa đổi trong stash ở đó).

### Kiểm thử — 344 ca, 0 lỗi, 0 token

```text
node tests/d3-router.mjs        55 đạt   ← MỚI
node tests/d3-regress-d1.mjs    70 đạt   ← MỚI · hồi quy D1, xem §9.4
node tests/d21-modules.mjs     105 đạt
node tests/d21-events.mjs       37 đạt
node tests/d21-http.mjs         77 đạt
npx vite build                 323.85 KB js · 57.89 KB css (từ 318.86 / 57.65)
```

> ⚠ `d21-http.mjs` đã chạy **khi server dev của chủ repo còn sống** (cổng riêng 4399, nhưng vẫn
> ghi chung `~/.agile-studio` — đúng cái §6 #6 dặn tránh). Đã backup trước và **kiểm lại sau**:
> `docgen.json` vẫn 15 job / 13 plan, `studio.json` vẫn 2 project — **không mất gì**. Backup ở
> `~/.agile-studio/{docgen,studio}.json.pre-d3-router`. Lần sau tắt server dev trước cho chắc.

Ba module mới của D3 đã được vite dev (đang chạy) transform sạch, nên phần **web** của server dev
đã là mã mới. Nhưng §9.1 sửa ở **server** — chỗ đó vẫn là mã cũ cho tới khi `npm run dev` lại.

## 9.1 ĐÃ LÀM — bỏ nút "Thư mục dữ liệu Studio" ở hộp Xuất

Yêu cầu: nơi lưu khi xuất bỏ nút `Thư mục dữ liệu Studio`.

| Tệp | Đổi gì |
|---|---|
| `server/docgen/dests.js` | Bỏ mục `{ id: "data" }` khỏi `destCandidates()`. **Giữ** hằng `DEST_DATA` — bài test dùng nó làm một đường dẫn chắc chắn *ngoài* repo git để kiểm nhánh "không cảnh báo gitignore" |
| `tests/d21-modules.mjs` | `3 nơi lưu` → `2`, thêm ca khẳng định **không còn** `id === "data"`. Ca `ensureDir` đổi sang thư mục thăm dò rồi tự xoá — trước đó nó tạo `<dataDir>/exports/` mà giờ chẳng ai dùng nữa |
| `tests/d21-http.mjs` | `GET /api/doc-dests` trả `3` → `2`, thêm ca khẳng định không còn `data` |

`web/src/docs/ExportDialog.jsx` **không phải sửa**: danh sách nút vẽ từ `/api/doc-dests`, client
không hardcode nơi nào cả. Đó là lý do đổi một chỗ ở server là xong.

Kiểm lại sau khi sửa:

```text
node tests/d21-modules.mjs   102 đạt · 0 lỗi   (101 → 102)
node tests/d21-events.mjs     37 đạt · 0 lỗi
node tests/d21-http.mjs       75 đạt · 0 lỗi   (74 → 75)
npx vite build               318.86 KB js · 57.65 KB css — không đổi (chỉ sửa server)
```

**Còn phải nhìn bằng mắt:** mở hộp Xuất, xác nhận chỉ còn **hai** nút và nút "Trong repo
agile-studio" vẫn là nút được chọn sẵn.

## 9.2 ĐÃ LÀM — nút `＋ Chạy feature` làm thanh nav nhảy chiều cao

*Commit `693f89d` · `web/src/App.jsx` + `web/src/styles.css`*

### Hiện tượng

Bấm sang tab **Sessions**, cả thanh `.topbar` cao thêm vài pixel và mọi thứ bên phải (nút `⚙`, tên
project) dịch sang ngang. Bấm sang tab khác thì tụt lại. Thanh nav nháy mỗi lần đổi tab.

### Vì sao

Hai nguyên nhân độc lập, phải sửa cả hai mới hết nháy:

| # | Nguyên nhân | Chứng cứ |
|---|---|---|
| 1 | Nút **chỉ tồn tại** ở tab `flow`. Nó vào/ra khỏi luồng flex nên chiều cao hàng và vị trí các phần tử sau nó đều đổi | `web/src/App.jsx:203-208` — `{tab === "flow" && (…)}` |
| 2 | Nút **cao hơn nút tab 2px**. `.new-run` có `padding:8px 16px` và **không viền**; `.tabs button` có `padding:6px 14px` **cộng viền 1px** → 16 vs 14. `.topbar` là `align-items:center` nên phần tử cao nhất quyết định chiều cao hàng | `web/src/styles.css:133` vs `:81` |

Chỉ sửa padding (#2) thì hết nhảy chiều cao nhưng vẫn còn dịch ngang khi nút xuất hiện (#1).

### Cách sửa — theo mũi tên xanh trong ảnh: **dời nút xuống vùng nội dung**

Đây cũng là **cách các tab khác đang làm**, nên sửa xong là bốn tab thống nhất một kiểu:

| Tab | Nút chính nằm ở đâu hiện nay |
|---|---|
| 📚 Tài liệu | `＋ Bộ tài liệu mới` — trong vùng nội dung (`web/src/docs/DocJobs.jsx:119`) |
| Requirement | ô thêm + nút `Thêm` — trong vùng nội dung (`web/src/Requirements.jsx`, khối `.req-add`) |
| ⏰ Lịch | biểu mẫu tạo lịch — trong vùng nội dung |
| **Sessions** | **`＋ Chạy feature` — trên topbar** ← chỉ mình nó khác |

Chủ repo chốt **chỉ sửa tab Sessions** cho khớp ba tab kia, không dựng component `PanelHead` dùng
chung cho cả 5 tab — đổi 6 tệp để làm xê dịch layout của những tab đang chạy ổn là không đáng.

### Đã làm

1. Bỏ khối `{tab === "flow" && …}` khỏi `<header className="topbar">`, thay bằng một chú thích ghi
   rõ vì sao chỗ này **không được** có phần tử phụ thuộc tab.
2. `＋ Chạy feature` + badge `▶ N đang chạy` chuyển xuống `div.panel-head` ở đầu `.sessions-view`.
3. Thêm `.panel-head` / `.panel-h1` / `.panel-sub` / `.panel-spacer` vào `styles.css`, **cùng khuôn**
   với `.dg-head` của `docgen.css` (tiêu đề · phụ đề · spacer · nút chính bên phải).

Đã cân nhắc rồi bỏ: đặt `min-height` cố định cho `.topbar` làm chốt chặn thứ hai. Con số đó phải
đoán (13px mono → hàng ~30px → thanh ~58px), đoán trượt là đổi luôn diện mạo hiện tại. Thứ thật sự
giữ chiều cao đứng yên là **không còn phần tử nào phụ thuộc `tab`**, không phải một con số.

### Còn phải nhìn bằng mắt

- Bấm qua lại đủ 5 tab: chiều cao `.topbar` không đổi, `⚙` và tên project đứng yên.
- Câu rỗng *"Chưa có session nào. Bấm **＋ Chạy feature**…"* giờ nằm ngay dưới chính cái nút đó.
- Badge `▶ N đang chạy` hiện cạnh nút khi có session đang chạy.

## 9.3 ĐÃ LÀM — route thật cho từng tab/màn, và bug đổi project mà nội dung không đổi

*Commit `344b4f8` · MỚI `web/src/router.js` + `tests/d3-router.mjs` · sửa `App.jsx`, `docs/DocJobs.jsx`*

### Hai vấn đề, cùng một gốc: **app không có route nào cả**

Trước khi sửa, mọi màn hình là `useState` trong `App.jsx` và `DocJobs.jsx`. Hệ quả:

| Triệu chứng | Gốc |
|---|---|
| **Bug:** bấm sang project khác trên sidebar, nội dung bên phải vẫn là của project cũ | `web/src/docs/DocJobs.jsx:34` — `view` (`list`/`wizard`/`outline`/`progress` + `jobId`) **không reset khi `project.id` đổi**. Component không remount (cùng kiểu, cùng vị trí trong cây) nên `view` sống sót. Đang xem dàn ý bộ `dj7x` của project A, bấm sang B → vẫn là dàn ý của A. `loadJobs` *có* chạy lại (dep `project.id`, dòng 44) nhưng danh sách mới đó không ai hiển thị vì đang ở màn `outline` |
| F5 là mất chỗ, quay về màn trống | Không có gì ghi trạng thái ra URL |
| Không gửi link cho ai được, nút Back của trình duyệt vô dụng | Như trên |

### Bốn quyết định chủ repo đã chốt

| Câu hỏi | Chốt | Hệ quả |
|---|---|---|
| Kiểu URL | **Hash, tự viết, không thêm thư viện** | ~80 dòng đọc/ghi `location.hash` + `popstate`. Không đụng `vite.config.js`, không cần history-fallback lúc serve tĩnh |
| Định danh | **`<id>-<slug>`, chỉ `id` có nghĩa** | Đổi tên project/bộ tài liệu thì link cũ **vẫn chạy**, app tự viết lại URL cho đúng tên mới. Không phải thêm cột dữ liệu nào |
| Độ sâu | **Tab + project**, và **màn con của tab Tài liệu** | Sub-tab (Tiến độ/Xuất bản/Console), session đang chọn, mục đang mở, hộp thoại — **ngoài phạm vi** issue này |
| Đổi project | **Giữ tab, về màn danh sách** | Đang ở tab Tài liệu của A → sang B vẫn ở tab Tài liệu, nhưng là **danh sách bộ tài liệu của B**. Không bao giờ hiện dữ liệu project cũ |

### Bộ URL

```text
#/                                          chưa chọn project
#/p/3-onegate/sessions                      tab Sessions
#/p/3-onegate/req                           tab Requirement
#/p/3-onegate/agile                         tab Agile
#/p/3-onegate/docs                          tab 📚 Tài liệu — danh sách
#/p/3-onegate/docs/new                      màn tạo bộ mới (wizard)
#/p/3-onegate/docs/job/dj7x1a-sad/outline   dàn ý một bộ
#/p/3-onegate/docs/job/dj7x1a-sad/progress  tiến độ một bộ
```

Luật đọc: cắt tại dấu `-` **đầu tiên**, phần trước là id, phần sau bỏ qua. An toàn vì id project là
số và id bộ tài liệu là `dj` + base36 (`server/store/docgen.js:106`) — **không chứa dấu `-`**.

### ⚠ Bẫy: tên tab trên URL ≠ khoá tab trong mã

Khoá nội bộ hiện tại lệch với nhãn người dùng thấy, và lệch theo kiểu dễ sai nhất — **`docs` trong mã
là tab Agile, không phải tab 📚 Tài liệu**:

| Nhãn trên màn hình | Khoá `tab` trong `App.jsx` | Nên là segment |
|---|---|---|
| Sessions | `flow` | `sessions` |
| Requirement | `req` | `req` |
| Agile | `docs` ⚠ | `agile` |
| 📚 Tài liệu | `prodocs` ⚠ | `docs` |
| ⏰ Lịch | `sched` | `sched` |

Phải có **một bảng ánh xạ hai chiều duy nhất** giữa segment và khoá tab. Đừng dùng thẳng khoá nội bộ
làm segment (`#/p/3/prodocs` vừa xấu vừa sai nghĩa), và cũng đừng đổi tên khoá nội bộ trong cùng lần
sửa này — đổi khoá là đụng vào cả `styles.css` lẫn mọi nhánh `tab === …`, gộp vào đây thì hỏng cái gì
cũng không biết tại route hay tại đổi tên.

Bảng đó nằm ở **một chỗ duy nhất**: `TABS` trong `router.js`. Khoá nội bộ **không** đổi tên trong lần
sửa này — đổi khoá là đụng cả `styles.css` lẫn mọi nhánh `tab === …`, gộp vào đây thì hỏng cái gì
cũng không biết tại route hay tại đổi tên.

### Đã làm

| Tệp | Vai trò |
|---|---|
| `web/src/router.js` **MỚI** | `slugify` · `withSlug` · `parseHash` · `buildHash` · `go` · `rewriteSeg` · `useHashRoute` · nhớ chỗ mở lần trước |
| `web/src/App.jsx` | `active` và `tab` **suy từ URL**, không còn `useState`. Bấm sidebar/tab = đặt hash |
| `web/src/docs/DocJobs.jsx` | `view` nhận từ prop, không còn `useState` nội bộ — **đây là điểm sửa bug** |
| `tests/d3-router.mjs` **MỚI** | 55 ca, chạy thẳng trong node bằng một `window` giả tối thiểu |

Bốn thứ kèm theo, đúng như đã chốt:

1. **URL rỗng → về chỗ đóng lại lần trước** (`localStorage: as:lastRoute`). Chỉ thử **một lần** mỗi
   phiên — nếu không thì chủ động bấm về `#/` cũng bị đá ngược lại ngay.
2. **Project trong URL không tồn tại** → câu giải thích ngay trên màn chọn project, rồi `#/`. Thông
   báo được giữ qua lần chuyển hướng đó (lần đầu viết đã xoá mất nó, phải sửa lại).
3. **Bộ tài liệu không thuộc project trong URL** → về danh sách. Có `loadedFor` chặn việc phán xét
   bằng danh sách của project **cũ** — vừa đổi project thì `jobs` còn là của project trước.
4. **Slug tự vá khi đổi tên** — `rewriteSeg` sửa **một** segment, im lặng. Sửa từng segment chứ không
   dựng lại cả URL: `App` chỉ biết tên project, `DocJobs` chỉ biết tên bộ tài liệu; dựng lại cả URL
   từ một chỗ thiếu thông tin là xoá mất slug của chỗ kia.

### Ba bẫy dò ra khi làm

1. **`đ` không phân rã bằng NFD.** `"Đỗ Đức".normalize("NFD")` tách được dấu của `ỗ`/`ứ` nhưng `đ`
   vẫn nguyên — nó là một ký tự Latin riêng, không phải `d` + dấu. Không map tay là slug ra `-`.
   Có ca test riêng cho đúng chuyện này.
2. **`history.replaceState` KHÔNG phát `hashchange`.** Mọi chuyển hướng tự động dùng `replace` (để
   Back không kẹt) đều phải tự `dispatchEvent(new Event("hashchange"))`, nếu không React không biết
   URL vừa đổi.
3. **Tạo bộ tài liệu mới suýt bị đá ngược về danh sách.** `onCreated` gọi `loadJobs()` (bất đồng bộ)
   rồi điều hướng ngay sang `outline`; phép kiểm "bộ này có thuộc project không" chạy với danh sách
   **cũ** — chưa có bộ vừa tạo — nên đá về `list`. Phải chèn bộ mới vào `jobs` **trước** khi đi.

### Còn phải nhìn bằng mắt

- Đang ở `#/p/…/docs/job/…/outline`, bấm project khác trên sidebar → URL thành `#/p/<khác>/docs`,
  màn hình là **danh sách bộ tài liệu của project mới**. Đây chính là bug phải hết.
- F5 ở bất kỳ URL nào trong bảng trên → về đúng màn đó.
- Back/Forward của trình duyệt đi đúng lịch sử, không kẹt.
- Đổi tên project rồi mở lại link cũ (`#/p/3-ten-cu/docs`) → vẫn vào đúng, URL tự sửa thành tên mới.
- Dán `#/p/999/docs` (project không có) → về `#/` kèm lời giải thích, không văng.
- Đóng app ở một tab bất kỳ rồi mở lại → về đúng chỗ đó.

### Ngoài phạm vi — ghi ra để lần sau khỏi cãi

Sub-tab **Tiến độ / Xuất bản / Console**, session đang chọn trong tab Sessions, mục `§6.2` đang mở,
và các hộp thoại (Xuất, Cài đặt) **không** lên URL ở issue này. Chủ repo đã chốt độ sâu ở hai mức.
Bộ URL trên cố ý chừa chỗ để thêm sau (`…/progress/console`, `…/sessions/<sid>`) mà không phải phá
đường dẫn đã có.

## 9.4 ĐÃ LÀM — hồi quy D1 thành bộ test tự động

*Commit `fd2c49b` · MỚI `tests/d3-regress-d1.mjs` · **70 ca · 0 token***

Việc này **không nằm trong ba việc chủ repo giao** — nó lấy từ chính danh sách nợ của bản bàn giao
này: §4 Nhóm A #5 và §8.4 A #6 đều ghi *"hồi quy D1 — **chưa** chạy lại sau khi sửa D2"*. Từ lúc
ghi câu đó tới giờ, D2.1 chèn cổng tiết kiệm vào giữa luồng và D3 đổi cả tầng điều hướng, nên khoảng
trống chỉ rộng thêm. Đây là rủi ro lớn nhất còn lại mà **không cần token và không cần mắt người**.

D1 kiểm 12 ca bằng tay, trong đó có **3 lượt khảo sát thật (~600K token)** — không có cách nào chạy
lại thường xuyên. Bài này lấy dàn ý từ **preset** thay cho khảo sát, đúng như §4 đã gợi ý, nên chạy
lại được bất cứ lúc nào.

| Nhóm | Phủ ca nào của D1 |
|---|---|
| A · catalogue chuẩn | **ca 3** (12 · 9 · 11 · 2/18 · 6/41) · **ca 4** (mọi mục có `hint` cho tooltip) · §6 (3 mục bổ sung của ISO 15289, đủ 4 văn phong) |
| B · tạo bộ tài liệu | **ca 1** (nguồn chính khoá theo project) · §6 (nguồn thêm **luôn** là `reference`, không nhận `source`; độ sâu mặc định 2, mở được 3, giá trị vô lý bị kẹp) |
| C · preset | **ca 8** (preset bộ A → bộ B) · từ chối preset khác chuẩn · mục preset không nhắc tới bị **tắt** chứ không biến mất |
| D · duyệt · đóng băng · mở khoá | **ca 5** (mẫu số tiến độ bỏ mục đã tắt) · §6 (`🔓 Mở khoá để sửa`) |
| E · dữ liệu bền | **ca 12** · xoá bộ thì dàn ý không thành rác mồ côi |

**Không phủ** (cần gọi model hoặc cần repo git có lịch sử thật): ca 2 (xem trước theo tác giả git),
ca 7 (agent sửa dàn ý), ca 6 nhánh `fetchUsage`, ca 9 hộp thoại trên trình duyệt, ca 10 (tắt server
giữa lúc khảo sát).

### Một hồi quy của D2.1 lên D1 mà trước đó chưa ai canh

`blockSurvey` chặn khảo sát (403) là đúng. Nhưng **áp preset không gọi model** — nó phải không bị
chặn lây, vì nó chính là đường "lấy dàn ý mà không tiêu token" mà §4 dựa vào để chạy hồi quy. Chặn
nhầm chỗ đó là bịt luôn lối thoát rẻ tiền duy nhất. Giờ có ca test canh đúng chuyện này.

### Hai chỗ bài test tự sai một lượt — đã ghi vào chú thích để không mắc lại

1. **Khoá tài liệu của arc42 là `sad`, không phải `"arc42"`; và mục định danh bằng `num`, không phải
   `n`.** Sai một trong hai thì `applyPreset` không khớp được mục nào, lặng lẽ trả về **dàn ý trần
   của chuẩn** — HTTP 200, `plan.docs` không rỗng, trông y như thành công. Chỉ đếm số mục mới lộ.
2. **`enabled` và `status` là hai thứ khác nhau.** `enabled:false` là người dùng tắt mục trên dàn ý,
   và đó mới là thứ mẫu số tiến độ bỏ qua. `status:"skipped"` là **dấu đóng băng**, do `approvePlan`
   tự đóng lúc duyệt cho mọi mục đã tắt, và `unlock` trả ngược về `pending`. Đặt tay `status:"skipped"`
   mà quên `enabled:false` thì mục **vẫn nằm trong mẫu số**.

Cả hai lần đầu đều làm bài test **báo lỗi trông như hồi quy sản phẩm**. Không phải — mã đúng, bài
test mô hình sai. Ghi ra vì lần sau gặp đúng hai con số đó thì đỡ mất một vòng điều tra.

### Tự dọn

Cổng **4398** (`d21-http.mjs` dùng 4399) nên chạy song song không tranh chấp. Mọi bộ tài liệu và
preset bài test tạo ra đều bị xoá trong khối `finally`, kèm hai ca khẳng định **số bộ của project
mẫu về đúng như trước** và **không còn preset rác** — §7.8 #5 đã mắc lỗi này một lần rồi.

Kiểm lại sau khi chạy cả 5 bộ: `docgen.json` vẫn **15 job · 13 plan · 2 preset**, `studio.json` vẫn
2 project. Không mất gì.

## 9.5 ĐÃ LÀM — nút `📂 Mở thư mục` "bấm không thấy gì"

*Commit `88ec188` · `server/docgen/dests.js` · `routes/docgen.js` · `docs/DocProgress.jsx` · `docgen.css`*

### Nó KHÔNG hỏng — đó mới là vấn đề

Chủ repo báo bấm nút không có chuyện gì xảy ra. Đo bằng cách đếm cửa sổ Explorer trước và sau khi
gọi `revealDir`: **số cửa sổ tăng đúng 1, trỏ đúng đường dẫn.** Bằng chứng còn sót lại trên máy —
**4 cửa sổ cùng trỏ vào `Downloads/stale-demo/Switch test - switch`**: bấm 4 lần, cả 4 lần đều mở,
và không lần nào người dùng nhìn thấy.

Cửa sổ mở ra **nằm sau trình duyệt**. Không có cờ nào của `explorer.exe` sửa được: Windows không cho
một tiến trình đang chạy nền giành foreground, nó chỉ được phép nháy nút trên thanh tác vụ.

Và giới hạn thứ hai, sâu hơn: **thư mục mở trên máy chạy SERVER**, không phải máy đang mở trình
duyệt. Trùng nhau khi chạy localhost. Mở Studio từ máy khác trong mạng thì cái nút này về nguyên tắc
không bao giờ giúp được gì — cùng gốc với §7.10 (log là tệp cục bộ, không đi theo database).

### Đã làm — đúng thứ chủ repo đề nghị

| Đổi gì | Vì sao |
|---|---|
| `PathActions` — cặp nút **📂 mở** / **📋 chép**, luôn đi liền nhau | Chép **không** phải thứ chỉ hiện ra sau khi mở thất bại. Lúc mở *thành công* mà người dùng không thấy gì mới đúng là lúc cần nó nhất |
| Mở xong **luôn báo**, kể cả thành công: *"cửa sổ có thể nằm sau trình duyệt, xem trên thanh tác vụ"* | Im lặng chính là thứ khiến người ta bấm bốn lần |
| `revealDir` trả `{ ok, path, host }` thay vì `true` trần | Để giao diện nói được *"đã mở trên máy chạy server (`<host>`) — không phải máy này"* khi hai máy khác nhau |
| Chép có đường lùi `execCommand` | `navigator.clipboard` **chỉ chạy trong secure context**. `localhost` thì được, `http://192.168.x.x:5311` thì **không** — mà đó đúng là lúc nút "mở" vô dụng nhất |

Dùng ở **hai chỗ**: toast sau khi xuất, và từng dòng trong lịch sử xuất (tab Xuất bản).

**Test:** chỉ kiểm nhánh **lỗi** của `/api/doc-dests/reveal` (đường dẫn không tồn tại → 400, thiếu
`path` → 400) và kiểm `revealDir` trả `host` bằng cách đọc mã nguồn. Không gọi nhánh thành công:
nó sẽ bật một cửa sổ Explorer lên màn hình người đang chạy test.

---

## 10. PHIÊN SAU — ĐƯA LÊN UPSTREAM VÀ MỞ PR

Chủ repo **đã được nhận làm contributor** của repo gốc. Phiên sau làm việc đưa các issue *đã xong*
lên đó. Mục này là tất cả những gì cần biết.

## 10.1 Bản đồ remote — đọc trước khi gõ lệnh nào

```text
origin    https://github.com/doducminh/agile-studio.git     ← fork của chủ repo
upstream  https://github.com/TranDuy13/agile-studio.git     ← repo TÁC GIẢ
```

| Sự thật | Giá trị | Nghĩa là |
|---|---|---|
| `origin/main` so với `upstream/main` | **0 ↔ 0** | Hai main đang khớp nhau hoàn toàn |
| `upstream/main` có phải tổ tiên của `feat/docgen-d2`? | **CÓ** | **Fast-forward được. Không cần rebase, không có xung đột.** |
| `feat/docgen-d2` hơn `upstream/main` | **14 commit** | 6 của D1 + 8 của D2/D2.1/D3 |
| Đã push chưa | **RỒI** — cả `feat/docgen-d1` và `feat/docgen-d2` lên `origin`, tracking đã đặt | Không còn commit nào chưa đẩy. Bước tiếp là **mở PR** |
| `upstream` đã bị đụng chưa | **CHƯA** — `git ls-remote upstream` chỉ có `refs/heads/main` | Repo tác giả nguyên vẹn. Mọi thứ đi vào đó phải qua PR |
| Stash của chủ repo | `stash@{0}` *"park owner docs edits"* — `CLAUDE.md` + `docs/issues/README.md` | **Vẫn còn nguyên, chưa ai đụng.** Xử lý trước khi làm gì với `docs/` |
| `gh` CLI | **KHÔNG có trên máy này** (`gh: command not found`) | Mở PR bằng web, hoặc cài `gh` trước |

### Quét an toàn trước khi push — đã chạy, sạch

| Kiểm | Kết quả |
|---|---|
| Tệp bí mật lọt vào commit? | Không. Chỉ khớp `TokenConfirm.jsx` — trùng chữ "token" trong tên tệp, là hộp thoại UI |
| `.env` có bao giờ bị track? | **Chưa bao giờ**, trong toàn bộ lịch sử mọi nhánh |
| Chuỗi giống khoá/token trong diff? | Không (`sk-`, `ghp_`, `xox*`, `AKIA`, PRIVATE KEY, `postgres://user:pass@`) |
| Blob lớn bất thường? | Không. 56 tệp · 11 297 dòng thêm, toàn văn bản |

## 10.2 Mười ba commit, và chúng thuộc issue nào

```text
── D1 (nhánh feat/docgen-d1, tip 77cced5) — 6 commit ──────────────
68eb9fc  feat(docgen): tạo bộ tài liệu theo chuẩn quốc tế & cổng duyệt dàn ý
b1b0cec  feat(docgen): seed dữ liệu mẫu, ngưỡng token, mẫu Word, xem trước văn phong
fa2391f  fix(docgen): sửa lỗi spawn claude ENOENT khi khảo sát
4da73e7  fix(docgen): giao diện dàn ý — responsive, dialog thật, chọn hàng loạt
44205ab  refactor(docgen): bố cục lại màn dàn ý
77cced5  feat(docgen): so sánh 4 văn phong · độ sâu dàn ý theo từng tài liệu
── D2 + D2.1 + phiên D3 — 7 commit ────────────────────────────────
d52c46a  feat(docgen): viết nội dung, theo dõi tiến độ và xuất .docx tối thiểu
5c042f9  feat(docgen): log phiên agent · tiết kiệm · project mẫu · nơi lưu   (D2.1, §7)
db60989  fix(docgen): bỏ nơi lưu "Thư mục dữ liệu Studio"                    (§9.1)
693f89d  fix(ui): dời nút "＋ Chạy feature" khỏi topbar                       (§9.2)
344b4f8  feat(ui): route theo hash + sửa bug đổi project                     (§9.3)
fd2c49b  test(docgen): hồi quy D1 thành bộ test tự động                      (§9.4)
88ec188  fix(docgen): nút mở thư mục + nút chép đường dẫn                    (§9.5)
fc23ef8  chore: gitignore .env — tệp thật có DATABASE_URL và token Discord   (§10.4 #1)
```

`feat/docgen-d1` **là tổ tiên** của `feat/docgen-d2` → tách được thành **hai PR** nếu muốn.

## 10.3 ⚠ Issue nào ĐÃ xong, issue nào CHƯA — đọc kỹ, tên rất dễ nhầm

| Issue | Tên | Trạng thái thật |
|---|---|---|
| **D1** | Tạo bộ tài liệu & chốt dàn ý | ✅ **Xong.** Mã + kiểm thử (§9.4: 70 ca tự động, 0 token) |
| **D2** | Viết nội dung, tiến độ & xuất `.docx` tối thiểu | ✅ **Mã xong.** Kiểm thử **còn thiếu** phần cần token — §8.4 B (ca 11 · 4 · 1 · 12) và ca 9 (cần account thứ hai) |
| **D3** | Cài đặt & tiện ích *(modal kiểu claude.ai, tự dò/cài Python·Word·Vale·Graphviz)* | ❌ **CHƯA làm gì.** **KHÔNG được nhầm với "phiên D3" ở §9** — trùng tên, không liên quan |
| D4–D8 | Mẫu Word · PDF · chấm điểm · lỗi từ ngữ · hướng dẫn | ❌ Chưa |

**Nhầm lẫn tốn kém nhất có thể xảy ra ở phiên sau:** thấy §9 tên là "Phiên D3, cả 5 việc đã xong"
rồi đi đóng issue D3. §9 là *phiên làm việc thứ ba*, không phải *feature D3*. Bốn việc trong đó là
sửa vặt do chủ repo giao khi dùng thật, một việc là hồi quy D1 — **không có việc nào thuộc phạm vi
issue D3 cả**.

## 10.4 Ba thứ phải xử lý — #1 xong, #2 và #3 còn nguyên

### 1. ✅ `agile-studio/.env` — ĐÃ gitignore (commit `fc23ef8`)

Tệp này từng **untracked nhưng KHÔNG nằm trong `.gitignore`**, nên chỉ cần một lần `git add -A` là
nó lên repo công khai — mà tệp thật có `DATABASE_URL` (kèm mật khẩu) và mấy dòng `DISCORD_TOKEN`
đang comment. Đó là lý do cả phiên D3 phải dùng `git add -- <đường dẫn cụ thể>`.

Đã thêm `.env` · `.env.*` · `!.env.example` vào `agile-studio/.gitignore` **trước khi push**, và đã
kiểm `.env` chưa từng bị track trong toàn bộ lịch sử.

```bash
git check-ignore -v agile-studio/.env
# agile-studio/.gitignore:9:.env    agile-studio/.env    ← đã bị ignore
```

**Vẫn còn nợ:** §7.9 — `.env` có `STORAGE_DRIVER`/`DATABASE_URL` mà **không chỗ nào trong `server/`
đọc**, dễ làm người ta tưởng app đang chạy postgres. Đó là việc khác, chưa làm.

### 2. Stash của chủ repo

`stash@{0}` *"park owner docs edits"* giữ sửa đổi ở `CLAUDE.md` và `docs/issues/README.md`. Nó nằm
trên nhánh `personal/local-work`. **Chưa ai đụng suốt cả D2, D2.1 và D3.** Quyết định giữ hay bỏ là
của chủ repo, nhưng phải làm trước khi đụng vào `docs/`.

### 3. `docs/issues/` không có trong git — và đó có thể là cố ý

`upstream/main` chỉ có 4 tệp ảnh trong `docs/`; **không có `docs/issues/`, không có `CLAUDE.md`**.
Theo chính `docs/issues/README.md`: *"copy its body into a new GitHub issue"* — tức là các tệp spec
là **thân của issue trên GitHub**, không phải tài liệu để commit.

Vậy **PR chỉ nên chứa mã**, còn nội dung `D1-*.md` / `D2-*.md` thì dán vào GitHub issue. Nếu chủ repo
muốn commit luôn `docs/issues/` thì đó là một quyết định riêng, nên hỏi tác giả trước — nó đổi cách
repo tổ chức tài liệu.

Hệ quả cần biết: **bản bàn giao này (`D2-BANGIAO.md`) sẽ không đi cùng PR.** Muốn tác giả đọc được
lý do của các quyết định thì phải tóm tắt vào mô tả PR.

## 10.5 Đề xuất chia PR

**Hai PR, theo đúng ranh giới issue** — vì D1 là tổ tiên của D2 nên tách sạch. Cả hai nhánh **đã có
sẵn trên `origin`**, chỉ còn bấm mở:

| PR | Nhánh (đã push) | Nội dung | Ghi chú mô tả |
|---|---|---|---|
| **#1 — D1** | [`feat/docgen-d1`](https://github.com/doducminh/agile-studio/pull/new/feat/docgen-d1) → `TranDuy13/agile-studio:main` | 6 commit, tạo bộ tài liệu + chốt dàn ý | Kèm kết quả §5 của `D1-BANGIAO.md` |
| **#2 — D2** | [`feat/docgen-d2`](https://github.com/doducminh/agile-studio/pull/new/feat/docgen-d2) → `TranDuy13/agile-studio:main` *(sau khi #1 merge)* | 8 commit còn lại | Nói rõ phần kiểm thử còn thiếu (§8.4 B) và công tắc `DEV_LOCK_ECONOMY` |

⚠ **GitHub mặc định đặt base là fork của chính mình.** Phải đổi base repository sang
`TranDuy13/agile-studio`, nhánh `main` — không đổi thì PR chỉ chạy vòng trong fork, tác giả không
thấy gì.

Nếu tác giả thích một PR gọn thì gộp cả 14 commit từ `feat/docgen-d2` cũng được — fast-forward nên
không có xung đột. Đánh đổi: tác giả phải đọc 14 commit một lượt.

**Ba điểm bắt buộc phải nói trong mô tả PR** (nếu không, người review sẽ hiểu nhầm):

1. **`DEV_LOCK_ECONOMY = true` đang ÉP chế độ tiết kiệm** (§7.3, §8.3) — haiku + 1 mục/lượt + prompt
   rút gọn, người dùng **không tắt được**. Đây là chủ ý cho giai đoạn phát triển, **phải đổi thành
   `false` trước khi ship**. Người review thấy `--model haiku` bị hardcode mà không biết chuyện này
   thì chắc chắn hiểu nhầm.
2. **`stale-demo` là project mẫu Studio tự dựng lúc boot** (§7.4) — nó sẽ tự xuất hiện trên máy
   người review. Có nhãn `mẫu`, nằm cuối sidebar, xoá nội dung trong đó thoải mái.
3. **Điểm chạm với mã sẵn có** (§2): D2 chạm 0 dòng mã cũ. Nhưng **D2.1 và phiên D3 thì có** —
   `server/{index,runner,store}.js` và `web/src/{App.jsx,styles.css}`. Riêng `App.jsx` bị đổi khá
   sâu ở §9.3 (bỏ `useState` cho project/tab, chuyển sang route). Nên nói trước để người review biết
   mà soi kỹ chỗ đó.

## 10.6 Danh sách kiểm — đã chạy hết trước khi push, chạy lại được bất cứ lúc nào

```bash
cd e:/gits/agile-studio/agile-studio

# 1. Toàn bộ test — phải 344 đạt · 0 lỗi · 0 token
node tests/d3-router.mjs && node tests/d3-regress-d1.mjs && node tests/d21-modules.mjs \
  && node tests/d21-events.mjs && node tests/d21-http.mjs

# 2. Build sạch — ~323.85 KB js · ~57.89 KB css
npx vite build --config web/vite.config.js

# 3. Cây làm việc: CHỈ được còn 2 thứ untracked này, không hơn
cd .. && git status --short
#   ?? .claude/settings.local.json
#   ?? docs/issues/
#   (agile-studio/.env đã biến khỏi danh sách vì nay bị gitignore — commit fc23ef8)

# 4. Không có gì lạ lọt vào 14 commit
git diff --stat upstream/main..feat/docgen-d2

# 5. Quét bí mật (đã chạy, sạch — bảng ở §10.1)
git log --name-only --pretty=format: upstream/main..HEAD | sort -u \
  | grep -Ei "\.env|accounts\.json|bot\.config|secret|credential|\.pem|\.key|id_rsa"
git diff upstream/main..HEAD | grep -E "^\+" \
  | grep -Eio "(sk-[a-z0-9_-]{20,}|ghp_[a-z0-9]{20,}|AKIA[0-9A-Z]{16}|postgres(ql)?://[^ \"']*:[^ \"'@]*@)"
```

Và **chạy thử thật một lượt** (§8.4 A): `npm run dev`, mở `stale-demo`, đi hết 5 tab, xuất một bộ.
Test tự động không thay được việc nhìn.

## 10.7 Việc còn lại sau khi PR xong

| Nhóm | Còn gì |
|---|---|
| Nhìn bằng mắt, 0 token | Ca 13 nửa giao diện (nút Xuất mờ kèm lý do) · ca 3 (mở `.docx` bằng **Word thật**, F9 ở mục lục). *(Ca 10 — ma trận — chủ repo đã xác nhận **đạt**.)* |
| Tốn token | §8.4 B: ca 11 · ca 4 nhánh sau · ca 1 đủ 12 mục · ca 12 so 3 cách chạy. Ca 9 vẫn **cần account thứ hai** |
| Nợ đã biết | §8.4 C: màn sửa glossary · watermark chéo trang · tab Chấm điểm (D6) / Lỗi từ ngữ (D7) · `.env` (§10.4 #1) · ca 5 trên project mẫu |
| Issue chưa làm | **D3** (Cài đặt & tiện ích) · D4 · D5 · D6 · D7 · D8 |
| Trước khi ship | `DEV_LOCK_ECONOMY` → `false` (§8.3) |

---

## 11. VIỆC ĐẦU TIÊN CỦA PHIÊN SAU — merge vào `personal/local-work`

Chủ repo muốn đưa docgen vào nhánh tích hợp cá nhân `personal/local-work` **trên fork của mình**,
và **không đẩy lên repo tác giả khi chưa được phép**.

Phiên D3 đã **thử merge và gỡ xong toàn bộ xung đột**, rồi **hoàn tác theo yêu cầu của chủ repo** để
không làm dở dang. Mục này giữ lại nguyên kết quả điều tra đó — **đừng dò lại từ đầu**.

> 📎 **Bản vá đã lưu sẵn:** `docs/issues/19-docgen/D3-merge-personal-local-work.patch`
> — chính là 4 tệp đã gỡ xung đột xong. Áp được bằng `git apply` sau khi merge, hoặc chỉ dùng để đối
> chiếu. Sinh từ `feat/docgen-d2` @ `fc23ef8` merge vào `personal/local-work` @ `5ac3ecc`.

## 11.1 Trạng thái hai nhánh

| | Giá trị |
|---|---|
| `personal/local-work` | `010e276` *docs: đưa spec + bàn giao docgen vào nhánh cá nhân* — **đã push, khớp `origin`**. Hơn `upstream/main` **37 commit** |
| `feat/docgen-d2` | `fc23ef8` — đã push, 0 commit chưa đẩy |
| Cần merge vào | **đúng 8 commit**: `d52c46a` → `fc23ef8` (D1 đã có sẵn qua merge `5ac3ecc`) |
| Kiểu merge | Theo đúng nếp có sẵn trên nhánh đó: **merge commit**, tên dạng `merge: docgen D2 — …` |

> **Chính tài liệu này giờ nằm trong git, trên `personal/local-work`** (`docs/issues/19-docgen/`,
> commit `010e276`) — cùng chỗ với issue 01–18 vốn đã tracked ở đó. Nó **không** có trên
> `feat/docgen-d2`, cố ý: `upstream/main` không có `docs/issues/`, commit vào nhánh docgen là nó đi
> thẳng vào PR gửi tác giả (§10.4 #3).
>
> ⚠ **Hệ quả thực tế:** đứng ở `personal/local-work` thì thấy tài liệu này trên đĩa; `git checkout
> feat/docgen-d2` là git **xoá** nó khỏi thư mục làm việc (vì nhánh đó không track). Không mất dữ
> liệu — vẫn còn trong git — nhưng đừng hoảng. Phiên D3 để lại cây làm việc **đang ở
> `personal/local-work`** đúng vì lý do này, và vì §11.4 bước 1 cũng bắt đầu từ đó.

## 11.2 ⚠ `personal/local-work` KHÔNG giống nhánh docgen — ba khác biệt đắt

Nhánh tích hợp đã đi trước rất xa (issue 01–18: storage cắm-thay-được, xoá project, layout co giãn…).
**Ba chỗ trong bản bàn giao này SAI khi đứng trên `personal/local-work`:**

| Bản bàn giao nói | Trên `personal/local-work` thì | Hệ quả |
|---|---|---|
| §7.9: *"`STORAGE_DRIVER` và `DATABASE_URL` không được đọc ở bất kỳ đâu"* | **Đọc thật.** `server/store/index.js` chọn backend theo `STORAGE_DRIVER` (`json`/`sqlite`/`postgres`) | §7.9 chỉ đúng trên nhánh docgen. **Đừng đi "dọn `.env`" theo §8.4 C** — ở đây nó có tác dụng thật |
| §7.9: *"`server/config.js` chưa tồn tại"* | **Tồn tại.** `store/index.js` import `config` từ đó | `dataDir` đổi được. Test `d21-http.mjs` có thể trỏ sang dataDir riêng thay vì ghi vào `~/.agile-studio` thật |
| `server/store.js` là bản JSON đầy đủ | Là **shim 4 dòng** re-export từ `server/store/index.js` | Mọi thứ D2.1 thêm vào `store.js` phải **port sang `server/store/state.js`** |

## 11.3 Ba xung đột và cách gỡ (đã làm xong một lượt)

```text
CONFLICT (add/add)   .claude/settings.json
CONFLICT (content)   agile-studio/server/store.js
CONFLICT (content)   agile-studio/web/src/App.jsx
```

Tự merge được, không xung đột: `server/{index,runner}.js` · `web/src/styles.css` · `agile-studio/.gitignore`
(nhưng xem #4 bên dưới).

### 1. `.claude/settings.json` — hợp nhất, không chọn một bên

Bên `personal/local-work` có `Read/WebFetch/WebSearch` + `enabledPlugins` + `defaultMode`; bên docgen
có `$schema` + `PowerShell/Bash/Write/Edit/Glob/Grep`. **Lấy hợp của cả hai.** `PowerShell(*)` là bắt
buộc — bẫy §6 #1 (Claude CLI thoát 1 khi spawn từ tool Bash).

### 2. `server/store.js` — giữ shim, port phần D2.1 sang `state.js`

`git checkout --ours -- agile-studio/server/store.js` (giữ shim), rồi **chuyển hai thứ của D2.1 vào
`server/store/state.js`**, trong `makeStore()`:

- `addProject(name, repo_path, opts = {})` — thêm cờ `opts.internal` và hai lệnh chặn `RESERVED_NAME`
  (`stale-demo`) / `RESERVED_DIR_TAIL` (`/demo/stale-demo`). Cũng đổi phép so trùng repo từ so chuỗi
  thô sang `norm()` — trên Windows cùng một thư mục viết được bằng `E:\x` hay `e:/x/`, và
  `ensureDemoProject()` dựa vào phép so này để không tạo trùng.
- `setProjectPath(id, repo_path)` — dùng nếp `w(ret)` của `state.js` (mutate rồi `save()`), không
  gọi `write()` như bản JSON cũ.

Hằng `RESERVED_NAME`/`RESERVED_DIR_TAIL`/`norm` đặt ở **đầu `state.js`**, ngoài `makeStore`. Không
import từ `docgen/` — tầng lưu trữ không được phụ thuộc vào một feature.

**Giữ nguyên `deleteProject()`** của `personal/local-work` — nhánh docgen không có hàm đó.

### 3. `web/src/App.jsx` — một vùng, ghép ba thứ

Vùng danh sách project ở sidebar. Bên `personal/local-work` có `.proj-row` + nút xoá 🗑 và gọi
`setActive(p)`; bên docgen có nhóm "project mẫu" (đường phân cách + nhãn) và gọi `goProject(p)`.

Ghép lại: **`React.Fragment` (nhóm mẫu) → `.proj-row` → nút project gọi `goProject(p)` → nút xoá**.

Và một quyết định phát sinh: **project mẫu KHÔNG cho xoá** (`{!p.demo && <button className="proj-del" …>}`).
Studio dựng lại nó ở lần boot sau, nên nút xoá chỉ làm người dùng tưởng mình xoá được rồi thấy nó
mọc lại.

**Phải kiểm sau khi gỡ:** `setActive` đã bị §9.3 xoá khỏi App.jsx. Grep lại — nếu phần tự-merge còn
sót lời gọi nào thì màn hình vỡ ngay lúc chạy, build **không** bắt được (đây là mã trong nhánh
`deleteProject`, chỉ chạy khi bấm xoá).

### 4. `agile-studio/.gitignore` — tự merge nhưng thành trùng lặp

`personal/local-work` vốn đã có `.env` và `.env.local`; commit `fc23ef8` thêm `.env` · `.env.*` ·
`!.env.example`. Merge xong ra hai khối cùng nói một chuyện. Gộp lại một khối.

## 11.4 Cách làm, theo thứ tự

```bash
cd e:/gits/agile-studio

# 1. Merge trong WORKTREE CHÍNH, đừng tạo worktree mới.
#    node_modules/ bị gitignore nên worktree mới không có nó → không chạy được test.
git checkout personal/local-work
git merge --no-commit --no-ff feat/docgen-d2

# 2. Gỡ 3 xung đột theo §11.3 (hoặc đối chiếu với D3-merge-personal-local-work.patch)

# 3. Không còn marker nào sót
grep -rn "^<<<<<<<\|^>>>>>>>" agile-studio/ .claude/ | grep -v node_modules

# 4. Lời gọi chết sau refactor route
grep -n "setActive\|setTab(" agile-studio/web/src/App.jsx

# 5. Chạy đủ 5 bộ test + build — phải 344 đạt · 0 lỗi
cd agile-studio
node tests/d3-router.mjs && node tests/d3-regress-d1.mjs && node tests/d21-modules.mjs \
  && node tests/d21-events.mjs && node tests/d21-http.mjs
npx vite build --config web/vite.config.js
```

**Trước khi chạy test, backup `~/.agile-studio/{docgen,studio}.json`** — `d21-http.mjs` và
`d3-regress-d1.mjs` ghi vào đó thật (§10.6).

**Rủi ro riêng của lần merge này:** test hiện chạy trên storage `json`. Sau khi merge, nhánh có cả
`sqlite`/`postgres`. Nếu `.env` đang đặt `STORAGE_DRIVER=postgres` thì test sẽ chạy vào **postgres**
chứ không phải `studio.json` — kiểm biến môi trường trước khi chạy.

## 11.5 Đẩy đi đâu — và đâu là ranh giới

```bash
git push origin personal/local-work
```

| Được | Không được |
|---|---|
| `origin` = `doducminh/agile-studio` — fork của chủ repo | ⛔ **`upstream` = `TranDuy13/agile-studio`** |

**Chủ repo đã nói rõ: không đẩy lên repo tác giả khi chưa được phép.** Dù đã là contributor (tức là
*có quyền* push thẳng), quyền không phải là sự cho phép. Mọi thứ vào repo tác giả đi qua **PR** ở
§10.5, và chỉ khi chủ repo bảo làm.

Kiểm lại sau khi push: `git ls-remote --heads upstream` phải **chỉ có `refs/heads/main`**.
