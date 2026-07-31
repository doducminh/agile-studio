# Prompt mở phiên mới — làm D1

Dán toàn bộ khối dưới đây vào phiên Claude Code mới, mở tại `e:\gits\agile-studio`.

---

Làm **feature D1 — Tạo bộ tài liệu & chốt dàn ý**, thuộc tính năng "Tài liệu sản phẩm" (docgen).

## Đọc trước khi làm

Đọc theo đúng thứ tự này, đừng bỏ qua:

1. `docs/issues/19-docgen/D1-tao-bo-tai-lieu-va-dan-y.md` — spec của việc cần làm
2. `docs/issues/19-docgen/README.md` — 22 quyết định đã chốt (Q1–Q22), mô hình dữ liệu, lược đồ IR,
   điểm chạm với mã sẵn có
3. `docs/issues/19-docgen/RULESET.md` — 11 nguyên tắc thiết kế, hợp đồng trình bày, tiêu chí chấm
   điểm, luật ngôn ngữ, ghi chú kỹ thuật
4. `docs/issues/19-docgen/mockup.html` — giao diện đã duyệt. **Mở bằng trình duyệt để xem**
   (`file:///E:/gits/agile-studio/docs/issues/19-docgen/mockup.html`), đừng chỉ đọc mã HTML.
   D1 tương ứng màn hình **MH 1, MH 2, MH 3**.

Mọi quyết định đã chốt với chủ repo. Nếu spec mâu thuẫn với ý bạn, **hỏi lại**, đừng tự đổi.

## Ràng buộc bắt buộc

**Nhánh.** Tạo `feat/docgen-d1` tách off **`main`**, không tách off `personal/local-work`.

**Trên `main` chỉ có `server/store.js`** (124 dòng, đọc/ghi cả tệp JSON mỗi lần gọi). **Không có**
`server/store/state.js`, `makeStore()`, `emptyData()`, `normalizeData()`, `docFiles` — những thứ đó
thuộc PR #11 đang chờ maintainer. Đừng viết code dựa vào chúng.

**Điểm chạm tối đa 3 dòng** vào mã sẵn có:

- `server/index.js` — 2 dòng: `import { registerDocRoutes }` + gọi một lần
- `web/src/App.jsx` — 1 dòng: thêm tab `📚 Tài liệu`, đổi tên tab "Tài liệu" cũ thành `Agile`
- **Không sửa** `server/store.js`. Docgen tự lưu vào `<DATA_DIR>/docgen.json` qua
  `server/store/docgen.js`.

Lý do: PR #4, #7, #8, #10, #11, #12, #13 đang chờ maintainer và đều đụng `server/index.js` /
`server/store*`. Chạm ít thì rebase gần như không va.

**Ngôn ngữ.** Comment trong code **tiếng Anh**. Chuỗi giao diện **tiếng Việt**. Tên mục và tên tài
liệu do chuẩn quy định thì **giữ nguyên tiếng Anh** kèm tooltip giải thích một dòng bằng tiếng Việt
(RULESET §2/N11) — `Building Block View` chứ không phải "khung nhìn khối".

**Giao diện.** Dùng lại design token và lớp CSS sẵn có trong `web/src/styles.css`
(`--surface`, `--accent`, `.pill`, `.bar`, `.tabs`). Không thêm hệ màu, không thêm font, không thêm
thư viện UI.

## Phạm vi D1

Kết thúc D1 là: tạo được một bộ tài liệu theo chuẩn quốc tế, agent khảo sát mã nguồn thật rồi đề
xuất dàn ý, người dùng sửa và duyệt được. **Chưa viết nội dung** (đó là D2).

Phần nặng nhất **không phải code mà là khai báo 5 chuẩn** trong `server/docgen/standards/` — mỗi mục
phải có `kind`, `hint` (chính là nội dung tooltip), `from` (nguồn dữ liệu gợi ý) và `accept` (điều
kiện để tính mục đó là ĐẠT). Làm đủ cả 5 chuẩn, đừng để dồn sang feature sau.

## Cách làm việc

- Chạy thử thật: `cd agile-studio && npm run dev` → API `:4311`, web `:5311`. Node 26.
- Kiểm tra build: `cd agile-studio && npx vite build --config web/vite.config.js`
- Làm xong thì chạy đủ **12 ca kiểm thử** ở cuối spec D1 và báo kết quả thật — ca nào không đạt thì
  nói rõ, đừng bỏ qua.
- Ca số 11 kiểm chính điểm chạm: `git diff --stat main..HEAD` chỉ được có `server/index.js` (+2) và
  `web/src/App.jsx` (+1) trong nhóm tệp sẵn có.

## TUYỆT ĐỐI KHÔNG

- **Không tạo issue, không tạo PR, không push.** Chủ repo duyệt kết quả trước, rồi mới tới bước đó.
- **Không publish artifact.**
- **Không** commit vào `main` hay `personal/local-work`.
- **Không** đẩy `docs/issues/` lên bất kỳ PR nào — đó là thư mục riêng của chủ repo.
- **Không** nhắc tới tài liệu, sản phẩm hay khách hàng nào của chủ repo trong code, comment hay
  chuỗi giao diện. Dữ liệu mẫu dùng tên hư cấu.

## Khi xong

Báo cáo ngắn gọn: đã làm gì, kết quả 12 ca kiểm thử, chỗ nào lệch spec và vì sao, việc gì còn lại.
Rồi **dừng chờ chủ repo duyệt**.

---

## Ghi chú cho người dán prompt (không cần dán phần này)

- `CLAUDE.md` ở gốc repo tự nạp vào phiên mới, đã có phần bàn giao về docgen nên phiên mới sẽ nắm
  được bối cảnh chung ngay cả trước khi đọc spec.
- Nếu muốn phiên mới làm luôn cả **D3**, thêm một dòng: "Sau khi D1 xong và tôi duyệt, làm tiếp D3."
  Nhưng đã chốt là **D1 một mình** nên mặc định không cần.
- Sau khi D1 được duyệt, muốn dùng ngay thì merge `feat/docgen-d1` vào `personal/local-work`
  bằng `--no-ff`, giống cách các feature 01–18 đang làm.
