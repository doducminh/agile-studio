# Tài liệu sản phẩm (Docgen) — lộ trình

Viết tài liệu sản phẩm **theo chuẩn ngành quốc tế** ngay trong Agile Studio: phân tích project,
đề xuất dàn ý, viết nội dung, chấm điểm, bắt lỗi thuật ngữ, xuất Word / PDF.

| Tài liệu | Nội dung |
|---|---|
| [`mockup.html`](./mockup.html) | **v3 — đã chốt.** 8 màn hình, bấm được (wizard 3 bước, 2 kiểu xem tiến độ) |
| [`RULESET.md`](./RULESET.md) | Nguyên tắc thiết kế, hợp đồng trình bày, tiêu chí chấm điểm, luật ngôn ngữ |
| `D1`–`D8` | 8 feature độc lập, mỗi feature một file spec |
| [`D1-BANGIAO.md`](./D1-BANGIAO.md) | **D1 đã làm xong** — trạng thái, API, kết quả kiểm thử, việc còn lại |
| [`PROMPT-D1.md`](./PROMPT-D1.md) | Prompt đã dùng để làm D1 (giữ lại để tham chiếu) |
| [`PROMPT-D2.md`](./PROMPT-D2.md) | Prompt dán vào phiên Claude Code mới để làm D2 |
| [`D2-BANGIAO.md`](./D2-BANGIAO.md) | **D2 viết xong mã, kiểm thử dở dang** — trạng thái, API, 13 ca kiểm thử, việc còn lại |

> **Cách làm việc đã thống nhất:** làm từng feature → chủ repo duyệt kết quả → mới tạo issue và PR
> cho feature đó → sang feature kế tiếp. Không gộp thành một epic khổng lồ.

---

## 1. Lộ trình

| # | Feature | Duyệt được ở chỗ nào | Ưu tiên | Cỡ | Cần trước |
|---|---------|----------------------|---------|----|-----------|
| [D1](./D1-tao-bo-tai-lieu-va-dan-y.md) ✅ | Tạo bộ tài liệu & chốt dàn ý — **xong, chờ duyệt** ([bàn giao](./D1-BANGIAO.md)) | Tạo được bộ tài liệu, agent đề xuất dàn ý theo chuẩn, sửa và duyệt được | **P1** | **L** | — |
| [D2](./D2-viet-noi-dung-va-tien-do.md) | Viết nội dung, theo dõi tiến độ & **xuất `.docx` tối thiểu** | Cầm được file Word thật (theme mặc định), sửa tay được một mục | **P1** | L | D1 |
| [D3](./D3-cai-dat-va-tien-ich.md) | Cài đặt & tiện ích | Máy trắng vẫn cài đủ công cụ mà không phải gõ đường dẫn | **P1** | M | — |
| [D4](./D4-xuat-word-theo-mau.md) | Xuất Word **theo mẫu doanh nghiệp** | File `.docx` đúng font/màu/bảng của mẫu, bảng kiểm soát lấy từ mẫu | **P1** | M | D2, D3 |
| [D5](./D5-xuat-pdf-va-bao-ve.md) | Xuất PDF & bản chống sao chép | Có PDF thường và PDF bảo vệ, link vẫn bấm được | P2 | M | D4 |
| [D6](./D6-cham-diem-theo-chuan.md) | Chấm điểm theo chuẩn | Điểm kèm bằng chứng; đổi trọng số thì điểm đổi đúng | P2 | M | D2 |
| [D7](./D7-bat-loi-tu-ngu.md) | Bắt lỗi từ ngữ technical | Bắt được tên class không tồn tại, secret, thuật ngữ lệch | P2 | M | D2, D3 |
| [D8](./D8-huong-dan-su-dung.md) | Hướng dẫn sử dụng | Người lạ đọc README là dùng được tính năng | P3 | S | D1–D7 |

**D1 và D3 làm song song được** (không phụ thuộc nhau).

**Mốc "cầm được sản phẩm" là cuối D2, không phải D4.** D2 đã xuất được `.docx` bằng theme mặc định —
xấu nhưng mở bằng Word ra chữ. D4 chuyển từ "có file" sang "file đúng mẫu công ty", nhờ đó khối lượng
D4 giảm từ L xuống M và ta không đi ba feature liền mà không có gì cầm được.

