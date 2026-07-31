# Prompt mở phiên mới — làm D2

Dán toàn bộ khối dưới đây vào phiên Claude Code mới, mở tại `e:\gits\agile-studio`.

---

Làm **feature D2 — Viết nội dung, theo dõi tiến độ & xuất `.docx` tối thiểu**, thuộc tính năng
"Tài liệu sản phẩm" (docgen).

## Trạng thái hiện tại của repo

- **D1 đã làm xong** trên nhánh `feat/docgen-d1` (5 commit, tách off `main`).
- D1 **đã được merge vào `personal/local-work`** bằng `--no-ff` (commit merge `5ac3ecc`) và đã test
  chạy tốt ở đó — cả docgen lẫn hồi quy phần cũ.
- **Chưa push, chưa tạo issue, chưa tạo PR.** Chủ repo sẽ quyết định lúc nào làm việc đó.
- Cây làm việc của `personal/local-work` có **sửa chưa commit của chủ repo**: `CLAUDE.md` và
  `docs/issues/README.md`, cộng thư mục untracked `docs/issues/19-docgen/`.

## Đọc trước khi làm

Đọc theo đúng thứ tự này, đừng bỏ qua:

1. `docs/issues/19-docgen/D2-viet-noi-dung-va-tien-do.md` — spec của việc cần làm
2. `docs/issues/19-docgen/D1-BANGIAO.md` — **D1 đã làm gì, API nào đã có, quyết định nào đã chốt,
   việc gì còn lại**. Đọc kỹ, D2 nối thẳng vào đây
3. `docs/issues/19-docgen/README.md` — 22 quyết định đã chốt (Q1–Q22), mô hình dữ liệu, **lược đồ IR
   ở §5** (D2 sinh ra chính lược đồ này)
4. `docs/issues/19-docgen/RULESET.md` — 11 nguyên tắc, hợp đồng trình bày §3 (theme mặc định cho
   `render.py`), luật ngôn ngữ §2/N11, **ghi chú kỹ thuật `python-docx` §6 — đọc trước khi viết
   `render.py`**, đó là danh sách những cái bẫy đã mất công dò ra rồi
5. `docs/issues/19-docgen/mockup.html` — giao diện đã duyệt. **Mở bằng trình duyệt để xem**
   (`file:///E:/gits/agile-studio/docs/issues/19-docgen/mockup.html`), đừng chỉ đọc mã HTML.
   D2 tương ứng màn hình **MH 4** (hai kiểu xem tiến độ) và **MH 7** (xuất bản)

Mọi quyết định đã chốt với chủ repo. Nếu spec mâu thuẫn với ý bạn, **hỏi lại**, đừng tự đổi.

## Bắt đầu thế nào cho đúng

Cây làm việc đang có sửa chưa commit của chủ repo. **Cất trước khi đổi nhánh, đừng commit hộ:**

```bash
git stash push -m "park owner docs edits" -- CLAUDE.md docs/issues/README.md
git checkout -b feat/docgen-d2 feat/docgen-d1
```

Xong việc thì trả lại:

```bash
git checkout personal/local-work && git stash pop
git merge --no-ff feat/docgen-d2
```

> Nhánh `feat/docgen-d2` tách off **`feat/docgen-d1`**, không phải off `main` — D2 dùng store,
> route và dàn ý của D1. Khi D1 lên PR thì D2 xếp chồng lên nó.

## Ràng buộc bắt buộc

**Điểm chạm với mã sẵn có: 0 dòng.** D1 đã mở sẵn mọi chỗ cần thiết —
`registerDocRoutes(app, broadcast)` trong `server/index.js` và tab `📚 Tài liệu` trong `App.jsx`.
D2 **chỉ thêm route vào `server/routes/docgen.js` và tệp mới**: không sửa `server/index.js`,
không sửa `web/src/App.jsx`, không sửa `server/store.js` hay `server/store/*` ngoài
`store/docgen.js`, không sửa `web/src/styles.css`.

Kiểm bằng: `git diff --stat feat/docgen-d1..HEAD` — phải **không có tệp sẵn có nào** ngoài
`server/routes/docgen.js`, `server/store/docgen.js` và các tệp `server/docgen/*`,
`web/src/docs/*` do D1 tạo ra.

**Ngôn ngữ.** Comment trong code **tiếng Anh**. Chuỗi giao diện **tiếng Việt**. Tên mục và tên tài
liệu do chuẩn quy định thì **giữ nguyên tiếng Anh** kèm tooltip giải thích một dòng bằng tiếng Việt
(RULESET §2/N11).

**Giao diện.** Dùng lại `web/src/docs/docgen.css` (mọi luật bọc trong `.dg`) và thành phần đã có:
`Dialog.jsx` (modal + `DialogButtons` + `Field`), `TokenConfirm.jsx` (`shouldAsk`, `TokenChip`,
ngưỡng token toàn cục qua `/api/agent-settings`). Không thêm hệ màu, không thêm font, không thêm
thư viện UI. Bố cục theo đúng bài học của D1: cột nội dung ăn bề ngang, cột phụ `position:sticky`
chỉ chứa thứ để ra quyết định, `min-width:0` cho mọi track của grid, khối dài chia cột full width
ở dưới thay vì nhồi vào cột hẹp.

