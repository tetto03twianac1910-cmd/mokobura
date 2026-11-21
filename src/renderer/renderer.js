// ブラウザの外側UI (タブ/アドレスバー/着せ替え) の制御。
// テーマ = 色 + 自分の写真 (docs/BRAND.md / THEME_SPEC.md)。
const $ = (s) => document.querySelector(s);
let currentTabs = [];
let settings = null; // main から受け取る設定 (photoUrl 解決済み)
let bookmarksCache = [];

function activeTabInfo() {
  return currentTabs.find((t) => t.active) || null;
}

// テーマオブジェクトから実際のパレットを引く。
function resolvePalette(theme) {
  if (!theme) return window.COLOR_THEMES[0].colors;
  if (theme.kind === "color") {
    const t = window.COLOR_THEMES.find((x) => x.id === theme.id);
    return (t || window.COLOR_THEMES[0]).colors;
  }
  if (theme.kind === "photo") {
    const t = window.COLOR_THEMES.find((x) => x.id === theme.colorId);
    return (t || window.COLOR_THEMES[0]).colors;
  }
  if (theme.kind === "customColor") return window.derivePalette(theme.accent, !!theme.dark);
  if (theme.kind === "legacy") {
    const t = window.LEGACY_THEMES.find((x) => x.id === theme.id);
    return (t || window.COLOR_THEMES[0]).colors;
  }
  return window.COLOR_THEMES[0].colors;
}

function applySettings(s) {
  settings = s;
  const theme = s.theme || { kind: "color", id: "milk-white" };
  const c = resolvePalette(theme);
  const r = document.documentElement.style;
  r.setProperty("--bg", c.bg);
  r.setProperty("--surface", c.surface);
  r.setProperty("--surface-alt", c.surfaceAlt);
  r.setProperty("--text", c.text);
  r.setProperty("--muted", c.muted);
  r.setProperty("--accent", c.accent);
  r.setProperty("--accent2", c.accent2);
  r.setProperty("--border", c.border);
  r.setProperty("--on-accent", c.onAccent);

  // 新規タブの背景: 写真テーマは写真+うすさ、レガシーは壁紙、それ以外は色のみ。
  const wp = $("#wallpaper");
  const tint = $("#photo-tint");
  let src = null, overlay = null;
  if (theme.kind === "photo" && s.photoUrl) {
    src = s.photoUrl;
    overlay = typeof theme.overlay === "number" ? theme.overlay : 0.78;
  } else if (theme.kind === "legacy") {
    const t = window.LEGACY_THEMES.find((x) => x.id === theme.id);
    if (t) { src = "../themes/" + t.wallpaper; overlay = 0.25; }
  }
  if (src) {
    if (wp.getAttribute("src") !== src) wp.src = src;
    wp.style.opacity = "1";
    tint.style.opacity = String(overlay);
  } else {
    wp.style.opacity = "0";
    tint.style.opacity = "0";
  }

  renderClosetState();
  renderImportCard();
}

async function setTheme(theme) {
  const s = await window.mokobura.setTheme(theme);
  applySettings(s);
}

// ---- 着せ替えパネル ----
function markCurrent(container, key) {
  container.querySelectorAll("[data-theme-key]").forEach((el) =>
    el.classList.toggle("current", el.dataset.themeKey === key));
}

function renderClosetState() {
  if (!settings) return;
  const theme = settings.theme;
  // 写真まわり
  const hasPhoto = !!settings.photoUrl;
  $("#photo-remove").hidden = !hasPhoto;
  $("#photo-controls").hidden = !hasPhoto;
  if (hasPhoto && theme.kind === "photo") {
    const ov = Math.round((typeof theme.overlay === "number" ? theme.overlay : 0.78) * 100);
    $("#overlay").value = ov;
    $("#overlay-val").textContent = ov + "%";
  }
  // 下地の色チップ
  const base = $("#photo-base");
  base.innerHTML = "";
  for (const t of window.COLOR_THEMES) {
    const b = document.createElement("button");
    b.className = "chip" + (theme.kind === "photo" && theme.colorId === t.id ? " current" : "");
    b.style.background = t.colors.accent;
    b.title = t.name;
    b.addEventListener("click", async () => {
      const cur = settings.theme.kind === "photo" ? settings.theme : { kind: "photo", colorId: t.id, overlay: 0.78 };
      await setTheme({ kind: "photo", colorId: t.id, overlay: cur.overlay ?? 0.78 });
    });
    base.appendChild(b);
  }
  markCurrent($("#color-grid"), theme.kind === "color" ? "color:" + theme.id : "");
  markCurrent($("#legacy-grid"), theme.kind === "legacy" ? "legacy:" + theme.id : "");
  if (theme.kind === "customColor") {
    $("#custom-color").value = theme.accent;
    $("#custom-dark").checked = !!theme.dark;
  }
}

