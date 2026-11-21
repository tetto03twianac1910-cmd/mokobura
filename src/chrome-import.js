// Chrome からの移行まわり (純粋関数 + パス解決)。
//
// 正直な前提 (BRAND.md 第4節):
// - 移せるのはブックマークだけ。Chrome の Bookmarks ファイルは平文 JSON なので読める。
// - パスワードは移せない。Chrome は OS の鍵 (Windows: DPAPI / macOS: Keychain /
//   Linux: kwallet 等) で暗号化しており、他アプリが読み出す正規の手段がない。
// - 履歴・開いているタブ・拡張機能も移行対象外 (履歴DBは Chrome 実行中はロックされ、
//   拡張機能は Electron では動作しない)。できないことは UI とサイトで明記する。
const fs = require("fs");
const os = require("os");
const path = require("path");

// Chrome のユーザーデータディレクトリ候補 (OS別)。
function chromeUserDataDirs(platform = process.platform, home = os.homedir()) {
  switch (platform) {
    case "win32": {
      const local = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
      return [path.join(local, "Google", "Chrome", "User Data")];
    }
    case "darwin":
      return [path.join(home, "Library", "Application Support", "Google", "Chrome")];
    default:
      return [
        path.join(home, ".config", "google-chrome"),
        path.join(home, ".config", "chromium")
      ];
  }
}

// ユーザーデータ配下のプロファイル (Default / Profile N) の Bookmarks ファイルを探す。
function findChromeBookmarksFiles(platform = process.platform, home = os.homedir()) {
  const found = [];
  for (const base of chromeUserDataDirs(platform, home)) {
    let entries = [];
    try { entries = fs.readdirSync(base, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name !== "Default" && !/^Profile \d+$/.test(e.name)) continue;
      const p = path.join(base, e.name, "Bookmarks");
      if (fs.existsSync(p)) found.push(p);
    }
  }
  return found;
}

// Bookmarks JSON の木を再帰的に走査して { url, title } の配列にする。
function collectFromNode(node, out) {
  if (!node || typeof node !== "object") return;
  if (node.type === "url" && /^https?:\/\//i.test(node.url || "")) {
    out.push({ url: node.url, title: node.name || node.url });
  }
  const children = node.children || [];
  for (const c of children) collectFromNode(c, out);
}

function parseChromeBookmarks(jsonText) {
  const data = JSON.parse(jsonText);
  const out = [];
  const roots = (data && data.roots) || {};
  for (const key of Object.keys(roots)) collectFromNode(roots[key], out);
  // URL で重複除去 (最初に出てきたものを残す)
  const seen = new Set();
  return out.filter((b) => (seen.has(b.url) ? false : (seen.add(b.url), true)));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { chromeUserDataDirs, findChromeBookmarksFiles, parseChromeBookmarks };
}