**Nếu phải dừng giữa chừng:** D1→D2 là sản phẩm tối thiểu dùng được. D3→D4 là mức dùng được cho khách.
D5–D7 là phần tăng thêm. D8 luôn làm cuối.

## 2. Quyết định đã chốt

| # | Quyết định |
|---|---|
| Q1 | **IR + mẫu `.docx`** — agent chỉ sinh nội dung dạng JSON; renderer nạp mẫu Word làm base, ánh xạ vào named style |
| Q2 | **Python sidecar** cho render và xuất bản, gọi qua `child_process` |
| Q3 | **PDF hai mức** — thường (có text) và chống sao chép (raster + watermark + AES-256) |
| Q4 | **Tiện ích ngoài tự dò, cài giúp khi xác nhận** — không bắt người dùng gõ đường dẫn |
| Q5 | **Word COM ưu tiên, LibreOffice dự phòng** cho `.docx → PDF` |
| Q6 | **Tài liệu thuộc đúng một project** — nguồn chính là repo của project, khoá lại; chỉ thêm được thư mục cùng sản phẩm và tài liệu tham chiếu |
| Q7 | **Chỉ dùng chuẩn quốc tế** làm bộ khung; chuẩn quyết định bộ gồm mấy file |
| Q8 | **Cổng duyệt dàn ý** trước khi viết |
| Q9 | **Cách chạy chọn lúc duyệt, đổi được giữa chừng** |
| Q10 | **Nội dung lưu trong Studio; xuất bản là hành động riêng**, chọn nơi lưu lúc xuất |
| Q11 | **Hai kiểu xem tiến độ**: Chi tiết · Ma trận (full width). Không làm Kanban |
| Q12 | **Trọng số chấm điểm chỉnh được**, gom thành hồ sơ chấm dùng lại |
| Q13 | **Ngưỡng hỏi token = 50K** — mọi nút hiện ước tính, chỉ việc vượt 50K mới mở hộp thoại xác nhận (có "không hỏi lại" theo loại việc). Ngưỡng chỉnh được |
| Q14 | **Cài đặt là modal kiểu `claude.ai/settings`** — ô tìm kiếm, danh mục trái chia nhóm, ✕ góc trên. Mở rộng modal sẵn có, không làm trang riêng |
| Q15 | **Mẫu tài liệu 3 cấp**: toàn cục → project → từng bộ tài liệu |
| Q16 | **Bảng "Kiểm soát tài liệu" lấy từ mẫu Word** — dò bảng có sẵn và điền giá trị, giữ nguyên bố cục của mẫu; chỉ đề xuất bổ sung dòng thiếu; mẫu không có thì mới dựng mới |
| Q17 | **Tên tab**: tab mới là **`📚 Tài liệu`**; tab "Tài liệu" cũ (skill tổng + tài liệu PM/BA/DA) đổi thành **`Agile`** |
| Q18 | **Không dịch tên chuẩn và tên mục của chuẩn** — giữ nguyên tiếng Anh (`Building Block View`, `Architecture Decisions`, `Life-cycle Information Items`…) kèm tooltip giải thích một dòng bằng tiếng Việt. Chỉ dịch từ nào tiếng Việt diễn đạt tự nhiên. Chi tiết: [`RULESET.md`](./RULESET.md) §2/N11 |
| Q19 | **Điểm chạm tối thiểu vào mã sẵn có** — toàn bộ route ở `server/routes/docgen.js`, toàn bộ store ở `server/store/docgen.js`, dữ liệu gom vào **một** khoá `docgen`. `index.js` thêm 2 dòng, `state.js` thêm 2 dòng. Lý do ở §7 |
| Q20 | **Sửa tay được nội dung** — mỗi mục có thể sửa trực tiếp trong app; mục đã sửa tay mang cờ `edited` và **lần viết lại không ghi đè** trừ khi người dùng cho phép |
| Q21 | **Phát hiện mục đã cũ (`stale`)** — vì mọi khối IR mang `sources` kèm `commit`, tính được mục nào đang trỏ tới file đã đổi từ lần dựng trước. Có nút "viết lại các mục đã cũ" thay vì viết lại cả bộ |
| Q22 | **Dự báo chi phí trước khi duyệt dàn ý** — hiện tổng token ước tính và quy đổi ra số cửa sổ 5h, kèm gợi ý cắt mục nếu vượt. Ngưỡng hỏi 50K (Q13) chỉ chống bấm nhầm, không thay được dự báo tổng |

