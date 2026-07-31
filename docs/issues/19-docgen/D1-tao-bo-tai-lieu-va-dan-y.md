# D1 — Tạo bộ tài liệu & chốt dàn ý

**Type:** Feature · **Priority:** P1 · **Effort:** **L** · **Depends on:** — · **Mockup:** MH 1, MH 2, MH 3

> Ước lượng ban đầu là M — sai. Feature này gồm mô hình dữ liệu, khai báo 5 chuẩn, 6 nhóm API,
> tab mới, wizard 3 bước, cây dàn ý kéo thả, hệ thống preset, quy ước xác nhận token, và prompt
> khảo sát. Riêng cây kéo thả và phần khai báo chuẩn đã không nhỏ.

## Vấn đề

Agile Studio đang chỉ sinh tài liệu agile nội bộ (PM/BA/DA). Muốn có tài liệu sản phẩm theo chuẩn
quốc tế thì phải ra ngoài app và tự viết script dựng `.docx` bằng tay.

Vấn đề lớn nhất không phải là viết — mà là **quyết định viết cái gì**. Khung tài liệu tự nghĩ ra
thường thiếu bối cảnh, stakeholder, thuộc tính chất lượng, Architecture Decisions, Glossary.

## Kỳ vọng

Trong project, tạo được một **bộ tài liệu** theo một chuẩn quốc tế; agent đọc mã nguồn thật rồi
**đề xuất dàn ý**; người dùng sửa và **duyệt** rồi mới viết. Dàn ý đã duyệt là mẫu số để tính tiến độ.

Feature này dừng ở "đã có dàn ý được duyệt" — chưa viết nội dung (D2).

## Cách làm

### Nhánh và điểm chạm với mã sẵn có (Q19)

Nhánh `feat/docgen-d1` tách off **`main`**, không tách off nhánh làm việc cá nhân.

> **Lưu ý quan trọng:** trên `main` chỉ có `server/store.js` (124 dòng, đọc/ghi cả tệp JSON mỗi lần
> gọi). **Không có** `server/store/state.js`, `makeStore()`, `emptyData()`, `docFiles` — những thứ đó
> thuộc PR #11 đang chờ maintainer. Đừng viết code dựa vào chúng.

Tất cả nằm trong tệp mới. Mã sẵn có sửa đúng **3 dòng**:

```js
// server/index.js — 2 dòng
import { registerDocRoutes } from "./routes/docgen.js";
registerDocRoutes(app, broadcast);

// web/src/App.jsx — 1 dòng: thêm tab 📚 Tài liệu, đổi tên tab "Tài liệu" cũ thành "Agile"
```

Tệp mới: `server/routes/docgen.js` · `server/store/docgen.js` · `server/docgen/survey.js` ·
`server/docgen/standards/*.js` · `web/src/docs/{DocJobs,DocWizard,DocOutline,TokenConfirm}.jsx`.

### Khai báo 5 chuẩn — `server/docgen/standards/`

**Đây là phần thiết kế nặng nhất, không phải phần code nặng nhất.** Mỗi chuẩn là một tệp dữ liệu
khai báo: danh sách tài liệu, danh sách mục của từng tài liệu, `kind` theo Diátaxis, nguồn dữ liệu
gợi ý, và **`accept`** — điều kiện để tính mục đó là ĐẠT (dùng cho tiêu chí "Đầy đủ" của D6).

```js
{ id: "arc42", label: "arc42 + C4", docs: [{ key: "sad", title: "Software Architecture Document",
  sections: [
    { num: "1", title: "Introduction and Goals", kind: "explanation", required: true,
      hint: "Bài toán cần giải, mục tiêu chất lượng, các bên liên quan",
      from: ["agile-docs", "readme"],
      accept: { minBlocks: 2, minSources: 1 } },
    { num: "5", title: "Building Block View", kind: "reference", required: true,
      hint: "Phân rã hệ thống thành các khối lồng nhau theo từng cấp",
      from: ["project-structure"],
      accept: { minBlocks: 2, mustHave: ["table"], minSources: 3 } },
    …
  ] }] }
```

`hint` chính là nội dung tooltip trong giao diện (Q18) — khai báo một chỗ, dùng cả ở UI lẫn ở D8.

