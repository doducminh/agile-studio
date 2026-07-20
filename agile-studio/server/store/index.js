// Chọn storage driver theo STORAGE_DRIVER (.env). Mặc định json (zero-config).
// Mọi driver expose CÙNG method surface nên call-site (server/index.js) không đổi.
import { makeJson } from "./json.js";
import { makeSqlite } from "./sqlite.js";

const driver = (process.env.STORAGE_DRIVER || "json").toLowerCase();

export const store =
  driver === "json"   ? makeJson()
  : driver === "sqlite" ? makeSqlite()
  : driver === "postgres"
    ? (() => { throw new Error("STORAGE_DRIVER=postgres chưa hỗ trợ (chỉ json|sqlite). Xem docs/issues/04."); })()
    : (() => { throw new Error(`STORAGE_DRIVER không hợp lệ: '${driver}' (dùng json|sqlite).`); })();
