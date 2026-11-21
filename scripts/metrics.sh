#!/usr/bin/env bash
# もこブラ指標スナップショット: GitHub APIからDL数・スター・流入を取得してJSONLに追記
set -euo pipefail
REPO="tetto03twianac1910-cmd/mokobura"
OUT="$(dirname "$0")/../metrics/metrics.jsonl"
mkdir -p "$(dirname "$OUT")"
DL=$(gh api "repos/$REPO/releases" --jq '[.[].assets[].download_count] | add // 0')
STARS=$(gh api "repos/$REPO" --jq .stargazers_count)
FORKS=$(gh api "repos/$REPO" --jq .forks_count)
VIEWS=$(gh api "repos/$REPO/traffic/views" --jq .count)
UNIQUES=$(gh api "repos/$REPO/traffic/views" --jq .uniques)
ISSUES=$(gh api "repos/$REPO" --jq .open_issues_count)
DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"date\":\"$DATE\",\"downloads\":$DL,\"stars\":$STARS,\"forks\":$FORKS,\"views14d\":$VIEWS,\"uniqueVisitors14d\":$UNIQUES,\"openIssues\":$ISSUES}" >> "$OUT"
echo "downloads=$DL stars=$STARS views14d=$VIEWS uniques14d=$UNIQUES openIssues=$ISSUES"
