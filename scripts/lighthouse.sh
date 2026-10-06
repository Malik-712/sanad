#!/usr/bin/env bash
# Lighthouse 12.8.2 on the five page types, mobile and desktop, N runs each; prints the median of each score.
# JSON reports go to ml/out/lighthouse/ (git-ignored).
#   bash scripts/lighthouse.sh [base-url] [runs]
# Uses the Edge installed on Windows; set CHROME_PATH for another Chromium browser.
BASE="${1:-https://sanad-pi-five.vercel.app}"
RUNS="${2:-3}"
OUT="ml/out/lighthouse"
mkdir -p "$OUT"
export CHROME_PATH="${CHROME_PATH:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
for page in "/" "/hadith/niyyah" "/narrator/umar-ibn-al-khattab" "/parse" "/about"; do
  name=$(echo "$page" | tr '/' '_'); [ "$name" = "_" ] && name="_home"
  for ff in mobile desktop; do
    flags="--form-factor=$ff"
    [ "$ff" = desktop ] && flags="--preset=desktop"
    for r in $(seq 1 "$RUNS"); do
      npx -y lighthouse@12.8.2 "$BASE$page" $flags --only-categories=performance,accessibility,best-practices,seo \
        --chrome-flags="--headless=new" --output=json --output-path="$OUT/${ff}${name}-r${r}.json" --quiet >/dev/null 2>&1
    done
    node -e "
      const keys=['performance','accessibility','best-practices','seo'];
      const runs=[...Array($RUNS).keys()].map(i=>require('./$OUT/${ff}${name}-r'+(i+1)+'.json'));
      const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
      const per=keys.map(k=>runs.map(r=>Math.round(r.categories[k].score*100)));
      console.log('$ff','$page','median',per.map(med).join(' '),'| runs',per.map(a=>a.join('/')).join(' '));"
  done
done
