// もこブラ (仮名) — PC無料版メイン プロセス
// エンジンは Electron 内蔵の Chromium を使う。自前エンジンは持たない。
// 設計方針 (docs/BRAND.md): サーバーなし / ログインなし / 使い方は Chrome と同じ /
// テーマの主役はユーザーの写真と色 / 設定とデータは書き出して守れる。
const { app, BrowserWindow, WebContentsView, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const { findChromeBookmarksFiles, parseChromeBookmarks } = require("./chrome-import");
const { COLOR_THEMES, LEGACY_THEMES, DEFAULT_THEME } = require("./themes/themes");

const HOME_URL = "about:blank";
let win = null;
let views = new Map(); // tabId -> WebContentsView
let activeTab = null;
let tabSeq = 0;

const CHROME_HEIGHT = 84; // タブバー + アドレスバーの高さ(px)。外枠は薄く保つ。

function isHomeView(view) {
  const u = view.webContents.getURL();
  return !u || u === "about:blank";
}

function layout() {
  if (!win || !activeTab || !views.has(activeTab)) return;
  const { width, height } = win.getContentBounds();
  for (const [id, view] of views) {
    // 新規タブ (URLなし) のときは view を畳み、renderer 側の
    // 新規タブページ (写真+検索) を見せる。
    const show = id === activeTab && !isHomeView(view);
    view.setBounds(
      show
        ? { x: 0, y: CHROME_HEIGHT, width, height: height - CHROME_HEIGHT }
        : { x: 0, y: CHROME_HEIGHT, width: 0, height: 0 }
    );
  }
}

function buildTabsState() {
  return [...views.entries()].map(([id, view]) => ({
    id,
    title: view.webContents.getTitle() || "新しいタブ",
    url: view.webContents.getURL(),
    active: id === activeTab,
    canGoBack: view.webContents.canGoBack(),
    canGoForward: view.webContents.canGoForward(),
    loading: view.webContents.isLoading(),
    isHome: isHomeView(view)
  }));
}
function sendChromeState() {
  if (!win) return;
  win.webContents.send("tabs:state", buildTabsState());
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

// ---- 設定 (形式バージョン2。旧形式からは自動移行する。黙って初期化しない) ----
function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}
function migrateSettings(raw) {
  if (raw && raw.version === 2 && raw.theme && raw.theme.kind) return raw;
  // 旧形式: { themeId: "..." } — 旧イラストテーマは legacy として引き継ぐ。
  const legacyId = raw && LEGACY_THEMES.some((t) => t.id === raw.themeId) ? raw.themeId : null;
  return {
    version: 2,
    theme: legacyId ? { kind: "legacy", id: legacyId } : { ...DEFAULT_THEME },
    photoFile: null,
    chromeImportedAt: null,
    importHintDismissed: false
  };
}
function loadSettings() {
  try { return migrateSettings(JSON.parse(fs.readFileSync(settingsPath(), "utf8"))); }
  catch { return migrateSettings(null); }
}
function saveSettings(s) {
  try { fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2)); } catch {}
}
function photosDir() {
  return path.join(app.getPath("userData"), "photos");
}
// renderer へ渡す形: 写真の file:// URL を解決して付ける。
function publicSettings() {
  const s = loadSettings();
  let photoUrl = null;
  if (s.photoFile) {
    const p = path.join(photosDir(), s.photoFile);
    if (fs.existsSync(p)) photoUrl = pathToFileURL(p).href;
  }
  return { ...s, photoUrl };
}
function setSettings(patch) {
  const s = { ...loadSettings(), ...patch };
  saveSettings(s);
  return publicSettings();
}

