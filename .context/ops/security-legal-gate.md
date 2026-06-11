# Process ② — Security & Legal Pre-Publish Gate

> Process spec. Decision: [ADR-003](../decisions.md) (security) + [ADR-002](../decisions.md) (IP).
> Called by Process ① before every publish: the `security-gate` CI job that the `publish` job `needs:`.

## Shape

One CI job **`security-gate`** that the `publish` job `needs:`. Runs against the built `dist/` artifacts
(the exact bytes being published). **Blocking** steps fail the job; **advisory** steps `continue-on-error`
and write to `$GITHUB_STEP_SUMMARY`. Tier = **MUST-have baseline**.

## Blocking vs advisory

| Check | Blocking? | Threshold |
|---|---|---|
| Tarball content verify (`npm pack --dry-run --json`, denylist) | **Block** | any `.env`/`*.key`/`*.pem`/`.npmrc`/`.git*` or unexpected file |
| `files` allowlist present on each dist package | **Block** | missing/over-broad surface |
| Gitleaks (full git history) | **Block** | any verified/high-confidence secret |
| OSV-Scanner (pnpm-lock) | **Block** | HIGH/CRITICAL in prod deps (rest suppressed in `osv-scanner.toml`) |
| `license-checker-rseidelsohn --onlyAllow` | **Block** | any dep outside permissive allowlist (GPL/AGPL/unknown) |
| publint + attw (`--pack`) | **Block** | broken `exports`/types map |
| `pnpm install --frozen-lockfile` | **Block** | lockfile drift |
| LICENSE present in each tarball | **Block** | missing LICENSE (esp. angular) |
| `npm audit signatures` (post-publish) | Advisory | provenance/sig status |

## Security baseline — what to add

### `pnpm-workspace.yaml` (additive)
This repo runs **pnpm 11.4.0**, which uses the `allowBuilds` map (NOT the older `onlyBuiltDependencies` list —
verified: 91 refs to `allowBuilds` vs 2 legacy refs to `onlyBuiltDependencies` in the pnpm 11.4.0 binary).
Default-deny: only packages set to `true` may run install/build scripts.
```yaml
allowBuilds:                     # reviewed build tooling only (compilers/bundlers/Nx engine/native db)
  '@parcel/watcher': true
  '@swc/core': true
  esbuild: true
  lmdb: true
  msgpackr-extract: true
  nx: true
  unrs-resolver: true
# minimumReleaseAge: 1440        # 1-day dependency cooldown — enable after verifying it doesn't stall installs
```

### Tarball verification (the hard secret guarantee), run in `dist/libs/<pkg>`
```bash
npm pack --dry-run --json | node -e '
  const f=JSON.parse(require("fs").readFileSync(0)).at(0).files.map(x=>x.path);
  const bad=f.filter(p=>/(^|\/)\.env|\.pem$|\.key$|\.npmrc$|id_rsa|\.git/.test(p));
  if(bad.length){console.error("BLOCKED, would publish:",bad);process.exit(1)}
  console.log("OK:",f.length,"files")'
```
Lift this into `tools/security/verify-tarball.mjs` so the gate and local check share one source of truth.

### `files` allowlist (each dist `package.json`)
```jsonc
"files": ["**/*.js", "**/*.mjs", "**/*.d.ts", "README.md", "LICENSE.md", "THIRD-PARTY-NOTICES.txt"]
```
Positive allowlist beats `.npmignore` denylist (default-deny). `.env` simply isn't on the list.

### Other baseline hardening
- **Gitleaks** action on the gate (full history) + repo secret-scanning + push protection.
- **OSV-Scanner** action with `osv-scanner.toml` carrying severity policy + expiring `ignore` entries.
- **`SECURITY.md`** at repo root (done — `/SECURITY.md`).
- **`.github/dependabot.yml`** for `npm` + `github-actions`, with a `cooldown` block.
- **Pin all third-party GitHub Actions to commit SHAs** (`checkout`, `setup-node`, `pnpm/action-setup`,
  `dorny/paths-filter`, gitleaks/osv actions). Currently on mutable `@v4`/`@v2` tags.
- Install with `--frozen-lockfile --ignore-scripts` in the gate job.
- Delete any legacy npm automation tokens (OIDC makes them unnecessary); npm account 2FA = "Authorization and writes".

### Deferred (SHOULD / nice-to-have, per ADR-003)
Socket.dev App (behavioral malware detection), OpenSSF Scorecard + badge, CodeQL default-setup, SBOM
(CycloneDX attached to Release), build attestations. Revisit if the lib grows or a consumer asks.

---

## Legal — what to fix (per ADR-002: company owns the IP)

### Copyright holder (confirm exact entity name first)
- All three `LICENSE.md` (root + both libs): `Copyright (c) 2025 <full registered legal entity> (Redoc)`.
  Normalize punctuation (root currently `Copyright 2025`, libs `Copyright (c) 2025`).
- Both lib `package.json`: `"author": "Realestatedoc (Redoc)"`,
  `"contributors": ["Duc Phuong (Jack) <tdp99.business@gmail.com>"]`.
- Root `package.json` stays `UNLICENSED` + `private: true` (correct).

### LICENSE in every tarball
- **Core:** ships LICENSE via SWC `assets: ["*.md"]` — verify with `npm pack --dry-run`.
- **Angular (BUG):** `ng-package.json` `assets` only lists `src/lib/styles` → tarball ships **no LICENSE**.
  Fix: `"assets": ["src/lib/styles", "./LICENSE.md"]`.

### Transitive license scan (gate command, per package, from dist)
```bash
npx license-checker-rseidelsohn \
  --start dist/libs/document-engine-core \
  --production --excludePrivatePackages \
  --onlyAllow 'MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;BlueOak-1.0.0' \
  --excludePackages '@phuong-tran-redoc/document-engine-core;@phuong-tran-redoc/document-engine-angular'
```
Run once per package (`-core`, `-angular`). Exit 1 on the first non-permissive license. **Never allow**
`GPL*`/`AGPL*`/`LGPL*`/`MPL*`/`SSPL`/`UNLICENSED`/unknown.

### THIRD-PARTY-NOTICES (required — core bundles Tiptap/ProseMirror as hard deps)
```bash
npx license-checker-rseidelsohn --start dist/libs/document-engine-<pkg> \
  --production --excludePrivatePackages --plainVertical \
  > dist/libs/document-engine-<pkg>/THIRD-PARTY-NOTICES.txt
```
Generate as a **build step** so it never drifts. Also `find node_modules -path '*/NOTICE*'` and concat any
Apache-2.0 NOTICE contents (MIT itself needs no NOTICE; Apache-2.0 §4(d) does).

### Trademark
Scope `@phuong-tran-redoc` and keywords `tiptap`/`prosemirror` are fine (nominative fair use). No logos,
don't imply endorsement.

## Sources
pnpm.io/supply-chain-security · securitylabs.datadoghq.com/articles/dependency-cooldowns ·
google.github.io/osv-scanner · github.com/gitleaks/gitleaks · github.com/RSeidelsohn/license-checker-rseidelsohn ·
docs.npmjs.com (package.json, trusted-publishers) · infra.apache.org/licensing-howto.html
