// Shim tương thích: storage giờ tách theo driver ở server/store/. Giữ import cũ
// `import { store } from "./store.js"` chạy nguyên (issue 04). Đổi engine qua STORAGE_DRIVER.
export { store } from "./store/index.js";
