// テーマ定義 — 全プラットフォーム共通の単一ソース。
// 画風は統一する: クリアな線、色数を絞る、余白(引き算)を大事に。
// wallpaper は assets/wallpapers/<id>.webp。
// 全テーマ無料 (price: "free")。
//
// 配色哲学 (詳細は THEME_SPEC.md「ブランドとしての設計原則」):
// - 彩度は原則として中〜低に抑え、自然素材由来の色で組む。原色は使わない。
// - アクセントは1テーマ1色。accent2 は同系色の補助トーンに限定する。
// - onAccent は accent を塗った面に載せる文字色。
// - 本文テキストは背景に対し 7:1 を目標、muted も 4.5:1 (WCAG AA) 以上を死守する。
const THEMES = [
  {
    id: "spider-forest",
    name: "蜘蛛と鬱蒼とした森",
    nameEn: "Spider & the Deep Forest",
    description: "苔むした暗い森、糸に光る雫、静かな蜘蛛。",
    dark: true,
    colors: {
      bg: "#0f1a13", surface: "#17251c", surfaceAlt: "#1f3025",
      text: "#e7eee1", muted: "#a3b8a5", accent: "#b0c584", accent2: "#61755f",
      border: "#2b3f31", onAccent: "#1a2013"
    },
    wallpaper: "assets/wallpapers/spider-forest.webp",
    motif: "spider-web"
  },
  {
    id: "deer-warm-forest",
    name: "鹿と暖かな森",
    nameEn: "Deer & the Warm Forest",
    description: "夕日の木漏れ日、穏やかな鹿、暖色の森。",
    dark: true,
    colors: {
      bg: "#1c120a", surface: "#291a0f", surfaceAlt: "#362413",
      text: "#f4ead6", muted: "#c6a87f", accent: "#d99e57", accent2: "#82603a",
      border: "#42301d", onAccent: "#241708"
    },
    wallpaper: "assets/wallpapers/deer-warm-forest.webp",
    motif: "deer"
  },
  {
    id: "whale-deep-sea",
    name: "クジラと深い海",
    nameEn: "Whale & the Deep Sea",
    description: "深海の静けさ、ゆっくり泳ぐクジラ、泡と光。",
    dark: true,
    colors: {
      bg: "#07131f", surface: "#0d1f31", surfaceAlt: "#132c44",
      text: "#e1edf5", muted: "#95b0c4", accent: "#71b5c1", accent2: "#40657f",
      border: "#1c3850", onAccent: "#0a1a22"
    },
    wallpaper: "assets/wallpapers/whale-deep-sea.webp",
    motif: "whale"
  },
  {
    id: "astronauts-moon",
    name: "月と二人だけの宇宙飛行士",
    nameEn: "The Moon & Two Astronauts",
    description: "暗い空、大きな月、二人だけの静かな宇宙。",
    dark: true,
    colors: {
      bg: "#090c18", surface: "#11152a", surfaceAlt: "#181d38",
      text: "#eaecf4", muted: "#a3aac2", accent: "#dec887", accent2: "#6e7699",
      border: "#252b47", onAccent: "#1d1a0e"
    },
    wallpaper: "assets/wallpapers/astronauts-moon.webp",
    motif: "moon"
  },
  {
    id: "city-girl",
    name: "都会の大人可愛い女子の日常",
    nameEn: "City Days — Quiet & Stylish",
    description: "静かな都会、カフェと本と夕方、大人可愛い日常。",
    dark: false,
    colors: {
      bg: "#f2ede5", surface: "#fcfaf6", surfaceAlt: "#e8dfd1",
      text: "#35322b", muted: "#71634e", accent: "#a0655a", accent2: "#8a7c68",
      border: "#ddd1bd", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/city-girl.webp",
    motif: "city"
  },
  {
    id: "gamer-neon",
    name: "ゲーム女子とレトロなネオン空間",
    nameEn: "Gamer Girl & Retro Neon",
    description: "レトロゲームの光、ネオンの部屋、夜更かしの相棒。",
    dark: true,
    colors: {
      bg: "#120a1f", surface: "#1c1129", surfaceAlt: "#281839",
      text: "#f1eaf8", muted: "#b6a5cf", accent: "#e2609f", accent2: "#8b76c4",
      border: "#38254f", onAccent: "#2b0e1d"
    },
    wallpaper: "assets/wallpapers/gamer-neon.webp",
    motif: "neon"
  },
  {
    id: "japanese-garden",
    name: "温かみのある和風な日本庭園",
    nameEn: "A Warm Japanese Garden",
    description: "砂紋、苔、灯籠、温かな和の庭園。",
    dark: false,
    colors: {
      bg: "#f4efe2", surface: "#fbf7ec", surfaceAlt: "#e9dfc6",
      text: "#37332a", muted: "#766c52", accent: "#a9502c", accent2: "#68764f",
      border: "#d8c9a4", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/japanese-garden.webp",
    motif: "garden"
  },
  {
    id: "bold-colors",
    name: "大胆な配色",
    nameEn: "Bold Colors",
    description: "mikapijazo風の大胆な配色。ビビッドでポップな世界。",
    dark: false,
    colors: {
      bg: "#faf9f3", surface: "#ffffff", surfaceAlt: "#efede3",
      text: "#22221f", muted: "#6d6d64", accent: "#d53c31", accent2: "#9c3226",
      border: "#e2dcc9", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/bold-colors.webp",
    motif: "bold"
  },
  {
    id: "girlfriend",
    name: "あなただけの美少女恋人",
    nameEn: "Only Yours",
    description: "開くたびに迎えてくれる、あなただけの彼女。",
    dark: false,
    colors: {
      bg: "#faf3ef", surface: "#fffcf9", surfaceAlt: "#f2e3dc",
      text: "#3f2f2c", muted: "#826552", accent: "#ad5a6c", accent2: "#9a7f72",
      border: "#e7d0c6", onAccent: "#ffffff"
    },
    wallpaper: "assets/wallpapers/girlfriend.webp",
    motif: "heart"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { THEMES };
}
if (typeof window !== "undefined") {
  window.THEMES = THEMES;
}
