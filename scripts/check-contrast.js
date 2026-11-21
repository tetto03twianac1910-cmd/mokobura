// パレットのコントラスト検証 (THEME_SPEC.md 第3節)。
// 使い方: node scripts/check-contrast.js — 基準を満たさないテーマがあれば exit 1。
const { COLOR_THEMES, LEGACY_THEMES, derivePalette, contrast } = require("../src/themes/themes.js");

let failures = 0;
function check(scope, id, colors) {
  const pairs = [
    ["text/bg", colors.text, colors.bg, 7],
    ["text/surface", colors.text, colors.surface, 7],
    ["muted/bg", colors.muted, colors.bg, 4.5],
    ["muted/surface", colors.muted, colors.surface, 4.5],
    ["onAccent/accent", colors.onAccent, colors.accent, 4.5]
  ];
  for (const [name, a, b, req] of pairs) {
    const v = contrast(a, b);
    if (v < req) { failures++; console.log(`NG ${scope} ${id} ${name}=${v.toFixed(2)} (要 ${req})`); }
  }
}
for (const t of COLOR_THEMES) check("COLOR", t.id, t.colors);
for (const t of LEGACY_THEMES) check("LEGACY", t.id, t.colors);
for (const sample of ["#ff8fb8", "#63dcbb", "#ffd98a", "#8fd0ff", "#b7a6f8", "#e2609f", "#222222", "#eeeeee"]) {
  check("CUSTOM-light", sample, derivePalette(sample, false));
  check("CUSTOM-dark", sample, derivePalette(sample, true));
}
console.log(failures === 0 ? "contrast: ALL OK" : `contrast: ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
