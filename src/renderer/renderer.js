// ブラウザの外側UI (タブ/アドレスバー/着せ替え) の制御。
const $ = (s) => document.querySelector(s);
let currentTabs = [];
let currentThemeId = null;
let bookmarksCache = [];

function activeTabInfo() {
  return currentTabs.find((t) => t.active) || null;
}

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
  bm.slice(0, 100).forEach((b) => bl.appendChild(libItem(b)));
  const hist = await window.mokobura.listHistory();
  const hl = $("#history-list");
  hl.innerHTML = "";
  if (!hist.length) hl.innerHTML = '<p class="lib-empty">まだありません。</p>';
  hist.slice(0, 100).forEach((h) => hl.appendChild(libItem(h)));
}

function applyTheme(theme) {
  const c = theme.colors;
  const r = document.documentElement.style;
  r.setProperty("--bg", c.bg);
  r.setProperty("--surface", c.surface);
  r.setProperty("--surface-alt", c.surfaceAlt);
  r.setProperty("--text", c.text);
  r.setProperty("--muted", c.muted);
  r.setProperty("--accent", c.accent);
  r.setProperty("--accent2", c.accent2);
  r.setProperty("--border", c.border);
  $("#theme-name").textContent = "🎀 " + theme.name;
  $("#theme-desc").textContent = theme.description;
  $("#wallpaper").src = "../themes/" + theme.wallpaper;
  $("#nt-theme-line").textContent = "いまのテーマ: " + theme.name + " — " + theme.description;
  currentThemeId = theme.id;
  document.querySelectorAll(".theme-card").forEach((el) =>
    el.classList.toggle("current", el.dataset.themeId === theme.id)
  );
}

function renderCloset() {
  const grid = $("#theme-grid");
  grid.innerHTML = "";
  for (const t of window.THEMES) {
    const card = document.createElement("div");
    card.className = "theme-card";
    card.dataset.themeId = t.id;
    card.innerHTML =
      '<div class="swatches">' +
      [t.colors.bg, t.colors.accent, t.colors.accent2, t.colors.surface]
        .map((col) => `<i style="background:${col}"></i>`).join("") +
      "</div>" +
      `<h3>${t.name}</h3><p>${t.description}</p>` +
      '<span class="badge">無料</span>';
    card.addEventListener("click", async () => {
      await window.mokobura.setTheme(t.id);
      applyTheme(t);
    });
    grid.appendChild(card);
  }
}

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
  refreshStar();
  }
}

async function init() {
  renderCloset();
  const settings = await window.mokobura.getSettings();
  const theme = window.THEMES.find((t) => t.id === settings.themeId) || window.THEMES[0];
  applyTheme(theme);

  window.mokobura.onTabsState(renderTabs);
  $("#newtab").addEventListener("click", () => window.mokobura.createTab());
  $("#back").addEventListener("click", () => window.mokobura.back());
  $("#forward").addEventListener("click", () => window.mokobura.forward());
  $("#reload").addEventListener("click", () => window.mokobura.reload());
  $("#address").addEventListener("keydown", (e) => {
    if (e.key === "Enter") window.mokobura.go(e.target.value);
  });
  $("#closet-open").addEventListener("click", () => { $("#closet").hidden = false; });
  $("#closet-close").addEventListener("click", () => { $("#closet").hidden = true; });

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

  const hour = new Date().getHours();
  $("#nt-greeting").textContent =
    hour < 5 ? "おつかれさま" : hour < 11 ? "おはよう" : hour < 18 ? "こんにちは" : "こんばんは";
}
init();
