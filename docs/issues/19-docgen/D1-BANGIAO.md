# D1 — Bàn giao

**Nhánh:** `feat/docgen-d1` (tách off `main`) · **Trạng thái:** làm xong, đã merge vào
`personal/local-work` và test tại đó · **Chưa** push · **chưa** tạo issue · **chưa** tạo PR.

| Commit | Nội dung |
|---|---|
| `68eb9fc` | Nền: 5 chuẩn, store riêng, route, khảo sát, wizard, cây dàn ý, preset, quy ước token |
| `b1b0cec` | Seed dữ liệu mẫu · ngưỡng token toàn cục · mẫu Word theo bộ · xem trước văn phong |
| `fa2391f` | Sửa `spawn claude ENOENT` |
| `4da73e7` | Bố cục lại màn dàn ý (responsive, dialog thật, chọn hàng loạt, flow duyệt) |
| `77cced5` | So sánh 4 văn phong · độ sâu dàn ý theo từng tài liệu |

---

## 1. Điểm chạm với mã sẵn có — vẫn đúng cam kết

```
git diff --stat main..HEAD
  agile-studio/server/index.js   | 2 +          ← import + gọi registerDocRoutes
  agile-studio/web/src/App.jsx   | 6 +-         ← import, đổi tab cũ thành "Agile", thêm tab, nhánh render
  (22 tệp mới)
```

`server/store.js` **không xuất hiện**. `web/src/styles.css` **không bị sửa** — CSS docgen nằm ở
`web/src/docs/docgen.css`, mọi luật bọc trong `.dg`.

> `App.jsx` là **+5/−1** chứ không phải +1 như spec ghi. Một tab cần ba thứ: dòng `import`, nút tab,
> nhánh render. Ép xuống 3 dòng được nhưng phải nhét hai nút tab vào một dòng — xấu mà không giảm
> số hunk (vẫn 3). Đã báo và chủ repo chưa yêu cầu ép lại.

## 2. Tệp mới

```
server/routes/docgen.js         mọi route của docgen
server/store/docgen.js          store riêng <DATA_DIR>/docgen.json, không import gì từ store.js
server/docgen/standards/        vocab · arc42 · iso29148 · ieee1016 · iso26514 · iso15289 · index
server/docgen/survey.js         prompt khảo sát + chạy qua runner.js + đọc kết quả
server/docgen/plan.js           dựng dàn ý từ chuẩn + kết quả khảo sát, merge revision, preset
server/docgen/estimate.js       mô hình ước tính token
server/docgen/gitscan.js        gom identity git, xem trước phạm vi
server/docgen/tones.js          4 văn phong + mẫu cho explanation/reference/howto
server/docgen/claudeBin.js      dò Claude CLI, vá ENOENT mà không sửa runner.js
server/docgen/seed.js           dữ liệu mẫu (hàm dùng chung + CLI)
web/src/docs/DocJobs.jsx        tab 📚 Tài liệu — bảng công việc (MH 1)
web/src/docs/DocWizard.jsx      wizard 3 bước (MH 2)
web/src/docs/DocOutline.jsx     cổng duyệt dàn ý (MH 3)
web/src/docs/TokenConfirm.jsx   quy ước cảnh báo token + ngưỡng toàn cục
web/src/docs/Dialog.jsx         modal dùng chung
web/src/docs/docgen.css         CSS, scope trong .dg
```

## 3. Chạy và xem

```bash
cd agile-studio && npm run dev        # API :4311 · web :5311 · Node 26
npx vite build --config web/vite.config.js   # kiểm tra build
```

**Dữ liệu mẫu** (4 bộ tài liệu + 2 preset, đủ mọi trạng thái, không tốn token):

```bash
curl -X POST http://localhost:4311/api/projects/<id>/doc-seed             # seed
curl -X POST "http://localhost:4311/api/projects/<id>/doc-seed?clear=1"   # xoá
```

> **Đừng** chạy `node server/docgen/seed.js` khi app đang mở: hai tiến trình cùng ghi `docgen.json`,
> đứa ghi sau đè đứa trước (đã mất dữ liệu hai lần vì chuyện này). Script CLI giờ tự từ chối chạy
> khi thấy cổng 4311 đang mở. Store cũng có chốt chặn: thấy `mtime` đổi thì trộn thay vì ghi đè.

## 4. API

