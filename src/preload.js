// レンダラ(ブラウザの外側UI)へ渡す安全なAPIだけを公開する。
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mokobura", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setTheme: (themeId) => ipcRenderer.invoke("settings:set-theme", themeId),
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