## 3. Bộ tài liệu theo chuẩn

Chuẩn quyết định bộ gồm mấy file — trả lời câu "một thẻ là một file hay nhiều file".
**Tên tài liệu và tên mục giữ nguyên tiếng Anh theo chuẩn**, giao diện kèm tooltip giải thích
một dòng bằng tiếng Việt (xem [`RULESET.md`](./RULESET.md) §2/N11):

| Chuẩn | Bộ tài liệu | Số file |
|---|---|---|
| **arc42 + C4** | Software Architecture Document — 12 mục | 1 |
| **ISO/IEC/IEEE 29148** | Software Requirements Specification (SRS) | 1 |
| **IEEE 1016 + ISO/IEC/IEEE 42010** | Software Design Description (SDD) — theo viewpoint | 1 |
| **ISO/IEC/IEEE 26514** (+ Diátaxis) | User Documentation — User Guide + Administrator Guide | 2 |
| **ISO/IEC/IEEE 15289** | Life-cycle Information Items — SDD, Database Design, Deployment & Installation, Configuration Management, Operations, Repository Structure | 6 |
| **Tuỳ chọn** | Tự ghép tài liệu từ các chuẩn trên | n |

Chuẩn khai báo dạng **dữ liệu** (danh sách tài liệu + mục bắt buộc + loại nội dung của từng mục),
nên thêm chuẩn mới không phải sửa engine — xem [`RULESET.md`](./RULESET.md) §2/N3.

## 4. Mô hình dữ liệu dùng chung

**Docgen tự lo lưu trữ, không đụng store sẵn có (Q19).**

Nhánh docgen nhắm vào `main`, mà trên `main` chỉ có `server/store.js` (124 dòng, đọc/ghi cả file JSON
mỗi lần gọi) — **không có** `server/store/state.js`, `makeStore()`, `emptyData()` hay `docFiles`.
Toàn bộ kiến trúc đó thuộc PR #11 đang chờ maintainer.

Nên `server/store/docgen.js` **tự quản lý một tệp riêng** `<DATA_DIR>/docgen.json`, ghi có debounce,
theo đúng cách `store.js` xác định thư mục dữ liệu. Kết quả:

- Chạy được trên **cả** `main` lẫn nhánh local đã có PR #11 — không cần biết store nào đang dùng.
- **Không sửa dòng nào** trong `store.js` / `store/*` → không đụng vùng của PR #11.
- Điểm chạm với mã sẵn có giảm từ 6 dòng xuống **3 dòng**.

