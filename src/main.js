// もこブラ (仮名) — PC無料版メイン プロセス
// エンジンは Electron 内蔵の Chromium を使う。自前エンジンは持たない。
// 設計方針: サーバーなし / ログインなし / 公式テーマのみ / 全テーマ無料。
const { app, BrowserWindow, WebContentsView, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const HOME_URL = "about:blank";
let win = null;
let views = new Map(); // tabId -> WebContentsView
let activeTab = null;
let tabSeq = 0;

const CHROME_HEIGHT = 118; // タブバー + アドレスバー + テーマバーの高さ(px)

function isHomeView(view) {
  const u = view.webContents.getURL();
  return !u || u === "about:blank";
}

function layout() {
  if (!win || !activeTab || !views.has(activeTab)) return;
  const { width, height } = win.getContentBounds();
  for (const [id, view] of views) {
    // 新規タブ (URLなし) のときは view を畳み、renderer 側の
    // 新規タブページ (壁紙+検索) を見せる。
    const show = id === activeTab && !isHomeView(view);
    view.setBounds(
      show
        ? { x: 0, y: CHROME_HEIGHT, width, height: height - CHROME_HEIGHT }
        : { x: 0, y: CHROME_HEIGHT, width: 0, height: 0 }
    );
  }
}

function sendChromeState() {
  if (!win) return;
  const tabs = [...views.entries()].map(([id, view]) => ({
    id,
    title: view.webContents.getTitle() || "新しいタブ",
    url: view.webContents.getURL(),
    active: id === activeTab,
    canGoBack: view.webContents.canGoBack(),
    canGoForward: view.webContents.canGoForward(),
    loading: view.webContents.isLoading(),
    isHome: isHomeView(view)
  }));
  win.webContents.send("tabs:state", tabs);
}

function createTab(url = HOME_URL) {
  const view = new WebContentsView({
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  const id = ++tabSeq;
  views.set(id, view);
  win.contentView.addChildView(view);
  view.webContents.setWindowOpenHandler(({ url: u }) => {
    createTab(u);
    return { action: "deny" };
  });
  for (const ev of ["did-start-loading", "did-stop-loading", "page-title-updated", "did-navigate", "did-navigate-in-page"]) {
    view.webContents.on(ev, () => { layout(); sendChromeState(); });
  }
  view.webContents.on("did-navigate", () =>
    recordHistory(view.webContents.getURL(), view.webContents.getTitle()));
  view.webContents.on("page-title-updated", () =>
    recordHistory(view.webContents.getURL(), view.webContents.getTitle()));
  activeTab = id;
  if (url && url !== HOME_URL) view.webContents.loadURL(url);
  layout();
  sendChromeState();
  return id;
}

function closeTab(id) {
  const view = views.get(id);
  if (!view) return;
  win.contentView.removeChildView(view);
  view.webContents.close();
  views.delete(id);
  if (activeTab === id) {
    activeTab = views.size ? [...views.keys()][views.size - 1] : null;
    if (activeTab === null) createTab();
  }
  layout();
  sendChromeState();
}

// ---- 履歴・ブックマーク (端末内のみ、サーバーなし) ----
function dataPath() {
  return path.join(app.getPath("userData"), "data.json");
}
function loadData() {
  try {
    const d = JSON.parse(fs.readFileSync(dataPath(), "utf8"));
    return { history: d.history || [], bookmarks: d.bookmarks || [] };
  } catch { return { history: [], bookmarks: [] }; }
}
function saveData(d) {
  try { fs.writeFileSync(dataPath(), JSON.stringify(d, null, 2)); } catch {}
}
function recordHistory(url, title) {
  if (!/^https?:\/\//i.test(url)) return;
  const d = loadData();
  if (d.history[0] && d.history[0].url === url) {
    d.history[0].title = title || d.history[0].title;
  } else {
    d.history.unshift({ url, title: title || url, at: Date.now() });
    d.history = d.history.slice(0, 500);
  }
  saveData(d);
}

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath(), "utf8")); }
  catch { return { themeId: "deer-warm-forest" }; }
}
function saveSettings(s) {
  try { fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2)); } catch {}
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 760,
    minHeight: 520,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.on("resize", layout);
  createTab();
}

app.whenReady().then(() => {
  ipcMain.handle("settings:get", () => loadSettings());
  ipcMain.handle("settings:set-theme", (_e, themeId) => {
    const s = { ...loadSettings(), themeId };
    saveSettings(s);
    return s;
  });
  ipcMain.handle("tabs:create", (_e, url) => createTab(url));
  ipcMain.handle("tabs:close", (_e, id) => closeTab(id));
  ipcMain.handle("tabs:activate", (_e, id) => { activeTab = id; layout(); sendChromeState(); });
  ipcMain.handle("nav:go", (_e, raw) => {
    const view = views.get(activeTab);
    if (!view || !raw) return;
    let url = String(raw).trim();
    if (!/^https?:\/\//i.test(url)) {
      url = /^[\w-]+(\.[\w-]+)+/.test(url) && !url.includes(" ")
        ? "https://" + url
        : "https://duckduckgo.com/?q=" + encodeURIComponent(url);
    }
    view.webContents.loadURL(url);
  });
  ipcMain.handle("nav:back", () => views.get(activeTab)?.webContents.goBack());
  ipcMain.handle("nav:forward", () => views.get(activeTab)?.webContents.goForward());
  ipcMain.handle("nav:reload", () => views.get(activeTab)?.webContents.reload());
  ipcMain.handle("nav:home", () => { /* 新規タブページは renderer 側で表示 */ });
  ipcMain.handle("external:open", (_e, url) => shell.openExternal(url));
  ipcMain.handle("history:list", () => loadData().history);
  ipcMain.handle("history:clear", () => { const d = loadData(); d.history = []; saveData(d); return []; });
  ipcMain.handle("bookmarks:list", () => loadData().bookmarks);
  ipcMain.handle("bookmarks:toggle", (_e, page) => {
    const d = loadData();
    const i = d.bookmarks.findIndex((b) => b.url === page.url);
    if (i >= 0) d.bookmarks.splice(i, 1);
    else d.bookmarks.unshift({ url: page.url, title: page.title || page.url, at: Date.now() });
    saveData(d);
    return d.bookmarks;
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
