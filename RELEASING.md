# Releasing

How `@phuong-tran-redoc/document-engine-core` and `@phuong-tran-redoc/document-engine-angular` are versioned,
published, and rolled back.

> Releases are driven by **`nx release`** (native Nx). The two packages are versioned **in lock-step**
> (fixed relationship) — they always carry the same version and bump together. Publishing happens in CI on a
> tag push, behind a required security/legal gate. **Never** publish from a laptop directly to `latest`.
>
> **The cut is automated.** You don't run `nx release` by hand for normal work — merging a PR to `main`
> triggers `release.yml`, which cuts the version + tag for you (see [§ Automated release](#automated-release)).
> The manual `nx release` flow ([§ Manual cut](#manual-cut-fallback)) is the **fallback** for when automation
> is unavailable.

## How a release flows

```
feature branch → PR → CI (ci.yml + security-gate on the PR) → merge to main
  → release.yml: infer version (Conventional Commits) → changelog → commit `chore(release): publish <v>` → tag v<v> → push
  → the v* tag push triggers publish.yml → security-gate → publish (gated by the `npm-publish` environment approval)
```

The contentful change is reviewed and CI-checked **in the PR**. The release commit + tag are produced by CI,
never hand-authored on `main`. The only human gate left at publish time is the `npm-publish` environment
approval — the actual `npm publish` still waits for a reviewer.

## Versioning policy

- Driven by **Conventional Commits** (`feat:` → minor, `fix:` → patch, `feat!` / `BREAKING CHANGE:` → major).
- While `0.x`: a **minor** bump may carry breaking changes (minor is the de-facto "major" pre-1.0); **patch**
  is bug-fix only. We go `1.0.0` only when the public API is stable.
- `latest` dist-tag = current stable. `next` = pre-releases (`npm i <pkg>@next`).
- The public API is **additive-only** — it is whatever each lib's `src/index.ts` exports. Removing or
  changing an export is a breaking change and must be called out in the changelog with a migration note.

## Automated release

`release.yml` runs on every push to `main` (i.e. every PR merge):

1. Skips itself when the head commit is `chore(release): …` (so its own pushed-back commit doesn't loop).
2. Runs `pnpm nx release --skip-publish` — infers the bump from Conventional Commits, builds, stamps `dist/`,
   writes `CHANGELOG.md`, commits, and tags `v<version>`.
3. If no `feat`/`fix`/breaking commits exist since the last tag, it **no-ops** (HEAD doesn't move → nothing pushed).
4. Otherwise it pushes the commit + tag, and the tag push hands off to `publish.yml`.

To preview without cutting, run the workflow manually: **Actions → Release → Run workflow → `dry_run: true`**.

### Automated release setup (one-time)

`release.yml` pushes a commit + tag to the protected `main` branch, and that tag push must trigger
`publish.yml`. The default `GITHUB_TOKEN` can do **neither** (it can't bypass branch/tag protection, and tags
it pushes don't trigger other workflows). So the workflow uses a **`RELEASE_TOKEN`** secret:

1. Create a **fine-grained PAT** (or a GitHub App installation token) scoped to this repo with
   **Contents: Read and write**. (A GitHub App is the more secure, non-expiring option.)
2. Add it as the repo secret **`RELEASE_TOKEN`** (Settings → Secrets and variables → Actions).
3. On `main`'s **branch protection** and the **tag protection** for `v*`, add that token's identity to the
   **bypass / allowed-to-push** list — it is the only actor permitted to push release commits and tags directly.

Until `RELEASE_TOKEN` is configured, `release.yml` will fail at checkout/push; use the manual fallback below.

## Manual cut (fallback)

Use this only when automation is unavailable (no `RELEASE_TOKEN`, CI down, or a forced/odd release). Run from a
clean, up-to-date `main`:

```bash
# 1. Preview the inferred bump + changelog (no writes)
pnpm nx release --dry-run

# 2. Version + changelog + commit + tag (CI does the publish, not your machine)
pnpm nx release --skip-publish

# 3. Push the commit + tag → triggers the gated CI publish
git push --follow-tags
```

First-ever stable release only (no prior tag to diff against):

```bash
pnpm nx release 0.1.0 --first-release --skip-publish
git push --follow-tags
```

Pre-release on the `next` channel:

```bash
pnpm nx release prerelease --preid=next --skip-publish
git push --follow-tags        # CI publishes with --tag=next
```

## What CI does on a tag push

1. **`security-gate`** (required, blocks publish): tarball-content verification, secret scan (Gitleaks),
   dependency vuln scan (OSV-Scanner, blocks on HIGH/CRITICAL), license allowlist
   (fails on GPL/AGPL/unknown), package/type correctness (`publint` + `attw`), LICENSE-in-tarball check.
2. **`publish`** (`needs: security-gate`): `pnpm nx release publish --provenance` for both packages, via
   **OIDC Trusted Publishing** (no long-lived tokens) with **Sigstore provenance**.
3. Post-publish: `npm audit signatures` (advisory).

Recommended for risky changes: publish to `next`, smoke-test the **real published tarball** in a clean
directory, then promote — see Rollback below.

## Verify a published package

```bash
npm view @phuong-tran-redoc/document-engine-core version
npm audit signatures                       # confirms registry signature + provenance
```

## Rollback (a release went bad)

npm versions are immutable — you **supersede**, never "take back". In order of speed:

```bash
# 1. FASTEST — point `latest` back to the last good version (stops new installs getting the bad one)
npm dist-tag add @phuong-tran-redoc/document-engine-core@<lastGood> latest

# 2. Warn everyone (including pinned users)
npm deprecate @phuong-tran-redoc/document-engine-core@<bad> "BROKEN: <reason>. Fixed in <good>."

# 3. Forward-fix: branch → fix/revert → new patch tag → CI publishes the superseding version
```

- `core` and `angular` are coupled — roll back **both** in lock-step.
- Git stays forward-only: never delete/move a published tag; mark the bad GitHub Release as a pre-release.
- **Avoid `npm unpublish`** — it's allowed only within 72h, burns the version number permanently, and breaks
  downstream builds. Reserve it for a leaked-secret emergency (and rotate the secret first — unpublishing
  does not un-leak it).

## Reporting a security issue

See [`SECURITY.md`](./SECURITY.md).
