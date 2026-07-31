// Nơi lưu sẵn khi xuất tài liệu, và kiểm tra "thư mục này có bị git bỏ qua không".
//
// Vì sao cần: trước đó hộp Xuất bắt người dùng bấm "Chọn…" rồi lội qua hộp thoại native mỗi lần, hoặc
// tự gõ đường dẫn. Ba nơi dưới đây phủ gần hết trường hợp thật, nên bấm một cái là xong.
//
// Cảnh báo gitignore là để tránh một lỗi cụ thể và tốn kém: xuất 6 tệp .docx hàng MB vào một thư mục
// nằm trong repo git chưa được ignore, rồi `git add .` — repo phình vĩnh viễn vì .docx là binary.
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { DATA_DIR } from "../store/docgen.js";

const pexecFile = promisify(execFile);
const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Thư mục tải về theo từng OS. Không đọc registry/XDG: sai thì chỉ mất một nút gợi ý, không đáng
// đánh đổi bằng việc gọi thêm tiến trình con lúc mở hộp thoại.
function downloadsDir() {
  const home = homedir();
  for (const name of ["Downloads", "Tải xuống", "Descargas", "Téléchargements"]) {
    const p = join(home, name);
    if (existsSync(p)) return p;
  }
  return join(home, "Downloads");
}

export const DEST_REPO = join(APP_ROOT, "exports");
// Không còn là một nút gợi ý (chủ repo bỏ "Thư mục dữ liệu Studio": <dataDir> là chỗ của state và
// log, người dùng không có việc gì phải mở nó để lấy tài liệu). Vẫn export vì test dùng nó làm một
// đường dẫn CHẮC CHẮN nằm ngoài repo git.
export const DEST_DATA = join(DATA_DIR, "exports");

// Danh sách nút. `id` là thứ UI ghi nhớ, không phải đường dẫn — đổi máy thì đường dẫn khác nhưng nút
// vẫn đúng ý.
export function destCandidates() {
  return [
    { id: "repo", label: "Trong repo agile-studio", path: DEST_REPO,
      hint: "exports/ — đã được .gitignore, mở bằng IDE ngay được. Tiện nhất khi đang phát triển.",
      preferred: true },
    { id: "downloads", label: "Tải xuống", path: downloadsDir(),
      hint: "Thư mục tải về của hệ điều hành. Chỗ ai cũng biết tìm, không làm bẩn repo." },
  ];
}

// Thư mục đích có nằm trong repo git mà CHƯA được ignore không.
// `git check-ignore` là câu trả lời đúng duy nhất: nó tính cả .gitignore lồng nhau, .git/info/exclude
// và core.excludesFile — tự đọc .gitignore rồi so chuỗi thì sai trong quá nửa trường hợp thật.
export async function gitIgnoreStatus(dir) {
  const out = { inRepo: false, ignored: false, repoRoot: null, checked: false };
  if (!dir) return out;
  // Thư mục chưa tồn tại thì hỏi thư mục cha — nó vẫn nằm trong cùng repo.
  let probe = dir;
  for (let i = 0; i < 6 && !existsSync(probe); i++) probe = dirname(probe);
  if (!existsSync(probe)) return out;
  try {
    const { stdout } = await pexecFile("git", ["rev-parse", "--show-toplevel"],
      { cwd: probe, windowsHide: true });
    out.repoRoot = stdout.trim();
    out.inRepo = !!out.repoRoot;
  } catch { return out; }          // không phải repo git → không có gì phải cảnh báo
  out.checked = true;
  // Hỏi về một đường dẫn CON, không phải bản thân thư mục.
  //
  // Lý do: mẫu `exports/` (có dấu gạch cuối) chỉ khớp thư mục, và `git check-ignore exports` trả
  // "không ignore" khi thư mục chưa tồn tại — git không biết nó là thư mục. Hộp Xuất kiểm TRƯỚC khi
  // tạo thư mục, nên đúng lúc cần nhất thì câu trả lời sẽ sai. Một tệp bên trong thư mục bị ignore
  // thì cũng bị ignore, và câu hỏi đó git trả lời đúng dù đường dẫn có tồn tại hay không.
  const child = join(dir, ".agile-studio-probe");
  try {
    // exit 0 = bị ignore, exit 1 = không. `-q` để không phải parse stdout.
    await pexecFile("git", ["check-ignore", "-q", child], { cwd: probe, windowsHide: true });
    out.ignored = true;
  } catch { out.ignored = false; }
  return out;
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function dirInfo(dir) {
  try { const st = statSync(dir); return { exists: true, isDir: st.isDirectory() }; }
  catch { return { exists: false, isDir: false }; }
}

// Mở thư mục bằng file manager của OS. Chỉ mở THƯ MỤC, không mở tệp: mở tệp .docx là chạy Word, và
// đó không phải việc một nút "mở thư mục" được phép làm sau lưng người dùng.
export async function revealDir(dir) {
  if (!dir || !dirInfo(dir).exists) throw new Error("Thư mục không tồn tại: " + dir);
  if (process.platform === "win32") {
    // explorer.exe trả exit code ≠ 0 kể cả khi mở thành công — đừng coi đó là lỗi.
    try { await pexecFile("explorer.exe", [dir], { windowsHide: true }); } catch { /* xem chú thích */ }
    return true;
  }
  if (process.platform === "darwin") { await pexecFile("open", [dir]); return true; }
  await pexecFile("xdg-open", [dir]);
  return true;
}