Năm chuẩn phải khai báo **đủ mục** trong D1, không để dồn sang D6:

| Chuẩn | Tài liệu | Số mục |
|---|---|---|
| `arc42` | Software Architecture Document | 12 |
| `iso29148` | Software Requirements Specification | 9 |
| `ieee1016` | Software Design Description | 11 |
| `iso26514` | User Guide · Administrator Guide | 18 |
| `iso15289` | 6 tài liệu (bảng dưới) | 41 |

Bộ `iso15289` — khung đề xuất, mỗi tài liệu 5–8 mục:

| Tài liệu | Mục |
|---|---|
| Software Design Description | Introduction · References · Definitions · Context · Design overview · Design views · Interfaces · Rationale |
| Database Design Description | Introduction · Data model overview · Entities / collections · Fields & types · Relationships & constraints · Indexes · Migration & seed |
| Deployment & Installation | Introduction · Server requirements (BE/FE tách riêng) · Prerequisites · Build · Install & configure · Verification · Rollback |
| Configuration Management | Introduction · Configuration items · Per-environment values · Secrets handling · Change control |
| Operations Guide | Introduction · Routine operations · Monitoring & alerts · Backup & restore · Incident handling · Maintenance schedule |
| Repository Structure | Introduction · Directory tree · Role of each area · Build artifacts · Conventions |

> **Cần kiểm chứng:** danh sách mục của `iso15289` ở trên là khung hợp lý theo thực hành phổ biến,
> chưa đối chiếu từng chữ với văn bản chuẩn. Trước khi phát hành ra ngoài nên rà lại với bản chuẩn
> gốc. `arc42` thì có tài liệu công khai nên chắc chắn hơn.

### Store — `server/store/docgen.js` (độc lập)

Module tự quản lý tệp riêng `<DATA_DIR>/docgen.json`, **không import gì từ `store.js`**:

- Nạp một lần lúc khởi động; giữ trong bộ nhớ; ghi lại có debounce (~300ms) sau mỗi lần mutate.
- `DATA_DIR` xác định giống `store.js` đang làm: `join(homedir(), ".agile-studio")`. Nếu nhánh đang
  chạy có `config.dataDir` (PR #03) thì dùng nó — dò bằng optional import, không phụ thuộc cứng.
- Tệp chưa tồn tại → khởi tạo rỗng, không lỗi. Tệp hỏng → log rõ lý do, chạy với dữ liệu rỗng, và
  **không ghi đè tệp hỏng** (đổi tên thành `docgen.json.bak` trước).
- API SYNC: `{ listJobs, getJob, createJob, patchJob, deleteJob, getPlan, putPlan, approvePlan,
  listStandards, listPresets, savePreset, deletePreset }`.

### Route — `server/routes/docgen.js`

```
GET|POST   /api/projects/:id/doc-jobs
GET|PATCH|DELETE /api/doc-jobs/:jid
GET|PUT    /api/doc-jobs/:jid/plan
POST       /api/doc-jobs/:jid/plan/approve      { engine }
POST       /api/doc-jobs/:jid/plan/revise       { text }
POST       /api/doc-jobs/:jid/plan/save-preset
GET        /api/doc-standards
GET|POST|PUT|DELETE /api/doc-presets
GET        /api/doc-scan/git-authors?path=      gom mọi identity của một người từ `git log`
GET        /api/doc-scan/preview                { nguồn, scope } → số commit / thư mục / file
```

Trạng thái job: `draft → surveying → plan-review`. Giai đoạn `surveying` chạy **một session** qua
`runner.js` — tái dùng nguyên tạm dừng, đổi account, đo token. Kết quả: `facts` dùng chung cho D2 +
dàn ý đề xuất. WS `doc:job` khi trạng thái đổi.

### Dự báo chi phí trước khi duyệt (Q22)

Màn duyệt dàn ý hiện **tổng token ước tính** cho cả bộ, không chỉ nhãn từng nút:

- ước tính mỗi mục = chi phí cố định + (số nguồn gắn vào mục × kích thước trung bình của nguồn)
- tổng + quy đổi ra **số cửa sổ 5h ước tính** của account đang chọn
- vượt ngưỡng → gợi ý tắt bớt mục `required: false`, và hiện tổng mới ngay khi tắt

Ghi rõ đây là **ước tính có sai số lớn**; con số thật cập nhật dần khi chạy.

### Web

- **Tab `📚 Tài liệu`** trong `App.jsx`; đổi tên tab "Tài liệu" cũ thành **`Agile`** (Q17).
- `DocJobs.jsx` — bảng công việc. Thẻ ghi rõ **chuẩn**, **số file**, và **liệt kê tên file**.
- `DocWizard.jsx` — 3 bước:
  1. **Phạm vi & nguồn** — nguồn chính là project hiện tại, **khoá** (Q6). Phạm vi `Toàn bộ` /
     `Theo feature`; ô tích **"Chỉ phần đóng góp của tác giả (git)"** độc lập với hai lựa chọn đó.
  2. **Bộ tài liệu** — chọn chuẩn; bảng mục kèm tooltip; **bảng lịch sử phiên bản**;
     bảng **Kiểm soát tài liệu** (dò từ mẫu ở D3/D4, D1 chỉ chọn dòng nào bật).
  3. **Trình bày & văn phong** — mẫu Word, 4 văn phong, ngôn ngữ, độ sâu.
- `DocOutline.jsx` — cây tài liệu → mục: kéo thả, bật/tắt, đổi tên, thêm mục, ô "yêu cầu agent sửa
  dàn ý"; chọn **cách chạy** (Q9); **dự báo chi phí**; nút lưu/áp **preset toàn cục**.
- `TokenConfirm.jsx` — quy ước cảnh báo token (Q13): mọi nút hiện ước tính; **chỉ việc > 50K** mở
  hộp thoại, có ô "không hỏi lại" nhớ theo *loại việc*. Ngưỡng chỉnh ở Cài đặt → Chung.

## Kiểm thử

1. Tạo bộ tài liệu trong project A: không có cách nào thêm mã nguồn của project B; nguồn chính khoá
   lại, không xoá được.
2. Chọn "Toàn bộ sản phẩm" + tích "theo đóng góp của tác giả" → xem trước báo đúng số commit;
   bỏ tích → quét toàn bộ contributor.
3. Chọn `arc42` → thẻ hiện "1 tài liệu · 12 mục"; chọn `iso15289` → "6 tài liệu · 41 mục", liệt kê
   đúng tên file.
4. Rê chuột vào tên mục → hiện tooltip đúng `hint` khai báo trong chuẩn.
5. Job dừng đúng ở `plan-review`; sửa/kéo/tắt mục rồi duyệt → kế hoạch đóng băng đúng số mục đã chọn.
6. Dự báo chi phí đổi ngay khi tắt/bật mục; quy đổi cửa sổ 5h khớp với usage của account đang chọn.
7. "Yêu cầu agent sửa dàn ý" → dàn ý mới phản ánh đúng yêu cầu, `revision` tăng.
8. Lưu preset ở project A, áp ở project B → dàn ý nạp đúng và **sửa lại được** sau khi áp.
9. Nút khảo sát (~180K) mở hộp thoại; nút "đề xuất lại dàn ý" (~40K) chạy thẳng; tích "không hỏi lại"
   → lần sau không hỏi; đổi ngưỡng xuống 10K → nút 40K bắt đầu hỏi.
10. Tắt server giữa lúc khảo sát → khởi động lại thấy job ở trạng thái lỗi, "Tiếp tục" chạy lại được.
11. **Điểm chạm:** `git diff --stat main..HEAD` — chỉ `server/index.js` (+2) và `web/src/App.jsx`
    (+1) nằm trong danh sách tệp sẵn có bị sửa. `server/store.js` **không** xuất hiện.
12. **Dữ liệu bền:** tạo job → tắt server → bật lại → job còn nguyên. Xoá `docgen.json` → app vẫn
    khởi động bình thường với danh sách rỗng. Làm hỏng `docgen.json` → app chạy được, log lý do,
    tệp hỏng được đổi tên thành `.bak` chứ không bị ghi đè.

## Không thuộc phạm vi

Viết nội dung và xuất `.docx` (D2) · mẫu Word (D3, D4) · chấm điểm (D6) · bắt lỗi (D7).