// ---- Chrome からのブックマーク取り込み ----
function importChromeBookmarks() {
  const files = findChromeBookmarksFiles();
  if (!files.length) return { ok: false, reason: "not-found", added: 0 };
  let incoming = [];
  for (const f of files) {
    try { incoming = incoming.concat(parseChromeBookmarks(fs.readFileSync(f, "utf8"))); }
    catch { /* 読めないプロファイルは飛ばす */ }
  }
  const d = loadData();
  const known = new Set(d.bookmarks.map((b) => b.url));
  let added = 0;
  for (const b of incoming) {
    if (known.has(b.url)) continue;
    known.add(b.url);
    d.bookmarks.push({ url: b.url, title: b.title, at: Date.now() });
    added++;
  }
  saveData(d);
  if (added > 0 || incoming.length > 0) setSettings({ chromeImportedAt: Date.now() });
  return { ok: true, added, total: incoming.length, bookmarks: d.bookmarks };
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
  // 旧形式の設定ファイルがあれば、移行後の形式で書き戻しておく。
  saveSettings(loadSettings());
  ipcMain.handle("settings:get", () => publicSettings());
  ipcMain.handle("tabs:get-state", () => buildTabsState());
  ipcMain.handle("theme:set", (_e, theme) => {
    if (!theme || typeof theme !== "object" || !theme.kind) return publicSettings();
    return setSettings({ theme });
  });
  // 旧 API 互換 (念のため): themeId 指定は legacy として解釈する。
  ipcMain.handle("settings:set-theme", (_e, themeId) => {
    const theme = COLOR_THEMES.some((t) => t.id === themeId)
      ? { kind: "color", id: themeId }
      : { kind: "legacy", id: themeId };
    return setSettings({ theme });
  });
  ipcMain.handle("photo:pick", async () => {
    const res = await dialog.showOpenDialog(win, {
      title: "新規タブの背景にする写真を選ぶ",
      properties: ["openFile"],
      filters: [{ name: "画像", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }]
    });
    if (res.canceled || !res.filePaths.length) return publicSettings();
    const src = res.filePaths[0];
    const ext = (path.extname(src) || ".png").toLowerCase();
    const name = "photo-" + Date.now() + ext;
    try {
      fs.mkdirSync(photosDir(), { recursive: true });
      // 旧写真は消す (端末内にコピーを溜めない)
      const prev = loadSettings().photoFile;
      if (prev && prev !== name) { try { fs.unlinkSync(path.join(photosDir(), prev)); } catch {} }
      fs.copyFileSync(src, path.join(photosDir(), name));
    } catch { return publicSettings(); }
    const s = loadSettings();
    const colorId = s.theme && s.theme.kind === "photo" ? s.theme.colorId
      : s.theme && s.theme.kind === "color" ? s.theme.id : "sakura";
    const overlay = s.theme && s.theme.kind === "photo" ? s.theme.overlay : 0.78;
    return setSettings({ photoFile: name, theme: { kind: "photo", colorId, overlay } });
  });
  ipcMain.handle("photo:remove", () => {
    const s = loadSettings();
    if (s.photoFile) { try { fs.unlinkSync(path.join(photosDir(), s.photoFile)); } catch {} }
    const colorId = s.theme && s.theme.kind === "photo" ? s.theme.colorId : DEFAULT_THEME.id;
    return setSettings({ photoFile: null, theme: { kind: "color", id: colorId } });
  });
  ipcMain.handle("chrome:import-bookmarks", () => importChromeBookmarks());
  ipcMain.handle("import-hint:dismiss", () => setSettings({ importHintDismissed: true }));
  ipcMain.handle("data:export", async () => {
    const res = await dialog.showSaveDialog(win, {
      title: "設定とデータを書き出す",
      defaultPath: "mokobura-data.json",
      filters: [{ name: "JSON", extensions: ["json"] }]
    });
    if (res.canceled || !res.filePath) return { ok: false };
    const payload = {
      app: "mokobura", exportedAt: new Date().toISOString(),
      settings: loadSettings(), data: loadData()
    };
    try { fs.writeFileSync(res.filePath, JSON.stringify(payload, null, 2)); return { ok: true }; }
    catch { return { ok: false }; }
  });
  ipcMain.handle("data:import", async () => {
    const res = await dialog.showOpenDialog(win, {
      title: "書き出したデータを読み込む",
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }]
    });
    if (res.canceled || !res.filePaths.length) return { ok: false };
    try {
      const payload = JSON.parse(fs.readFileSync(res.filePaths[0], "utf8"));
      if (payload.settings) saveSettings(migrateSettings(payload.settings));
      if (payload.data) saveData({
        history: Array.isArray(payload.data.history) ? payload.data.history : [],
        bookmarks: Array.isArray(payload.data.bookmarks) ? payload.data.bookmarks : []
      });
      return { ok: true, settings: publicSettings() };
    } catch { return { ok: false }; }
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
