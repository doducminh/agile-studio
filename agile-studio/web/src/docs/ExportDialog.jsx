import React, { useEffect, useState } from "react";
import Dialog, { DialogButtons } from "./Dialog.jsx";

// MH 7 — the only place a format and a destination are chosen (Q10). Content lives in the Studio;
// exporting is an action you take when you need a file, including while the set is still being
// written (that is what `draft` is for).
//
// PDF is listed but disabled: it belongs to the PDF feature. Showing it greyed out with the reason
// is more honest than hiding it and letting people wonder whether the app can do PDF at all.

const KEY = "dg:destDir";

export default function ExportDialog({ open, job, plan, perDoc, python, onCancel, onExport }) {
  const [picked, setPicked] = useState([]);
  const [destDir, setDestDir] = useState("");
  const [draft, setDraft] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setPicked((plan?.docs || []).map((d) => d.key));
    setDestDir(localStorage.getItem(`${KEY}:${job?.id}`) || localStorage.getItem(KEY) || "");
    setDraft((job?.progress?.done || 0) < (job?.progress?.sections || 0));
    setErr("");
  }, [open, plan, job]);

  const doneOf = new Map((perDoc || []).map((d) => [d.key, d]));
  const toggle = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const pickDir = async () => {
    const r = await fetch("/api/pick-folder", { method: "POST" }).then((x) => x.json()).catch(() => ({}));
    if (r.path) setDestDir(r.path);
    else if (r.error) setErr(r.error);
  };

  const run = async () => {
    if (!destDir.trim()) return setErr("Chọn nơi lưu trước đã.");
    setBusy(true); setErr("");
    localStorage.setItem(KEY, destDir.trim());
    localStorage.setItem(`${KEY}:${job?.id}`, destDir.trim());
    const e = await onExport({ docs: picked, formats: ["docx"], destDir: destDir.trim(), draft });
    setBusy(false);
    if (e) setErr(e);
  };

  const blocked = python && !python.ok;

  return (
    <Dialog open={open} width={560} title="Xuất bộ tài liệu" onClose={onCancel}
      footer={
        <>
          <span className="tok free" style={{ marginRight: "auto" }}>miễn phí · không tiêu token</span>
          <DialogButtons onCancel={onCancel} onOk={run} okDisabled={busy || blocked || !picked.length}
            okLabel={busy ? "Đang xuất…" : `⬇ Xuất ${picked.length} tệp`} />
        </>
      }>
      {err && <div className="dg-err">{err}</div>}
      {blocked && (
        <div className="dg-err">
          ⚠ {python.hint}
          {python.tried?.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {python.tried.map((t) => <li key={t.bin}><b>{t.bin}</b>: {t.why}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="dg-field">
        <span className="dg-label">Tài liệu</span>
        {(plan?.docs || []).map((d) => {
          const st = doneOf.get(d.key) || { done: 0, sections: 0, pages: 0 };
          return (
            <button key={d.key} className={"dg-chk" + (picked.includes(d.key) ? " on" : "")}
              onClick={() => toggle(d.key)}>
              <i className="bx">{picked.includes(d.key) ? "✓" : ""}</i>
              <span className="dg-chk-t">
                <b>{d.file}</b>
                <span>{st.sections} mục · đã viết {st.done}/{st.sections}
                  {st.pages ? ` · ~${st.pages} trang` : ""}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="dg-field">
        <span className="dg-label">Định dạng</span>
        <div className="dg-chk on"><i className="bx">✓</i>
          <span className="dg-chk-t"><b>Word (.docx)</b><span>Bản gốc để sửa · theme mặc định</span></span></div>
        <div className="dg-chk" title="Xuất PDF thuộc feature sau" style={{ opacity: 0.55 }}>
          <i className="bx" /><span className="dg-chk-t"><b>PDF thường</b>
            <span>Chưa có ở bản này — thuộc feature xuất PDF</span></span></div>
        <div className="dg-chk" title="Xuất PDF chống sao chép thuộc feature sau" style={{ opacity: 0.55 }}>
          <i className="bx" /><span className="dg-chk-t"><b>PDF chống sao chép</b>
            <span>Chưa có ở bản này — cần thêm tiện ích ngoài</span></span></div>
      </div>

      <div className="dg-field">
        <span className="dg-label">Lưu vào</span>
        <div className="dg-row" style={{ gap: 7 }}>
          <input className="dg-inp" style={{ flex: 1 }} value={destDir} placeholder="chưa chọn thư mục"
            onChange={(e) => setDestDir(e.target.value)} />
          <button className="ghost" onClick={pickDir}>Chọn…</button>
        </div>
      </div>

      <button className={"dg-chk" + (draft ? " on" : "")} onClick={() => setDraft(!draft)}>
        <i className="bx">{draft ? "✓" : ""}</i>
        <span className="dg-chk-t">
          <b>Đóng dấu “BẢN NHÁP”</b>
          <span>Ghi vào đầu trang và trang bìa. Nên bật khi bộ tài liệu còn mục chưa viết.</span>
        </span>
      </button>

      <p className="dg-note">Mục lục là field của Word — mở tệp rồi nhấn <b>F9</b> để nó điền số trang.
        Tệp đang mở trong Word sẽ bị bỏ qua kèm tên, không làm hỏng lượt xuất.</p>
    </Dialog>
  );
}
