# Engineering Standards (agent) — The Boys

Bản đồng bộ từ org repo **[theboysvn/engineering-standards](https://github.com/theboysvn/engineering-standards)**.
Đây là luật để agent (Claude Code) thực thi khi đóng góp vào repo của nhóm. Bản đầy đủ cho người đọc:
[README trên repo đó](https://github.com/theboysvn/engineering-standards/blob/main/README.md).

## Gate (bắt buộc, không phá)

- **KHÔNG tạo/đẩy/merge bất cứ thứ gì lên upstream khi chưa được người dùng duyệt rõ ràng.** Quyền
  collaborator ≠ sự cho phép. Mọi hành động chạm upstream (tạo issue, push nhánh, mở PR, đổi base,
  merge) đều phải hỏi trước.
- **KHÔNG push thẳng `main`.** Mọi thay đổi đi qua Pull Request.
- **KHÔNG kèm file riêng tư/nội bộ** (`docs/issues/`, ghi chú bàn giao, `.env`, secret) vào PR gửi
  upstream. Kiểm tra `git ls-tree` trước khi mở PR.

## Mô hình: fork-based Pull Request

- `origin`/`upstream` có thể bị đặt **ngược** trên máy này (`origin` = upstream `TranDuy13`,
  `fork` = fork của người dùng). Xác minh `git remote -v` trước mỗi push.
- Đồng bộ `main` với upstream trước khi tạo nhánh; rebase, không merge.
- Một nhánh = một việc. Push lên fork. Base PR = `upstream:main` (đổi lại vì GitHub mặc định trỏ fork).
- Nhánh cũ: `git rebase upstream/main` + `git push --force-with-lease`.

## Branch & commit

- Prefix: `feat/ fix/ chore/ ci/ docs/ refactor/ test/`.
- Conventional Commits cho commit và tiêu đề PR: `type(scope): mô tả`.
- **Một PR = một mối bận tâm.** Không gộp việc không liên quan.

## Issue & Pull Request

- Một issue = một vấn đề; tiêu đề rõ loại. Non-trivial: đề xuất mở issue thảo luận trước khi code.
- PR nhỏ, một concern, mô tả (làm gì/vì sao/đánh đổi/kiểm thử), `Fixes #N`.
- Mở **draft PR** cho CI chạy trước; ready khi CI xanh. Tự đọc lại diff trước khi xin review.

## Review, merge & thông báo

- `main` bật branch protection: CI xanh + ≥1 review + cấm force-push. Squash-merge mặc định.
- Trước khi push bản sửa: kiểm tra nhánh có commit mới của người khác → rebase.
- **Request review** (không @mention spam); `CODEOWNERS` để tự động request; `Fixes #N` tự đóng issue
  và báo người theo dõi khi merge.

## Tham chiếu (bản đầy đủ có sơ đồ)

- [Vận hành quy mô lớn & Review/Merge](https://github.com/theboysvn/engineering-standards/blob/main/docs/scaling-and-review.md)
- [Thông báo & phối hợp maintainer](https://github.com/theboysvn/engineering-standards/blob/main/docs/notifications.md)
