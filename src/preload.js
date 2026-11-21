// レンダラ(ブラウザの外側UI)へ渡す安全なAPIだけを公開する。
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mokobura", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  getTabsState: () => ipcRenderer.invoke("tabs:get-state"),
  setTheme: (theme) => ipcRenderer.invoke("theme:set", theme),
  pickPhoto: () => ipcRenderer.invoke("photo:pick"),
  removePhoto: () => ipcRenderer.invoke("photo:remove"),
  importChromeBookmarks: () => ipcRenderer.invoke("chrome:import-bookmarks"),
  dismissImportHint: () => ipcRenderer.invoke("import-hint:dismiss"),
  exportData: () => ipcRenderer.invoke("data:export"),
  importData: () => ipcRenderer.invoke("data:import"),
  createTab: (url) => ipcRenderer.invoke("tabs:create", url),
  closeTab: (id) => ipcRenderer.invoke("tabs:close", id),
  activateTab: (id) => ipcRenderer.invoke("tabs:activate", id),
  go: (raw) => ipcRenderer.invoke("nav:go", raw),
  back: () => ipcRenderer.invoke("nav:back"),
  forward: () => ipcRenderer.invoke("nav:forward"),
  reload: () => ipcRenderer.invoke("nav:reload"),
  openExternal: (url) => ipcRenderer.invoke("external:open", url),
  listHistory: () => ipcRenderer.invoke("history:list"),
  clearHistory: () => ipcRenderer.invoke("history:clear"),
  listBookmarks: () => ipcRenderer.invoke("bookmarks:list"),
  toggleBookmark: (page) => ipcRenderer.invoke("bookmarks:toggle", page),
  onTabsState: (cb) => ipcRenderer.on("tabs:state", (_e, tabs) => cb(tabs))
});
