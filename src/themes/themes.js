// テーマ定義 — 全プラットフォーム共通の単一ソース。
//
// 作り直しの原則 (根拠: docs/BRAND.md / THEME_SPEC.md / 調査レポート):
// - テーマの主役は「ユーザーの写真」と「ユーザーの色」。製品側のイラストは主役にしない。
// - プリセットは色だけのテーマ (COLOR_THEMES)。壁紙を持たない。
// - 旧AIイラスト9種は LEGACY_THEMES として「おまけ」に残置する (既存ユーザーの設定保全のため)。
// - パレットは全テーマ共通の9キー: bg/surface/surfaceAlt/text/muted/accent/accent2/border/onAccent。
// - コントラスト: text は bg/surface に対し 7:1 目標、muted は 4.5:1 死守、
//   onAccent は accent に対し 4.5:1 以上。数値検証してから出す (THEME_SPEC.md 第3節)。

const COLOR_THEMES = [
  {
    id: "milk-white",
    name: "しろミルク",
    description: "温かみのある白。作業の邪魔をしない、基本の色。",
    dark: false,
    colors: {
      bg: "#faf7f3", surface: "#ffffff", surfaceAlt: "#f0eae2",
      text: "#38312d", muted: "#776a5f", accent: "#b23a5b", accent2: "#a08a80",
      border: "#e6dcd1", onAccent: "#ffffff"
    }
  },
  {
    id: "sakura",
    name: "さくら",
    description: "淡いピンク。写真の下地にも合う、やさしい色。",
    dark: false,
    colors: {
      bg: "#fbf2f3", surface: "#fffafb", surfaceAlt: "#f5e0e3",
      text: "#3d2c30", muted: "#7f656c", accent: "#b23a5b", accent2: "#a87f89",
      border: "#edd6db", onAccent: "#ffffff"
    }
  },
  {
    id: "sora",
    name: "そら",
    description: "淡い青。冷静で清潔な、集中したい日の色。",
    dark: false,
    colors: {
      bg: "#f1f5f9", surface: "#fcfdff", surfaceAlt: "#dfeaf3",
      text: "#2d333d", muted: "#5c6f82", accent: "#2f6db3", accent2: "#7d9dbd",
      border: "#d5e1ec", onAccent: "#ffffff"
    }
  },
  {
    id: "mint",
    name: "ミントミルク",
    description: "淡い緑。目に静かで、長く開いていられる色。",
    dark: false,
    colors: {
      bg: "#f1f7f2", surface: "#fcfffc", surfaceAlt: "#ddeee1",
      text: "#2c3830", muted: "#617564", accent: "#1f7a4d", accent2: "#79a98b",
      border: "#d3e5d8", onAccent: "#ffffff"
    }
  },
  {
    id: "cream",
    name: "クリーム",
    description: "淡い黄。紙のような温かさのある色。",
    dark: false,
    colors: {
      bg: "#faf6e9", surface: "#fffdf3", surfaceAlt: "#f1e8cb",
      text: "#39331f", muted: "#79704f", accent: "#96690f", accent2: "#a08c4f",
      border: "#e9dfc0", onAccent: "#ffffff"
    }
  },
  {
    id: "sumire",
    name: "すみれ",
    description: "淡い紫。落ち着いた甘さの色。",
    dark: false,
    colors: {
      bg: "#f4f2f9", surface: "#fdfcff", surfaceAlt: "#e5e0f2",
      text: "#332d40", muted: "#6e6484", accent: "#6647b8", accent2: "#9a8abd",
      border: "#dcd5ec", onAccent: "#ffffff"
    }
  },
  {
    id: "matcha",
    name: "まっちゃ",
    description: "くすんだ緑。大人っぽい渋さの色。",
    dark: false,
    colors: {
      bg: "#f4f5ec", surface: "#fdfef8", surfaceAlt: "#e3e8d1",
      text: "#31361f", muted: "#6b704f", accent: "#5c6e24", accent2: "#939a68",
      border: "#dbe0c6", onAccent: "#ffffff"
    }
  },
  {
    id: "yoru",
    name: "よる",
    description: "紺系のダーク。夜の作業に目が疲れにくい色。",
    dark: true,
    colors: {
      bg: "#161a21", surface: "#1e232d", surfaceAlt: "#272e3b",
      text: "#eceef2", muted: "#a3acbb", accent: "#8fb4dd", accent2: "#5d728e",
      border: "#323a48", onAccent: "#131720"
    }
  },
  {
    id: "akari",
    name: "あかり",
    description: "紫系のダーク。夜に少しだけ色が欲しい人の色。",
    dark: true,
    colors: {
      bg: "#1f1720", surface: "#291f2b", surfaceAlt: "#352838",
      text: "#f2eaf0", muted: "#bda7b8", accent: "#dda0c2", accent2: "#8a6480",
      border: "#413044", onAccent: "#251722"
    }
  }
];

