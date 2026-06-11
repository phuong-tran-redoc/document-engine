# Security & legal gate — what it checks and how to fix a red one

Read this when a `/publish` push made the CI **`security-gate`** job go red (or a local pre-publish check
fails). The gate runs in CI (`security-gate.yml`) against the built `dist/` artifacts — the exact bytes that
would be published — and the `publish` job `needs:` it, so **a red gate means nothing was published**. Fix the
cause, re-tag, push again. Self-contained — drive the fix for the user.

The whole point of the gate: a release is the one moment a supply-chain mistake (leaked secret, copyleft dep,
broken type map, junk in the tarball) becomes everyone else's problem. Better to fail loud here than ship it.

## What runs (blocking unless marked advisory)

| Check | Blocks on |
|---|---|
| **Tarball content** (`npm pack --dry-run --json`, denylist) | any `.env` / `*.key` / `*.pem` / `.npmrc` / `id_rsa` / `.git*` or unexpected file in the tarball |
| **`files` allowlist** present on each dist `package.json` | missing or over-broad publish surface |
| **Gitleaks** (full git history) | any verified/high-confidence secret |
| **license-checker** (`--onlyAllow` permissive set) | any dep outside the permissive allowlist (GPL/AGPL/LGPL/MPL/SSPL/unknown) |
| **publint** + **attw** (`--pack`) | broken `exports` / wrong types map |
| **LICENSE present** in each tarball | missing LICENSE (the angular pkg is the usual offender) |
| **`pnpm install --frozen-lockfile`** | lockfile drift (lockfile not in sync with manifests) |
| **OSV-Scanner** (pnpm-lock) | *advisory* — HIGH/CRITICAL in prod deps (writes to step summary; promote to blocking later) |
| **`npm audit signatures`** (post-publish) | *advisory* — provenance/signature status |

## Fixing a red gate, by failure

### Tarball content — "BLOCKED, would publish: [.env, …]"
A secret/junk file slipped into the publish surface. **Do not** just delete the file and re-pack blindly —
understand why it's included.
- Inspect the real surface: from `dist/libs/<pkg>`, `npm pack --dry-run --json | jq '.[0].files[].path'`.
- Fix the **`files` allowlist** in that package's `package.json` so it's a *positive* list of what ships
  (`["**/*.js","**/*.mjs","**/*.d.ts","README.md","LICENSE.md","THIRD-PARTY-NOTICES.txt"]`). A denylist
  (`.npmignore`) is fail-open; the allowlist is fail-closed — the secret simply isn't on it.
- If the secret was a real credential that ever got committed/published → this is now a **leak**: go to
  `rollback.md` §Secret-leak emergency (rotate first), not just a tarball fix.

### `files` allowlist missing / over-broad
Each dist `package.json` must carry a `files` allowlist that survives `generatePackageJson`/ng-packagr. Add it,
then validate with `npm pack --dry-run` that only the intended files appear.

### Gitleaks — secret in git history
Gitleaks scans **all history**, so a secret committed long ago and later deleted still trips it.
- Verify it's a true positive (not a placeholder/example). If false, add a scoped allow rule in the gitleaks
  config with a reason — don't disable the scan.
- If true: it's leaked → **rotate the credential at its source immediately** (history rewrite does NOT un-leak
  it — mirrors/forks cache it). Then scrub history only if you must, knowing the value is already burned.

### license-checker — a non-permissive license
A transitive dependency carries a license outside the permissive allowlist
(`MIT;ISC;BSD-2/3-Clause;Apache-2.0;0BSD;CC0-1.0;Unlicense;BlueOak-1.0.0`).
- Identify it: `npx license-checker-rseidelsohn --start dist/libs/<pkg> --production --onlyAllow '<set>'`
  prints the offending package + license.
- Options, in order: drop/replace the dep → confirm it's a false reading (dual-licensed; pick the permissive
  one via an override) → if genuinely copyleft (GPL/AGPL/LGPL/MPL/SSPL/unknown) it **cannot ship** in these
  MIT packages. Never just widen the allowlist to make it pass.

### publint / attw — broken exports or types
These catch "package.json says ESM but runtime is CJS", wrong `types` paths, missing `exports` conditions —
breakage npm's own validation misses. Core is ESM, angular is CJS, so they fail differently.
- Reproduce locally from the built package: `npx publint` and
  `npx @arethetypeswrong/cli --pack . --profile esm-only` (core) / `--profile node16` (angular).
- Fix the `exports` / `main` / `module` / `types` wiring in the source `package.json` (or the ng-packagr /
  build config that generates the dist manifest), rebuild, re-check.

### LICENSE missing from a tarball
Usually angular — ng-packagr doesn't auto-copy `LICENSE.md`. Ensure `ng-package.json` `assets` includes
`./LICENSE.md` (and README), rebuild, confirm with `npm pack --dry-run` that LICENSE is in the file list.

### Lockfile drift — `--frozen-lockfile` failed
The lockfile doesn't match the manifests. Run `pnpm install` locally to update `pnpm-lock.yaml`, review the
diff (it should match an intentional dependency change), commit the lockfile, re-tag.

### OSV (advisory) — a known vuln
Currently advisory (writes to the run summary, doesn't block). Triage: if a HIGH/CRITICAL hits a prod dep,
bump/patch it. To suppress a reviewed/non-applicable finding, add it to `osv-scanner.toml` with a reason and a
review date (expiring) — never blanket-ignore.

## Legal artifacts the gate assumes (one-time setup, not per-release)
- `LICENSE.md` normalized (`Copyright (c) <year> <legal entity> (Redoc)`), shipped in **every** tarball.
- Lib `package.json`: `author` = company, `contributors` includes the individual; `repository.url` =
  `git+https://github.com/…​.git` (exact match required for OIDC provenance).
- **THIRD-PARTY-NOTICES.txt** per package (core bundles Tiptap/ProseMirror as hard deps) — generate as a build
  step so it never drifts; concat any Apache-2.0 dependency `NOTICE` contents (MIT needs none; Apache-2.0
  §4(d) does).