```
GET    /api/doc-standards                     5 chuẩn + danh sách tài liệu ghép được + 4 văn phong
GET    /api/doc-standards/:sid/estimate       ước tính trước khi tạo job (?picks= cho bộ tuỳ chọn)
GET|PUT /api/agent-settings                   ngưỡng token TOÀN CỤC · đừng-hỏi-lại · mẫu Word toàn cục
GET|POST /api/doc-presets · PUT|DELETE /:pid
GET    /api/doc-scan/git-authors?path=        gom mọi identity của một người
GET    /api/doc-scan/preview                  số commit/thư mục/file theo phạm vi
GET    /api/doc-scan/pick-docx                hộp thoại chọn mẫu .docx
GET|POST /api/projects/:id/doc-jobs
POST   /api/projects/:id/doc-seed[?clear=1]
GET|PATCH|DELETE /api/doc-jobs/:jid
POST   /api/doc-jobs/:jid/survey              draft|error → surveying → plan-review
POST   /api/doc-jobs/:jid/stop
GET|PUT /api/doc-jobs/:jid/plan
POST   /api/doc-jobs/:jid/plan/approve        { engine } → plan-approved, đóng băng
POST   /api/doc-jobs/:jid/plan/unlock         mở băng, quay lại plan-review
POST   /api/doc-jobs/:jid/plan/revise         { text } → agent đề xuất lại
POST   /api/doc-jobs/:jid/plan/save-preset · /apply-preset
GET    /api/doc-jobs/:jid/estimate[?usage=1]
WS     doc:job · doc:activity
```

Trạng thái job: `draft → surveying → plan-review → plan-approved` (+ `error`).
D2 nối tiếp từ `plan-approved` sang `writing`.

## 5. Kết quả 12 ca kiểm thử

Đạt 10/12 trọn vẹn, 2 ca đạt một phần:

| # | Ca | Kết quả |
|---|---|---|
| 1 | Nguồn chính khoá theo project | **Đạt** |
| 2 | Xem trước theo tác giả git | **Đạt** — repo 6 identity: 117/208 commit khi lọc, 208/208 khi bỏ lọc |
| 3 | Số tài liệu · số mục · tên file | **Đạt** — 12 · 9 · 11 · 2/18 · 6/41 |
| 4 | Tooltip đúng `hint` khai báo | **Đạt** |
| 5 | Dừng ở `plan-review`, duyệt đóng băng | **Đạt** — 21 pending / 3 skipped, mẫu số 21 |
| 6 | Dự báo đổi ngay khi tắt mục | **Đạt một phần** — con số đổi đúng; nhánh "còn N% quota" chưa chạy thật vì `fetchUsage` trả `null` trong môi trường test |
| 7 | Agent sửa dàn ý theo yêu cầu | **Đạt một phần** — `revision` tăng, "gộp 8.2 vào 11" áp đúng; phần "tách thành mục cháu" nay đã mở được bằng tuỳ chọn 3 cấp nhưng **chưa chạy lại ca này với agent thật** |
| 8 | Preset project A → B | **Đạt** |
| 9 | Ngưỡng hỏi token | **Đạt (mức logic)** — hộp thoại chỉ kiểm bằng build, chưa bấm thử trên trình duyệt |
| 10 | Tắt server giữa lúc khảo sát | **Đạt** |
| 11 | Điểm chạm | **Đạt** |
| 12 | Dữ liệu bền / thiếu / hỏng | **Đạt cả ba** |

Khảo sát đã chạy **thật** 3 lần trên repo có thật (~600K token): agent đề xuất bỏ `Deployment View`
vì repo không có hạ tầng, tách `Runtime View` thành 5 kịch bản, phát hiện "không có test suite".

## 6. Quyết định bổ sung so với spec (đã chốt với chủ repo)

| Điểm | Quyết định |
|---|---|
| ISO 15289 41 mục | Bảng trong spec liệt kê 38; **giữ 3 mục bổ sung**: `Environments and Topology`, `Status Accounting and Audit`, `Support and Escalation`. Vẫn còn cảnh báo "khung theo thực hành phổ biến, chưa đối chiếu từng chữ với văn bản chuẩn" |
| Ngưỡng token | Là cấu hình **toàn cục** của Studio (`/api/agent-settings`), chỉnh ngay trong hộp thoại cảnh báo. D3 kéo control về Cài đặt → Chung, đọc cùng endpoint |
| Nguồn | Bỏ "＋ Thư mục mã nguồn của sản phẩm này"; chỉ còn "＋ Tài liệu" (tham chiếu) — mã nguồn luôn là repo của project |
| Mẫu Word | Gán được cho **riêng từng bộ**, mẫu toàn cục là dự phòng. Chọn ở bước 3, bước 2 chỉ hiển thị |
| Sau khi duyệt | **Ở lại màn dàn ý, chuyển chỉ đọc** + banner + toast; có **`🔓 Mở khoá để sửa`** kèm cảnh báo |
| Hộp xác nhận duyệt | Là hộp **"Chốt dàn ý"** (tóm tắt bộ tài liệu), không phải hộp "sẽ tiêu token" — D1 duyệt không tiêu token nào |
| Độ sâu dàn ý | Mặc định **2 cấp**; mở **3 cấp** được, chọn mặc định ở wizard và đổi riêng từng tài liệu ở màn duyệt |
| Xem trước văn phong | Ba loại mục (explanation đổi · reference/howto không đổi) **+ nút so sánh cả 4 văn phong** |

