// Driver SQLite: dùng node:sqlite built-in (SYNC, không dep, không native compile).
// Giữ nguyên method surface + semantics của driver JSON để đổi engine không cần sửa call-site.
// Phần linh hoạt/nested (files[], slim session, log entry, settings) lưu cột JSON TEXT.
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { config } from "../config.js";
import { normalizeSettings, readRawJson } from "./json.js";

export function makeSqlite() {
  const dir = config.dataDir;
  mkdirSync(dir, { recursive: true });
  const path = process.env.SQLITE_PATH || join(dir, "studio.sqlite");
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
    CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, name TEXT, repo_path TEXT UNIQUE, created_at TEXT);
    CREATE TABLE IF NOT EXISTS requirements (id INTEGER PRIMARY KEY, project_id INTEGER, day TEXT, body TEXT,
      status TEXT, files TEXT, created_at TEXT, resolved_at TEXT);
    CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY, project_id INTEGER, feature TEXT, account_id TEXT,
      status TEXT, started_at TEXT, finished_at TEXT);
    CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, pid TEXT, entry TEXT);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, updatedAt INTEGER, slim TEXT);
    CREATE TABLE IF NOT EXISTS session_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, entry TEXT);
    CREATE TABLE IF NOT EXISTS schedules (id TEXT PRIMARY KEY, data TEXT);
    CREATE INDEX IF NOT EXISTS ix_req_pid ON requirements(project_id);
    CREATE INDEX IF NOT EXISTS ix_logs_pid ON logs(pid);
    CREATE INDEX IF NOT EXISTS ix_slog_sid ON session_logs(session_id);
  `);

  // seq: bộ đếm id CHUNG cho projects/requirements/runs (giống JSON). Rỗng => DB mới.
  const getMeta = (k) => db.prepare("SELECT v FROM meta WHERE k=?").get(k)?.v;
  const setMeta = (k, v) => db.prepare("INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(k, String(v));
  if (getMeta("seq") === undefined) { migrateFromJson(db, setMeta); setMeta("seq", getMeta("seq") ?? 1); }
  const nextId = () => { const n = Number(getMeta("seq") || 1); setMeta("seq", n + 1); return n; };

  const reqRow = (r) => r && ({ id: r.id, project_id: r.project_id, day: r.day, body: r.body,
    status: r.status, files: JSON.parse(r.files || "[]"), created_at: r.created_at, resolved_at: r.resolved_at });

  return {
    listProjects() { return db.prepare("SELECT * FROM projects ORDER BY id DESC").all(); },
    addProject(name, repo_path) {
      const id = nextId();
      try { db.prepare("INSERT INTO projects(id,name,repo_path,created_at) VALUES(?,?,?,?)").run(id, name, repo_path, new Date().toISOString()); }
      catch (e) { if (String(e.message).includes("UNIQUE")) throw new Error("Repo đã tồn tại"); throw e; }
      return { lastInsertRowid: id };
    },
    getProject(id) { return db.prepare("SELECT * FROM projects WHERE id=?").get(Number(id)); },

    listRequirements(pid) {
      return db.prepare("SELECT * FROM requirements WHERE project_id=?").all(Number(pid)).map(reqRow)
        .sort((a, b) => (b.day + b.created_at).localeCompare(a.day + a.created_at));
    },
    addRequirement(pid, day, body) {
      const id = nextId();
      db.prepare("INSERT INTO requirements(id,project_id,day,body,status,files,created_at) VALUES(?,?,?,?,?,?,?)")
        .run(id, Number(pid), day, body, "open", "[]", new Date().toISOString());
      return { lastInsertRowid: id };
    },
    getRequirement(id) { return reqRow(db.prepare("SELECT * FROM requirements WHERE id=?").get(Number(id))); },
    setRequirementStatus(id, status) {
      const resolved_at = status === "resolved" ? new Date().toISOString() : null;
      db.prepare("UPDATE requirements SET status=?, resolved_at=? WHERE id=?").run(status, resolved_at, Number(id));
      return this.getRequirement(id);
    },
    addRequirementFile(id, meta) {
      const r = this.getRequirement(id); if (!r) return r;
      r.files.push(meta);
      db.prepare("UPDATE requirements SET files=? WHERE id=?").run(JSON.stringify(r.files), Number(id));
      return r;
    },
    removeRequirementFile(id, idx) {
      const r = this.getRequirement(id); if (!(r && r.files && r.files[idx])) return null;
      const [f] = r.files.splice(idx, 1);
      db.prepare("UPDATE requirements SET files=? WHERE id=?").run(JSON.stringify(r.files), Number(id));
      return f;
    },
    deleteRequirement(id) { db.prepare("DELETE FROM requirements WHERE id=?").run(Number(id)); },

    startRun(pid, feature, accountId) {
      const id = nextId();
      db.prepare("INSERT INTO runs(id,project_id,feature,account_id,status,started_at) VALUES(?,?,?,?,?,?)")
        .run(id, Number(pid), feature, accountId, "running", new Date().toISOString());
      return { lastInsertRowid: id };
    },
    finishRun(id, status) {
      db.prepare("UPDATE runs SET status=?, finished_at=? WHERE id=?").run(status, new Date().toISOString(), id);
    },

    listLogs(pid) { return db.prepare("SELECT entry FROM logs WHERE pid=? ORDER BY id").all(String(pid)).map((r) => JSON.parse(r.entry)); },
    appendLog(pid, entry) {
      const key = String(pid);
      db.prepare("INSERT INTO logs(pid,entry) VALUES(?,?)").run(key, JSON.stringify({ t: new Date().toISOString(), ...entry }));
      db.prepare("DELETE FROM logs WHERE pid=? AND id NOT IN (SELECT id FROM logs WHERE pid=? ORDER BY id DESC LIMIT 500)").run(key, key);
    },
    clearLogs(pid) { db.prepare("DELETE FROM logs WHERE pid=?").run(String(pid)); },

    listSessions() { return db.prepare("SELECT slim FROM sessions").all().map((r) => JSON.parse(r.slim)); },
    saveSession(slim) {
      db.prepare("INSERT INTO sessions(id,updatedAt,slim) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET updatedAt=excluded.updatedAt, slim=excluded.slim")
        .run(slim.id, slim.updatedAt || 0, JSON.stringify(slim));
      db.prepare("DELETE FROM sessions WHERE id NOT IN (SELECT id FROM sessions ORDER BY updatedAt DESC LIMIT 60)").run();
    },
    deleteSession(id) {
      db.prepare("DELETE FROM sessions WHERE id=?").run(id);
      db.prepare("DELETE FROM session_logs WHERE session_id=?").run(id);
    },

    listSessionLogs(id) { return db.prepare("SELECT entry FROM session_logs WHERE session_id=? ORDER BY id").all(id).map((r) => JSON.parse(r.entry)); },
    appendSessionLog(id, entry) {
      db.prepare("INSERT INTO session_logs(session_id,entry) VALUES(?,?)").run(id, JSON.stringify({ t: new Date().toISOString(), ...entry }));
      db.prepare("DELETE FROM session_logs WHERE session_id=? AND id NOT IN (SELECT id FROM session_logs WHERE session_id=? ORDER BY id DESC LIMIT 1000)").run(id, id);
    },

    listSchedules() { return db.prepare("SELECT data FROM schedules").all().map((r) => JSON.parse(r.data)); },
    getSchedule(id) { const r = db.prepare("SELECT data FROM schedules WHERE id=?").get(id); return r ? JSON.parse(r.data) : undefined; },
    saveSchedule(sc) {
      db.prepare("INSERT INTO schedules(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").run(sc.id, JSON.stringify(sc));
      return sc;
    },
    deleteSchedule(id) { db.prepare("DELETE FROM schedules WHERE id=?").run(id); },

    getSettings() { return normalizeSettings(JSON.parse(getMeta("settings") || "{}")); },
    setSettings(patch) {
      const cur = JSON.parse(getMeta("settings") || "{}");
      setMeta("settings", JSON.stringify({ ...cur, ...patch }));
      return this.getSettings();
    },
  };
}

// Nạp studio.json (nếu có) vào DB mới — chạy 1 lần lúc khởi tạo DB rỗng.
function migrateFromJson(db, setMeta) {
  const raw = readRawJson();
  if (!raw) { setMeta("seq", 1); return; }
  const tx = db.exec.bind(db);
  tx("BEGIN");
  try {
    for (const p of raw.projects || [])
      db.prepare("INSERT OR IGNORE INTO projects(id,name,repo_path,created_at) VALUES(?,?,?,?)").run(p.id, p.name, p.repo_path, p.created_at);
    for (const r of raw.requirements || [])
      db.prepare("INSERT OR IGNORE INTO requirements(id,project_id,day,body,status,files,created_at,resolved_at) VALUES(?,?,?,?,?,?,?,?)")
        .run(r.id, r.project_id, r.day, r.body, r.status || "open", JSON.stringify(r.files || []), r.created_at, r.resolved_at ?? null);
    for (const r of raw.runs || [])
      db.prepare("INSERT OR IGNORE INTO runs(id,project_id,feature,account_id,status,started_at,finished_at) VALUES(?,?,?,?,?,?,?)")
        .run(r.id, r.project_id, r.feature, r.account_id ?? null, r.status, r.started_at, r.finished_at ?? null);
    for (const [pid, arr] of Object.entries(raw.logs || {}))
      for (const e of arr) db.prepare("INSERT INTO logs(pid,entry) VALUES(?,?)").run(pid, JSON.stringify(e));
    for (const s of Object.values(raw.sessions || {}))
      db.prepare("INSERT OR IGNORE INTO sessions(id,updatedAt,slim) VALUES(?,?,?)").run(s.id, s.updatedAt || 0, JSON.stringify(s));
    for (const [sid, arr] of Object.entries(raw.sessionLogs || {}))
      for (const e of arr) db.prepare("INSERT INTO session_logs(session_id,entry) VALUES(?,?)").run(sid, JSON.stringify(e));
    for (const sc of Object.values(raw.schedules || {}))
      db.prepare("INSERT OR IGNORE INTO schedules(id,data) VALUES(?,?)").run(sc.id, JSON.stringify(sc));
    if (raw.settings) setMeta("settings", JSON.stringify(raw.settings));
    setMeta("seq", Number(raw.seq) || 1);
    tx("COMMIT");
  } catch (e) { tx("ROLLBACK"); throw e; }
}
