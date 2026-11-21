# もこブラ（仮名）— 自分の写真と色で着せ替える、軽いPCブラウザ

**Chromeのまま、少しだけ自分のものに。**
自分の写真と好きな色で着せ替えられる、PC専用の無料ブラウザです。

🌐 **公式サイト**: https://tetto03twianac1910-cmd.github.io/mokobura/
⬇️ **ダウンロード**: [最新リリース](https://github.com/tetto03twianac1910-cmd/mokobura/releases/latest) — Mac（Apple Silicon / Intel）/ Windows / Linux 対応、アカウント登録なし

> ⚠️ アプリはまだコード署名がないため、初回起動時にOSの確認画面が出ます（Mac: 右クリック→「開く」、Windows:「詳細情報」→「実行」）。

## 着せ替えは「自分の写真」と「自分の色」

- **自分の写真**: 好きな写真を新規タブの背景にできます。「うすさ」を調整できるので、文字の読みやすさはそのまま。写真はPCの中にだけ保存されます
- **いろ**: 色だけのテーマ9種（しろミルク／さくら／そら／ミントミルク／クリーム／すみれ／まっちゃ／よる／あかり）
- **じぶんカラー**: 好きな色を1つ選ぶと、全体の配色が自動で決まります
- 旧バージョンのイラストテーマ9種は「おまけ」として残しています

## Chromeからの引っ越し

- **ブックマークは取り込めます**（Chromeのプロファイルから自動で読み取り）
- **パスワードは取り込めません** — ChromeのパスワードはOSの鍵で暗号化されていて、他のブラウザから読み出す正規の手段がないためです。「全部移せる」とは言いません
- 履歴・開いているタブも移行対象外です
- 使い方はChromeと一緒。新しい作法を覚える必要はありません

## データは消えません

- テーマ・ブックマーク・履歴は端末内に保存（サーバーなし・ログインなし）
- 設定とデータはJSONで**書き出し／読み込み**ができます。PCを替えてもそのまま戻せます

## 正直な制限

- Chrome拡張機能は未対応です（Electronベースのため）
- 表示はChromiumベースです。ほとんどのサイトはそのまま表示できますが、全サイトの動作を保証するものではありません

## フィードバック募集中

感想・要望・不具合報告は [Issues](https://github.com/tetto03twianac1910-cmd/mokobura/issues) からどうぞ。いただいた声は次の改善に使います。

---

## 開発者向け

### 方針（2026-11-21 作り直し）
- 設計の根拠は調査（Simeji／Cahoのレビュー原文、PC利用実態、競合の盛衰）。原則は `docs/BRAND.md`、テーマ仕様は `THEME_SPEC.md`。
- 対応は **PC版のみ**（Windows / Mac / Linux）、**完全無料**。課金・サブスクなし。アプリ内広告なし。
- 表示エンジンは Electron 内蔵の Chromium。自前エンジンは持たない。
- サーバーなし / ログインなし。運用はほぼ自動化できる設計。

### 動かし方（開発用）
```bash
npm install   # Electron を取得（初回のみ、要ネット）
npm start     # アプリ起動
npm run check # 構文チェック + パレットのコントラスト検証
```

### 構成
- `src/main.js` — タブ管理（WebContentsView）、設定（v2形式・旧形式から自動移行）、写真管理、Chrome取り込み、データ書き出し／読み込み、IPC
- `src/preload.js` — レンダラへ渡す安全なAPI
- `src/renderer/` — ブラウザの外側UI（タブバー、アドレスバー、着せ替えパネル、ライブラリ）
- `src/themes/themes.js` — 色テーマ／レガシーテーマ／カスタムカラー導出（単一ソース）
- `src/chrome-import.js` — ChromeのBookmarks解析（パスワードは対象外）
- `src/themes/assets/wallpapers/` — レガシーイラストテーマの壁紙（おまけ）
- `docs/index.html` — 公式サイト（GitHub Pages）
- `docs/BRAND.md` / `THEME_SPEC.md` — ブランド原則とテーマ仕様（旧版は `docs/history/`）
- `scripts/check-contrast.js` — パレットのコントラスト数値検証

### 進捗
- [x] v0.2.0: 調査に基づく全面作り直し（テーマ＝色＋自分の写真、Chromeブックマーク取り込み、設定の書き出し／読み込み、UIの簡素化）
- [x] 配布用パッケージング（electron-builder、Win: nsis+portable / Mac: dmg / Linux: AppImage）。ただし署名なし
- [x] 公式サイトを GitHub Pages で公開
- [ ] コード署名（Mac公証は Apple Developer $99/年、Windowsは署名証明書）