## 7. Việc còn lại của D1

1. **Chạy full flow trên project thật** — chủ repo tự làm, ghi lại chỗ vướng.
2. **Ca 7 chạy lại** với tuỳ chọn 3 cấp để xác nhận agent tách được mục cháu.
3. **Ca 6** — kiểm nhánh "còn N% quota" khi `fetchUsage` trả số thật.
4. **Ca 9** — bấm thử hộp thoại token trên trình duyệt.
5. **`iso15289`** — đối chiếu danh mục mục với văn bản chuẩn gốc trước khi phát hành ra ngoài.
6. **`runner.js`**: `spawn("claude")` không dò đường dẫn và không tắt stdin. Docgen đang tự vá
   (`server/docgen/claudeBin.js` + bỏ qua exit-code khi tệp kết quả hợp lệ). Khi PR #4 merge thì
   bỏ phần vá này. **Nên ghi thành issue riêng.**
7. **Đánh đổi đã biết**: dữ liệu docgen nằm ở tệp riêng nên chưa đi giữa các máy khi dùng Postgres
   (PR #11). Khi PR #11 merge, thay phần đọc/ghi trong `server/store/docgen.js` bằng adapter — đổi
   một tệp, không đổi API.

## 8. Đã merge vào `personal/local-work`

```bash
git checkout personal/local-work
git stash pop                                  # trả lại sửa của chủ repo trên CLAUDE.md + docs/issues/README.md
git merge --no-ff feat/docgen-d1               # → commit merge 5ac3ecc
```

Một xung đột duy nhất: `server/index.js`, cả hai nhánh cùng thêm một dòng `import` sau khối
`scaffold.js` (`workspace.js` vs `routes/docgen.js`) — giữ cả hai. `App.jsx` git tự merge sạch.

**Test sau merge** (chạy ở cổng 4399 với `DATA_DIR` riêng để không đụng app đang chạy):

- Docgen: 5 chuẩn đúng số mục · 4 văn phong · seed 4 bộ · dò được Claude CLI · tắt mục thì dự báo
  đổi · duyệt → đóng băng → chặn sửa → mở khoá · preset · ngưỡng token toàn cục · gom identity git.
- **`docgen.json` bám đúng `config.dataDir`** — đây là điểm đáng lo nhất khi đổi nhánh: trên `main`
  không có `config.js` nên dùng `homedir()`, trên nhánh này optional-import bắt được `dataDir` của
  PR #03. Chạy đúng cả hai.
- Hồi quy phần cũ: `/api/sessions` `/api/settings` `/api/platform` `/api/integrations`
  `/api/schedules` `/api/skills` `/api/projects/:id/{requirements,docs,logs}` — 200 cả 9. Tạo
  project qua store mới (PR #11) vẫn chạy. `vite build` sạch.

> Lúc dọn cây làm việc để tách nhánh, `agile-studio/projects/portal/README.md` đang ở trạng thái
> **đã xoá chưa commit** đã bị khôi phục lại. Nếu định xoá thật thì xoá lại.

## 9. Kế hoạch tạo issue & PR (chưa làm, chờ chủ repo)

`gh` chưa có trên PATH — hoặc cài GitHub CLI, hoặc dán tay lên web.

1. **Đẩy nhánh**: `git push -u origin feat/docgen-d1` (nhánh sạch off `main`; `docs/issues/`
   untracked nên không lọt lên).
2. **Issue**: *"Tài liệu sản phẩm (D1): tạo bộ tài liệu theo chuẩn quốc tế & cổng duyệt dàn ý"*,
   thân bài lấy từ spec D1 (vấn đề → kỳ vọng → phạm vi → không thuộc phạm vi).
3. **PR** `feat/docgen-d1` → `main`, `Closes #<issue>`. Ba điểm phải nêu rõ:
   - **Điểm chạm 3 dòng** → không xếp chồng lên PR #4/#7/#8/#10/#11/#12/#13 đang chờ.
   - **Chồng lấn với PR #4**: `server/docgen/claudeBin.js` vá `spawn claude ENOENT` trong phạm vi
     docgen; PR #4 sửa đúng gốc ở `runner.js`. PR nào merge sau thì gỡ phần vá kia —
     **nên ghi thành issue riêng**.
   - **Đánh đổi đã biết**: docgen lưu tệp riêng nên chưa đi giữa các máy khi dùng Postgres.

**Thứ tự nên làm**: chạy full flow trên project thật trước (§7 liệt kê 4 ca chưa kiểm được hết),
sửa nốt rồi mới push — tránh force-push sau khi PR đã mở.
