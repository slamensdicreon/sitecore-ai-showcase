#!/bin/bash
set -e

REPO_URL="https://github.com/slamensdicreon/sitecore-ai-showcase.git"
BRANCH="${1:-main}"
WORK_DIR="/tmp/sitecore-ai-showcase-push"

echo "=== Pushing TE Connector Demo to GitHub ==="
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo ""

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

echo "[1/6] Cloning repository..."
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$WORK_DIR" 2>/dev/null || {
  echo "Branch $BRANCH not found, cloning default branch..."
  git clone --depth 1 "$REPO_URL" "$WORK_DIR"
}

echo "[2/6] Copying rendering host..."
mkdir -p "$WORK_DIR/examples/te-connector-demo"
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.env.local' \
  examples/te-connector-demo/ "$WORK_DIR/examples/te-connector-demo/"

echo "[3/6] Copying serialization items..."
mkdir -p "$WORK_DIR/authoring/items/te-connector"
cp -r authoring/items/te-connector/* "$WORK_DIR/authoring/items/te-connector/"

echo "[4/6] Updating xmcloud.build.json..."
if [ -f "$WORK_DIR/xmcloud.build.json" ]; then
  TEMP_FILE=$(mktemp)
  node -e "
    const existing = require('$WORK_DIR/xmcloud.build.json');
    const newEntry = require('$(pwd)/xmcloud.build.json');
    existing.renderingHosts = { ...existing.renderingHosts, ...newEntry.renderingHosts };
    require('fs').writeFileSync('$TEMP_FILE', JSON.stringify(existing, null, 2));
  "
  mv "$TEMP_FILE" "$WORK_DIR/xmcloud.build.json"
  echo "  Merged te-connector-demo into existing xmcloud.build.json"
else
  cp xmcloud.build.json "$WORK_DIR/xmcloud.build.json"
  echo "  Created new xmcloud.build.json"
fi

echo "[5/6] Updating sitecore.json..."
if [ -f "$WORK_DIR/sitecore.json" ]; then
  node -e "
    const existing = require('$WORK_DIR/sitecore.json');
    const glob = 'authoring/items/**/*.module.json';
    if (!existing.modules.includes(glob)) {
      existing.modules.push(glob);
      require('fs').writeFileSync('$WORK_DIR/sitecore.json', JSON.stringify(existing, null, 2));
      console.log('  Added te-connector module glob to sitecore.json');
    } else {
      console.log('  Module glob already present in sitecore.json');
    }
  "
else
  cp sitecore.json "$WORK_DIR/sitecore.json"
  echo "  Created new sitecore.json"
fi

echo "[6/6] Committing and pushing..."
cd "$WORK_DIR"
git add -A
git status --short

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "feat: add TE Connector Demo rendering host and serialization

- Add Next.js 15 rendering host at examples/te-connector-demo/
- Add Sitecore CLI serialization for 16 templates and 10 renderings
- Register te-connector-demo in xmcloud.build.json
- 19 component implementations (16 templates + 3 SXA built-ins)
- OrderCloud API integration in ProductDiscovery component
- TE Connectivity palette: slate #2e4957, orange #f28d00, teal #167a87"

  git push origin "$BRANCH"
  echo ""
  echo "=== Push complete ==="
  echo "XM Cloud will detect the new rendering host and begin deployment."
fi

cd -
rm -rf "$WORK_DIR"