// 旧AIイラスト9種。「おまけ」として残置 (THEME_SPEC.md 第6節)。
// 新規の既定にはせず、サイトの顔にも使わない。既存ユーザーの設定保全のため削除しない。
const LEGACY_THEMES = [
  {
    id: "spider-forest",
    name: "蜘蛛と鬱蒼とした森",
    description: "苔むした暗い森、糸に光る雫、静かな蜘蛛。",
    dark: true,
    colors: {
      bg: "#0f1a13", surface: "#17251c", surfaceAlt: "#1f3025",
      text: "#e7eee1", muted: "#a3b8a5", accent: "#b0c584", accent2: "#61755f",
      border: "#2b3f31", onAccent: "#1a2013"
    },
    wallpaper: "assets/wallpapers/spider-forest.webp"
  },
  {
    id: "deer-warm-forest",
    name: "鹿と暖かな森",
    description: "夕日の木漏れ日、穏やかな鹿、暖色の森。",
    dark: true,
    colors: {
      bg: "#1c120a", surface: "#291a0f", surfaceAlt: "#362413",
      text: "#f4ead6", muted: "#c6a87f", accent: "#d99e57", accent2: "#82603a",
      border: "#42301d", onAccent: "#241708"
    },
    wallpaper: "assets/wallpapers/deer-warm-forest.webp"
  },
  {
    id: "whale-deep-sea",
    name: "クジラと深い海",
    description: "深海の静けさ、ゆっくり泳ぐクジラ、泡と光。",
    dark: true,
    colors: {
      bg: "#07131f", surface: "#0d1f31", surfaceAlt: "#132c44",
      text: "#e1edf5", muted: "#95b0c4", accent: "#71b5c1", accent2: "#40657f",
      border: "#1c3850", onAccent: "#0a1a22"
    },
    wallpaper: "assets/wallpapers/whale-deep-sea.webp"
  },
  {
    id: "astronauts-moon",
    name: "月と二人だけの宇宙飛行士",
    description: "暗い空、大きな月、二人だけの静かな宇宙。",
    dark: true,
    colors: {
      bg: "#090c18", surface: "#11152a", surfaceAlt: "#181d38",
      text: "#eaecf4", muted: "#a3aac2", accent: "#dec887", accent2: "#6e7699",
      border: "#252b47", onAccent: "#1d1a0e"
    },
    wallpaper: "assets/wallpapers/astronauts-moon.webp"
  },
  {
    id: "city-girl",
    name: "都会の大人可愛い女子の日常",
    description: "静かな都会、カフェと本と夕方、大人可愛い日常。",
    dark: false,
    colors: {
      bg: "#f2ede5", surface: "#fcfaf6", surfaceAlt: "#e8dfd1",
      text: "#35322b", muted: "#71634e", accent: "#a0655a", accent2: "#8a7c68",
      border: "#ddd1bd", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/city-girl.webp"
  },
  {
    id: "gamer-neon",
    name: "ゲーム女子とレトロなネオン空間",
    description: "レトロゲームの光、ネオンの部屋、夜更かしの相棒。",
    dark: true,
    colors: {
      bg: "#120a1f", surface: "#1c1129", surfaceAlt: "#281839",
      text: "#f1eaf8", muted: "#b6a5cf", accent: "#e2609f", accent2: "#8b76c4",
      border: "#38254f", onAccent: "#2b0e1d"
    },
    wallpaper: "assets/wallpapers/gamer-neon.webp"
  },
  {
    id: "japanese-garden",
    name: "温かみのある和風な日本庭園",
    description: "砂紋、苔、灯籠、温かな和の庭園。",
    dark: false,
    colors: {
      bg: "#f4efe2", surface: "#fbf7ec", surfaceAlt: "#e9dfc6",
      text: "#37332a", muted: "#766c52", accent: "#a9502c", accent2: "#68764f",
      border: "#d8c9a4", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/japanese-garden.webp"
  },
  {
    id: "bold-colors",
    name: "大胆な配色",
    description: "ビビッドでポップな多色の世界。",
    dark: false,
    colors: {
      bg: "#faf9f3", surface: "#ffffff", surfaceAlt: "#efede3",
      text: "#22221f", muted: "#6d6d64", accent: "#d53c31", accent2: "#9c3226",
      border: "#e2dcc9", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/bold-colors.webp"
  },
  {
    id: "girlfriend",
    name: "あなただけの美少女恋人",
    description: "開くたびに迎えてくれる、あなただけの彼女。",
    dark: false,
    colors: {
      bg: "#faf3ef", surface: "#fffcf9", surfaceAlt: "#f2e3dc",
      text: "#3f2f2c", muted: "#826552", accent: "#ad5a6c", accent2: "#9a7f72",
      border: "#e7d0c6", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/girlfriend.webp"
  }
];

// ---- カスタムカラー: アクセント1色からパレットを導出する ----
function hexToRgb(hex) {
  const h = String(hex).replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(hexA, hexB) {
  const l1 = luminance(hexA), l2 = luminance(hexB);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
// fg を toward 方向へ寄せて、bg に対して target 以上のコントラストを保証する。
function ensureContrast(fg, bg, target, toward) {
  let out = fg, guard = 0;
  while (contrast(out, bg) < target && guard++ < 60) out = mix(out, toward, 0.06);
  return out;
}

// onAccent は白と濃色のうち accent とのコントラストが高い方。
// どちらも 4.5:1 に届かない中明度の色は、accent 自体を少し濃く/薄くして届かせる。
// muted も bg に対して 4.5:1 を必ず満たすよう寄せる (THEME_SPEC.md 第3節)。
function derivePalette(accentHex, dark) {
  let accent = accentHex;
  const onAccent = contrast(accent, "#ffffff") >= contrast(accent, "#221d20") ? "#ffffff" : "#221d20";
  let guard = 0;
  while (contrast(accent, onAccent) < 4.5 && guard++ < 40) {
    accent = mix(accent, onAccent === "#ffffff" ? "#000000" : "#ffffff", 0.05);
  }
  if (dark) {
    const bg = mix(accent, "#101014", 0.90);
    return {
      bg, surface: mix(accent, "#17171c", 0.86),
      surfaceAlt: mix(accent, "#202027", 0.82),
      text: "#f2f0f2",
      muted: ensureContrast(mix(accent, "#e8e4e8", 0.55), bg, 4.5, "#ffffff"),
      accent,
      accent2: mix(accent, "#8a8a92", 0.45), border: mix(accent, "#2c2c33", 0.80),
      onAccent
    };
  }
  const bg = mix(accent, "#fdfcfa", 0.94);
  return {
    bg, surface: "#ffffff",
    surfaceAlt: mix(accent, "#f4f1ec", 0.86),
    text: "#33302c",
    muted: ensureContrast(mix(accent, "#6f6a63", 0.55), bg, 4.5, "#3a352f"),
    accent,
    accent2: mix(accent, "#a49a8f", 0.45), border: mix(accent, "#e9e2d8", 0.82),
    onAccent
  };
}

const DEFAULT_THEME = { kind: "color", id: "milk-white" };

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COLOR_THEMES, LEGACY_THEMES, derivePalette, contrast, DEFAULT_THEME };
}
if (typeof window !== "undefined") {
  window.COLOR_THEMES = COLOR_THEMES;
  window.LEGACY_THEMES = LEGACY_THEMES;
  window.derivePalette = derivePalette;
}