function buildCloset() {
  const grid = $("#color-grid");
  grid.innerHTML = "";
  for (const t of window.COLOR_THEMES) {
    const card = document.createElement("button");
    card.className = "color-card";
    card.dataset.themeKey = "color:" + t.id;
    card.innerHTML =
      `<span class="swatch" style="background:${t.colors.bg}; border-color:${t.colors.border}; box-shadow: inset 0 -10px 0 ${t.colors.surfaceAlt}, inset 0 0 0 6px ${t.colors.surface}"></span>` +
      `<h4></h4><p></p>`;
    card.querySelector("h4").textContent = t.name;
    card.querySelector("p").textContent = t.description;
    card.addEventListener("click", () => setTheme({ kind: "color", id: t.id }));
    grid.appendChild(card);
  }
  const lg = $("#legacy-grid");
  lg.innerHTML = "";
  for (const t of window.LEGACY_THEMES) {
    const card = document.createElement("button");
    card.className = "legacy-card";
    card.dataset.themeKey = "legacy:" + t.id;
    card.innerHTML =
      `<img class="thumb" src="../themes/${t.wallpaper}" alt="" loading="lazy"><h4></h4><p></p>`;
    card.querySelector("h4").textContent = t.name;
    card.querySelector("p").textContent = t.description;
    card.addEventListener("click", () => setTheme({ kind: "legacy", id: t.id }));
    lg.appendChild(card);
  }
}

// ---- 初回の引っ越し案内 ----
function renderImportCard() {
  if (!settings) return;
  const show = !settings.chromeImportedAt && !settings.importHintDismissed;
  $("#import-card").hidden = !show;
}

function showDataResult(el, msg) {
  el.hidden = false;
  el.textContent = msg;
}

// ---- ライブラリ ----
async function refreshStar() {
  bookmarksCache = await window.mokobura.listBookmarks();
  const tab = activeTabInfo();
  const on = !!(tab && tab.url && bookmarksCache.some((b) => b.url === tab.url));
  $("#star").textContent = on ? "★" : "☆";
  $("#star").classList.toggle("on", on);
}

function libItem(entry) {
  const el = document.createElement("div");
  el.className = "lib-item";
  const t = document.createElement("span");
  t.className = "t";
  t.textContent = entry.title || entry.url;
  const u = document.createElement("span");
  u.className = "u";
  u.textContent = entry.url;
  el.append(t, u);
  el.addEventListener("click", () => window.mokobura.go(entry.url));
  return el;
}

async function renderLibrary() {
  const bm = await window.mokobura.listBookmarks();
  const bl = $("#bookmark-list");
  bl.innerHTML = "";
  if (!bm.length) bl.innerHTML = '<p class="lib-empty">まだありません。☆ボタンで追加できます。</p>';
  bm.slice(0, 200).forEach((b) => bl.appendChild(libItem(b)));
  const hist = await window.mokobura.listHistory();
  const hl = $("#history-list");
  hl.innerHTML = "";
  if (!hist.length) hl.innerHTML = '<p class="lib-empty">まだありません。</p>';
  hist.slice(0, 100).forEach((h) => hl.appendChild(libItem(h)));
}

// ---- タブ ----
function renderTabs(tabs) {
  currentTabs = tabs;
  const wrap = $("#tabs");
  wrap.innerHTML = "";
  for (const tab of tabs) {
    const el = document.createElement("div");
    el.className = "tab" + (tab.active ? " active" : "");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = tab.loading ? "読み込み中…" : tab.title;
    const close = document.createElement("button");
    close.className = "close";
    close.textContent = "×";
    close.addEventListener("click", (e) => { e.stopPropagation(); window.mokobura.closeTab(tab.id); });
    el.append(title, close);
    el.addEventListener("click", () => window.mokobura.activateTab(tab.id));
    wrap.appendChild(el);
    if (tab.active) {
      $("#address").value = tab.url && tab.url !== "about:blank" ? tab.url : "";
      $("#back").disabled = !tab.canGoBack;
      $("#forward").disabled = !tab.canGoForward;
      $("#newtab").classList.toggle("visible", !!tab.isHome);
    }
  }
  refreshStar();
}

async function doChromeImport(resultEl) {
  const res = await window.mokobura.importChromeBookmarks();
  if (!res.ok) {
    showDataResult(resultEl, "Chromeのブックマークが見つかりませんでした。ChromeをインストールしたPCで試してください。");
    return;
  }
  showDataResult(resultEl, res.added > 0
    ? `Chromeから ${res.added} 件のブックマークを取り込みました。ライブラリから開けます。`
    : "新しいブックマークはありませんでした（取り込み済みです）。");
  settings = await window.mokobura.getSettings();
  renderImportCard();
  refreshStar();
}

