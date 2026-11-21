// テーマ定義 — 全プラットフォーム共通の単一ソース。
// 画風は統一する: クリアな線、色数を絞る、余白(引き算)を大事に。
// wallpaper はデザイン生成後に assets/wallpapers/<id>.jpg を置く。
// 全テーマ無料 (price: "free")。
const THEMES = [
  {
    id: "spider-forest",
    name: "蜘蛛と鬱蒼とした森",
    nameEn: "Spider & the Deep Forest",
    description: "苔むした暗い森、糸に光る雫、静かな蜘蛛。",
    dark: true,
    colors: {
      bg: "#0d2018", surface: "#143327", surfaceAlt: "#1b4231",
      text: "#e9f2e4", muted: "#9db8a2", accent: "#b7d977", accent2: "#5f8f6a",
      border: "#26503c"
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
      bg: "#2a1a0e", surface: "#3d2716", surfaceAlt: "#4f331d",
      text: "#f7ead8", muted: "#c9a87f", accent: "#f2a65a", accent2: "#a9713f",
      border: "#5d3f24"
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
      bg: "#06182e", surface: "#0b2745", surfaceAlt: "#10355c",
      text: "#e3f0fa", muted: "#8fb0cc", accent: "#57c7d4", accent2: "#2b6ea6",
      border: "#17456e"
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
      bg: "#070a18", surface: "#10142b", surfaceAlt: "#181e3d",
      text: "#eceef7", muted: "#9aa3c7", accent: "#f5d97e", accent2: "#7e8fc9",
      border: "#232a52"
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
      bg: "#f3efe9", surface: "#ffffff", surfaceAlt: "#eae3d8",
      text: "#33302c", muted: "#8d857a", accent: "#c98a94", accent2: "#7d7466",
      border: "#ddd3c4"
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
      bg: "#12081f", surface: "#1e0f33", surfaceAlt: "#2a1747",
      text: "#f6ecff", muted: "#b49ad9", accent: "#ff5da2", accent2: "#41e6d9",
      border: "#3a2260"
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
      bg: "#f5efe2", surface: "#fffaf0", surfaceAlt: "#ece1c9",
      text: "#38332a", muted: "#8f8672", accent: "#b5522f", accent2: "#5f7355",
      border: "#ded0b2"
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
      bg: "#fdfdf8", surface: "#ffffff", surfaceAlt: "#ffeef7",
      text: "#1d1d1d", muted: "#6d6d6d", accent: "#ff2e88", accent2: "#00b7eb",
      border: "#ffd400"
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
      bg: "#fdf1f3", surface: "#ffffff", surfaceAlt: "#fbe3e8",
      text: "#3d2c30", muted: "#a58a90", accent: "#e86a8a", accent2: "#b58ce8",
      border: "#f3ccd5"
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