> **Đánh đổi đã biết:** trên máy dùng Postgres (PR #11), dữ liệu docgen nằm ở tệp riêng nên **chưa đi
> được giữa các máy**. Khi PR #11 merge, thay phần đọc/ghi tệp bằng một adapter trỏ vào store chung
> — đổi một tệp, không đổi API. Ghi thành việc phải làm sau, không nhét vào D1.

Cấu trúc dữ liệu bên trong `docgen.json`: một khoá duy nhất ở gốc.

```
docgen: {
  jobs:      { <jobId>: Job },              // D1
  plans:     { <jobId>: Plan },             // D1 — dàn ý đã duyệt (đóng băng)
  ir:        { <jobId>: { "<doc>/<sec>": IRSection } },  // D2
  scores:    { <jobId>: Score },            // D6
  findings:  { <jobId>: [Finding] },        // D7
  exports:   { <jobId>: [Export] },         // D2 (.docx) · D5 (PDF)
  // cấp studio (toàn cục)
  standards: { <stdId>: Standard },         // D1 — arc42, 29148, 1016, 26514, 15289
  presets:   { <presetId>: Preset },        // D1 — dàn ý đã lưu, sửa lại được sau khi áp
  templates: { <tplId>: Template },         // D3 — mẫu .docx + style + bảng kiểm soát đã dò
  profiles:  { <profileId>: ScoreProfile }, // D6 — trọng số 7 tiêu chí
  tools:     { python, word, libreoffice, docProtect, vale, graphviz },  // D3
}
```

Mọi thao tác đọc/ghi đi qua `server/store/docgen.js` — `docgenStore` là một module độc lập, tự nạp
`docgen.json` lúc khởi động và tự ghi lại (debounce). Không import gì từ `store.js`.

```js
Job = {
  id, projectId, name, standardId, status,
  //  status: draft|surveying|plan-review|writing|editing|scoring|ready|paused|error
  sources: {
    main: { projectId, path },                       // khoá, luôn là repo của project
    extra: [{ id, kind:"code"|"reference", path }],  // thư mục cùng sản phẩm · tài liệu tham chiếu
  },
  scope: { mode:"all"|"feature", features[],
           byAuthor: bool, authors:[], from, to },   // byAuthor ĐỘC LẬP với mode
  meta: { docIdPrefix, classification, docStatus, approvals: bool,
          control: [{ key, label, source:"template"|"added", enabled, value }],
          history: [{ date, version, change, by }] },// phiên bản = dòng cuối của history
  style: { templateId|null, tone, language, depth },
  run:  { engine: "per-doc"|"single"|"per-section" },// đổi được khi đang chạy
  metrics: { sections, done, words, pages, tables, figures, tokens, elapsedMs },
  sessionIds: [], createdAt, updatedAt,
}
Plan = { approvedAt, revision, estTokens, docs:[{ key, title, file,
         sections:[{ id, num, title, kind, required, accept, sources[], status, words }] }] }

// "accept" — điều kiện để tính mục này là ĐẠT, dùng cho tiêu chí "Đầy đủ" của D6.
// Do chuẩn khai báo, không hard-code trong engine.
accept = { minBlocks: 2, mustHave: ["table"|"figure"|"flow"], minSources: 1, noEmptyCells: true }
```

`status` của section — nguồn duy nhất cho cả hai kiểu xem tiến độ:

| status | Nghĩa |
|---|---|
| `pending` | chưa viết |
| `writing` | agent đang viết |
| `written` | agent viết xong |
| `edited` | **người dùng đã sửa tay** — lần viết lại không ghi đè (Q20) |
| `stale` | nguồn đã đổi kể từ lần viết — nên viết lại (Q21) |
| `error` | viết lỗi, có lý do kèm theo |
| `skipped` | bị tắt ở dàn ý |

> **Đính chính từ D2 — `edited` là cờ riêng, không chỉ là một giá trị của `status`.**
> Một mục có thể **vừa** đã sửa tay **vừa** có nguồn đã đổi; đó chính là ca kiểm thử số 6 của D2
> ("mục vừa `edited` vừa `stale` → không nằm trong lượt viết lại hàng loạt"). Nếu hai chuyện đó
> tranh nhau một trường thì `stale` che mất `edited`, và không còn cách nào biết mục nào phải loại
> khỏi lượt viết lại. Nên section mang **thêm** `edited: bool` (kèm `editedAt`) tồn tại song song
> với `status`, và `staleFiles: []` ghi những tệp đã đổi để hiện trong tooltip:
>
> | trường | ai đặt | dùng để |
> |---|---|---|
> | `status` | mọi bước | màu và ký hiệu ở cả hai kiểu xem |
> | `edited` | `PUT /ir` đặt, `POST /ir/unedit` gỡ | **chốt chặn**: engine viết không bao giờ nhận mục có cờ này, kể cả khi người dùng chỉ đích danh |
> | `staleFiles` | lượt dò mục đã cũ | liệt kê tệp đã đổi, để tooltip nói rõ vì sao mục bị coi là cũ |
>
> `status` vẫn là nguồn duy nhất cho **hiển thị**; `edited` là nguồn duy nhất cho **quyền ghi đè**.

## 5. Lược đồ IR dùng chung

Một section = một tệp JSON. Mọi khối có thể mang `sources` (§2/N2 — mọi khẳng định có nguồn).

```jsonc
{
  "doc": "sad", "section": "6.2", "title": "Tạo đơn hàng",
  "kind": "reference",                       // reference|howto|explanation|tutorial (Diátaxis)
  "sources": [{ "file": "src/api/orders/create.ts",
                "lines": [41, 78], "commit": "a1b2c3d" }],
  "traces": ["FR-07", "FR-12"],              // truy vết về tài liệu agile (tuỳ chọn)
  "blocks": [
    { "t": "p",       "text": "…" },
    { "t": "bullets", "items": ["…"] },
    { "t": "num",     "restart": true, "items": ["…"] },   // đánh số thủ công, reset theo mục
    { "t": "table",   "headers": [], "rows": [[]], "widths": [2.0, 4.4] },
    { "t": "code",    "lang": "json", "text": "…" },
    { "t": "figure",  "src": "flow_6_2.png", "caption": "…", "alt": "…" },
    { "t": "flow",    "steps": ["nhận request", "if chưa đăng nhập", "DB: orders", "return 201"] },
    { "t": "refs",    "items": [["ASP.NET Core Minimal API", "https://…"]] },
    { "t": "callout", "level": "warn", "text": "…" }
  ]
}
```

Quy ước `flow` (xem [`RULESET.md`](./RULESET.md) §3): `if …` = thoi đỏ · `return …` = viên xanh lá · `DB: …` = hình bình
hành · còn lại = chữ nhật bo. `alt` của `figure` **bắt buộc** (§2/N7).

## 6. Sidecar Python — `agile-studio/docgen/`

| Tệp | Feature | Việc |
|---|---|---|
| `detect.py` | D3 | Rà máy: Python, gói pip, Word, LibreOffice, doc-protect-tool, Vale, Graphviz |
| `install.py` | D3 | Cài giúp sau khi người dùng xác nhận |
| `styleprobe.py` | D3 | Đọc mẫu `.docx` → named style **và bảng Kiểm soát tài liệu** có sẵn |
| `render.py` | **D2** (theme mặc định) → **D4** (nạp mẫu) | IR → `.docx` |
| `flow.py` | D4 | Vẽ sơ đồ luồng từ khối `flow` |
| `topdf.py` | D5 | `.docx → PDF`: LibreOffice (mặc định) → Word COM khi có |
| `protect.py` | D5 | Gọi `make_pdf.py` của `doc-protect-tool` |

Mọi script nhận/trả JSON qua stdout, luôn đặt `PYTHONIOENCODING=utf-8` ([`RULESET.md`](./RULESET.md) §6).

`render.py` ra đời ở **D2** với phiên bản tối thiểu (chỉ theme mặc định §3, không mẫu, không sơ đồ),
rồi D4 mở rộng nó. Nhờ vậy D2 đã có file `.docx` cầm được.

## 7. Điểm chạm với mã sẵn có (Q19)

Toàn bộ tính năng nằm trong **tệp mới**. Mã sẵn có chỉ bị sửa đúng 6 dòng:

| Tệp sẵn có | Sửa gì | Số dòng |
|---|---|---|
| `server/index.js` | `import { registerDocRoutes }` + gọi 1 lần | 2 |
| `web/src/App.jsx` | thêm tab `📚 Tài liệu`, đổi tên tab cũ thành `Agile` | 1 |

**Không sửa** `server/store.js` (hoặc `server/store/*` nếu nhánh đó đã có PR #11) — docgen tự lo
lưu trữ, xem §4.

Tệp mới: `server/routes/docgen.js` · `server/store/docgen.js` · `server/docgen/*.js` ·
`agile-studio/docgen/*.py` · `web/src/docs/*.jsx`.

**Vì sao phải kỹ chỗ này:** PR #4, #7, #8, #10, #11, #12, #13 đều đang chờ maintainer và đều đụng
`server/index.js` / `server/store*`. Nếu docgen viết thẳng vào những tệp đó thì mỗi lần maintainer
merge một PR là một lần rebase đau. Với 3 dòng chạm, rebase gần như không va.

**Nhánh docgen tách off `main`, không xếp chồng lên stack #4→#13.** Sau khi làm xong có thể merge
vào nhánh làm việc cá nhân để dùng, như cách các feature 01–18 đang làm.

## 8. Quy ước

- Comment trong code **tiếng Anh**; chuỗi giao diện **tiếng Việt**.
- `docs/issues/` là thư mục riêng của chủ repo — **không đẩy lên** PR upstream.
- README gốc của repo là **tiếng Anh** → phần hướng dẫn D8 viết thêm cũng tiếng Anh, cùng giọng.
