# もこブラ（仮名）— 着せ替えできる可愛いブラウザ / PC無料版

Simejiがキーボードに可愛さを足したように、ブラウザに「着せ替え」を足す。

## 方針（2026-11-21 決定）
- 対応は **PC版のみ**（Windows / Mac）、**完全無料**。課金・サブスクなし。
- テーマは **9種類、全て無料**（`src/themes/themes.js` が定義の単一ソース）。
- 収益源は当面なし。広告は **公式サイトのみ**、世界観に合う可愛い広告を厳選掲載する想定（アプリ内広告なし）。
- 表示エンジンは Electron 内蔵の Chromium。自前エンジンは持たない。
- サーバーなし / ログインなし / 公式テーマのみ → 運用はほぼ自動化できる設計。

## 動かし方（開発用）
```bash
npm install   # Electron を取得（初回のみ、要ネット）
npm start     # アプリ起動
npm run check # 構文チェックだけなら install 不要 (node のみ)
```

## 構成
- `src/main.js` — タブ管理（WebContentsView）、設定保存、IPC
- `src/preload.js` — レンダラへ渡す安全なAPI
- `src/renderer/` — ブラウザの外側UI（タブバー、アドレスバー、テーマクローゼット）
- `src/themes/themes.js` — 9テーマの配色・説明（単一ソース）
- `src/themes/assets/wallpapers/` — テーマ壁紙（デザイン生成後に配置）
- `site/index.html` — 公式サイト（広告枠つき）
- `THEME_SPEC.md` — デザイン生成AI向けの制作仕様

## 未了
- [x] 9テーマの壁紙イラスト生成 — 9/9 完了（`src/themes/assets/wallpapers/`）
- [x] 新規タブページ（テーマ壁紙＋あいさつ＋検索＋ショートカット、テーマ連動）
- [x] 履歴・ブックマーク（端末内保存、☆で登録、📚パネルから再訪・履歴消去）
- [x] 配布用パッケージング設定（electron-builder、Win: nsis+portable / Mac: dmg / Linux: AppImage）。Linux版はビルド＋起動確認まで完了（2026-11-21）
- [x] Windows ポータブル版ビルド（`dist/もこブラ 0.1.0.exe`、約78MB）。ただし署名・アイコン埋め込みなし（Linux上で wine が必要な工程を省略したため）
- [ ] コード署名（Mac公証は Apple Developer $99/年、Windowsは署名証明書）と Win インストーラ / Mac 実機ビルド（Windows/Mac 環境か CI で実施）
- [ ] 公式サイトの公開とダウンロード導線