async function init() {
  buildCloset();
  applySettings(await window.mokobura.getSettings());

  window.mokobura.onTabsState(renderTabs);
  // 起動直後の状態送信はリスナ登録前に終わっていることがあるため、明示的に取り直す。
  renderTabs(await window.mokobura.getTabsState());
  $("#newtab-btn").addEventListener("click", () => window.mokobura.createTab());
  $("#back").addEventListener("click", () => window.mokobura.back());
  $("#forward").addEventListener("click", () => window.mokobura.forward());
  $("#reload").addEventListener("click", () => window.mokobura.reload());
  $("#address").addEventListener("keydown", (e) => {
    if (e.key === "Enter") window.mokobura.go(e.target.value);
  });
  $("#closet-open").addEventListener("click", () => { $("#closet").hidden = false; $("#library").hidden = true; });
  $("#closet-close").addEventListener("click", () => { $("#closet").hidden = true; });
  $("#feedback-open").addEventListener("click", () =>
    window.mokobura.openExternal("https://github.com/tetto03twianac1910-cmd/mokobura/issues/new/choose"));

  const ntSearch = () => {
    const q = $("#nt-query").value.trim();
    if (q) window.mokobura.go(q);
  };
  $("#nt-go").addEventListener("click", ntSearch);
  $("#nt-query").addEventListener("keydown", (e) => { if (e.key === "Enter") ntSearch(); });
  document.querySelectorAll("#nt-shortcuts button").forEach((b) =>
    b.addEventListener("click", () => window.mokobura.go(b.dataset.url))
  );

  $("#star").addEventListener("click", async () => {
    const tab = activeTabInfo();
    if (!tab || !tab.url || tab.isHome) return;
    await window.mokobura.toggleBookmark({ url: tab.url, title: tab.title });
    refreshStar();
  });
  $("#library-open").addEventListener("click", async () => {
    $("#library").hidden = false;
    $("#closet").hidden = true;
    await renderLibrary();
  });
  $("#library-close").addEventListener("click", () => { $("#library").hidden = true; });
  $("#history-clear").addEventListener("click", async () => {
    await window.mokobura.clearHistory();
    await renderLibrary();
  });

  // 着せ替え: 写真
  $("#photo-pick").addEventListener("click", async () => {
    applySettings(await window.mokobura.pickPhoto());
  });
  $("#photo-remove").addEventListener("click", async () => {
    applySettings(await window.mokobura.removePhoto());
  });
  $("#overlay").addEventListener("input", async (e) => {
    const v = Number(e.target.value);
    $("#overlay-val").textContent = v + "%";
    if (settings && settings.theme.kind === "photo") {
      // スライダー操作中はプレビューだけ先に反映し、確定は change で保存する
      $("#photo-tint").style.opacity = String(v / 100);
    }
  });
  $("#overlay").addEventListener("change", async (e) => {
    if (settings && settings.theme.kind === "photo") {
      await setTheme({ ...settings.theme, overlay: Number(e.target.value) / 100 });
    }
  });
  // 着せ替え: じぶんカラー
  $("#custom-apply").addEventListener("click", async () => {
    await setTheme({
      kind: "customColor",
      accent: $("#custom-color").value,
      dark: $("#custom-dark").checked
    });
  });
  // 引っ越し (新規タブのカードと、着せ替えパネル内の両方)
  $("#import-btn").addEventListener("click", () => doChromeImport($("#import-result")));
  $("#import-dismiss").addEventListener("click", async () => {
    applySettings(await window.mokobura.dismissImportHint());
  });
  $("#chrome-import").addEventListener("click", () => doChromeImport($("#data-result")));
  $("#data-export").addEventListener("click", async () => {
    const res = await window.mokobura.exportData();
    showDataResult($("#data-result"), res.ok ? "書き出しました。ファイルは大切に保管してください。" : "書き出しをやめました。");
  });
  $("#data-import").addEventListener("click", async () => {
    const res = await window.mokobura.importData();
    if (res.ok) {
      applySettings(res.settings);
      await renderLibrary().catch(() => {});
      showDataResult($("#data-result"), "読み込みました。テーマとデータを復元しました。");
    } else {
      showDataResult($("#data-result"), "読み込みをやめました。");
    }
  });

  const hour = new Date().getHours();
  $("#nt-greeting").textContent =
    hour < 5 ? "おつかれさま" : hour < 11 ? "おはよう" : hour < 18 ? "こんにちは" : "こんばんは";
}
init();
