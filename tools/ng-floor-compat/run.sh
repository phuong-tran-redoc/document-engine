#!/usr/bin/env bash
#
# Angular peer-floor guard (real-compile / layer 2).
#
# Builds the publishable libs, packs them, installs them into an isolated consumer
# pinned to the declared Angular peer floor (tools/ng-floor-compat, currently
# Angular 16) and runs an AOT `ng build`. This is the authoritative proof that the
# package is installable on the floor: it exercises the floor's template
# type-checker (the `.d.ts` ɵɵComponentDeclaration input format) AND the
# partial-ivy linker on the (Angular-20-built) declarations — things the static
# denylist cannot see. Exits non-zero on any failure; wired into
# security-gate.yml so a failure blocks publish.
#
# Usage: bash tools/ng-floor-compat/run.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURE="$ROOT/tools/ng-floor-compat"

echo "==> [1/5] Building publishable libs (core + angular)"
( cd "$ROOT" && pnpm nx run-many -t build --projects=tag:scope:public )

CORE_DIST="$ROOT/dist/libs/document-engine-core"
NG_DIST="$ROOT/dist/libs/document-engine-angular"

# The angular dist manifest depends on core via `workspace:*`, which npm cannot
# resolve outside the pnpm workspace. Replace it with the concrete disk version
# (CI stamps the real version at publish time; for the compat test the disk
# fallback is enough since we install the core tarball alongside).
VERSION="$(node -p "require('$CORE_DIST/package.json').version")"
echo "==> [2/5] Pinning core dependency -> $VERSION in the angular dist manifest"
node -e "const f=process.argv[1];const fs=require('fs');const p=JSON.parse(fs.readFileSync(f,'utf8'));const k='@phuong-tran-redoc/document-engine-core';if(p.dependencies&&p.dependencies[k]){p.dependencies[k]=process.argv[2];}fs.writeFileSync(f,JSON.stringify(p,null,2));" "$NG_DIST/package.json" "$VERSION"

echo "==> [3/5] Packing tarballs"
CORE_TGZ="$CORE_DIST/$(cd "$CORE_DIST" && npm pack --silent 2>/dev/null)"
NG_TGZ="$NG_DIST/$(cd "$NG_DIST" && npm pack --silent 2>/dev/null)"
echo "    core:    $CORE_TGZ"
echo "    angular: $NG_TGZ"

echo "==> [4/5] Installing floor Angular toolchain + the built libs (isolated)"
cd "$FIXTURE"
rm -rf node_modules package-lock.json dist
npm install --no-audit --no-fund
# --no-save: install the locally-built tarballs without writing version-pinned
# `file:` entries back into the committed package.json.
npm install --no-audit --no-fund --no-save "$CORE_TGZ" "$NG_TGZ"

echo "==> [5/5] AOT building the floor consumer"
npm run build

echo ""
echo "✓ ng-floor-compat: @phuong-tran-redoc/document-engine-angular installs and AOT-builds on the declared Angular floor"