## Những gì D1 để lại — dùng lại, đừng viết lại

- `server/store/docgen.js` — hai bag `ir` và `exports` đã khai sẵn trong `empty()`. Store có chốt
  chặn trộn dữ liệu khi hai tiến trình cùng ghi, và tự dò `config.dataDir` khi nhánh có PR #03.
- `server/docgen/plan.js` — dàn ý đã duyệt. `plan.docs[].sections[]` có `id`, `num`, `title`,
  `kind`, `hint`, `accept`, `sources`, `status`, `enabled`, `origin`; `plan.docs[].maxDepth` là số
  cấp mục tối đa của tài liệu đó (2 hoặc 3).
- `server/docgen/estimate.js` — mô hình ước tính token; D2 nên thay dần bằng số đo thật.
- `server/docgen/survey.js` + `claudeBin.js` — cách chạy Claude qua `runner.js`. **Hai bài học
  phải giữ:** (1) cho agent **ghi kết quả ra tệp rồi đọc lại**, đừng parse từ stream vì stream chỉ
  mang 400 ký tự đầu của một khối text; (2) CLI có lúc thoát khác 0 *sau khi* đã ghi xong tệp —
  tệp hợp lệ thì thắng exit code.
- `server/docgen/tones.js` — 4 văn phong, mỗi cái có `guidance` viết sẵn **để nhét thẳng vào prompt
  viết**.
- `job.facts` — kết quả khảo sát của D1 (stack, số liệu, cảnh báo). Đưa vào prompt viết để agent
  không phải đọc lại repo từ đầu.
- `server/docgen/seed.js` — **thêm dữ liệu mẫu cho D2** (IR đã viết, mục `edited`, mục `stale`,
  bản xuất đã có) để xem giao diện tiến độ mà không phải chạy thật.

## Cách làm việc

- Chạy thử thật: `cd agile-studio && npm run dev` → API `:4311`, web `:5311`. Node 26.
- Kiểm tra build: `cd agile-studio && npx vite build --config web/vite.config.js`
- Seed dữ liệu mẫu **qua API, không chạy script khi app đang mở**:
  `curl -X POST http://localhost:4311/api/projects/<id>/doc-seed`
- Làm xong thì chạy đủ **13 ca kiểm thử** ở cuối spec D2 và báo kết quả thật — ca nào không đạt thì
  nói rõ, đừng bỏ qua.
- **Đừng làm hỏng D1**: chạy lại vài ca của D1 sau khi xong (tạo bộ tài liệu, duyệt dàn ý, mở khoá,
  preset) — danh sách ở `D1-BANGIAO.md` §5.

## TUYỆT ĐỐI KHÔNG

- **Không tạo issue, không tạo PR, không push.** Chủ repo tự quyết định lúc nào làm.
- **Không publish artifact.**
- **Không** commit vào `main` hay `personal/local-work` (merge `--no-ff` vào `personal/local-work`
  sau khi xong thì được, và chỉ khi chủ repo đồng ý).
- **Không** đẩy `docs/issues/` lên bất kỳ PR nào — đó là thư mục riêng của chủ repo.
- **Không** nhắc tới tài liệu, sản phẩm hay khách hàng nào của chủ repo trong code, comment hay
  chuỗi giao diện. Dữ liệu mẫu dùng tên hư cấu.
- **Không chạy hai server cùng lúc trên một `docgen.json`** — hai tiến trình cùng ghi thì đứa sau
  đè đứa trước (đã mất dữ liệu hai lần vì chuyện này). Muốn test riêng thì
  `SERVER_PORT=4399 DATA_DIR=<thư mục tạm> STORAGE_DRIVER=json node server/index.js`.

## Khi xong

Báo cáo ngắn gọn: đã làm gì, kết quả 13 ca kiểm thử, chỗ nào lệch spec và vì sao, việc gì còn lại.
Rồi **dừng chờ chủ repo duyệt**.

---

## Ghi chú cho người dán prompt (không cần dán phần này)

- Muốn phiên mới **đánh bóng tiếp D1** thay vì làm D2: dán `D1-BANGIAO.md` §7 "Việc còn lại" kèm
  mô tả chỗ vướng thấy khi dùng thật. Bốn việc chưa kiểm được hết: nhánh "còn N% quota" khi
  `fetchUsage` trả số thật · hộp thoại token bấm trên trình duyệt · agent tách mục cháu khi bật
  3 cấp · đối chiếu danh mục `iso15289` với văn bản chuẩn gốc.
- Muốn **tạo issue + PR cho D1**: nhánh `feat/docgen-d1` sẵn 5 commit;
  `git diff --stat main..feat/docgen-d1` chỉ đụng `server/index.js` (+2) và `web/src/App.jsx` (+6/−1).
  Kế hoạch chi tiết ở `D1-BANGIAO.md` §9.
- Muốn làm **D3** (song song được với D2): nó là nơi ngưỡng token toàn cục và mẫu Word toàn cục
  dọn về đúng chỗ — Cài đặt → Chung, đọc cùng `/api/agent-settings`.
