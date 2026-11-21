#!/usr/bin/env bash
# もこブラ GitHub 公開スクリプト
# 前提: gh auth login 済みであること (GitHubアカウントでログイン)
# 使い方: ./publish.sh <GitHubユーザー名>
set -euo pipefail
OWNER="${1:?使い方: ./publish.sh <GitHubユーザー名>}"
cd "$(dirname "$0")"

# サイト内のプレースホルダを実ユーザー名に置換
sed -i "s/GITHUB_OWNER/${OWNER}/g" site/index.html
git add -A
git commit -q -m "公開準備: ダウンロードリンクを実リンクに差し替え" || true

# リポジトリ作成と push (既にあれば push のみ)
if ! gh repo view "${OWNER}/mokobura" >/dev/null 2>&1; then
  gh repo create "${OWNER}/mokobura" --public --source=. --remote=origin --push \
    --description "着せ替えできる可愛いブラウザ「もこブラ」(PC・無料・テーマ9種)"
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/${OWNER}/mokobura.git"
  git push -u origin main
fi

# リリース v0.1.0 (既にあれば資産だけ追加)
if ! gh release view v0.1.0 >/dev/null 2>&1; then
  gh release create v0.1.0 \
    release-assets/mokobura-0.1.0-win-portable.exe \
    release-assets/mokobura-0.1.0-linux.AppImage \
    release-assets/mokobura-0.1.0-linux.tar.gz \
    release-assets/SHA256SUMS.txt \
    --title "もこブラ v0.1.0" \
    --notes-file RELEASE-0.1.0.md
fi

echo "公開完了: https://github.com/${OWNER}/mokobura/releases/tag/v0.1.0"
