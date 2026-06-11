# Releasing

How `@phuong-tran-redoc/document-engine-core` and `@phuong-tran-redoc/document-engine-angular` are versioned,
published, and rolled back.

> Releases are driven by **`nx release`** (native Nx). The two packages are versioned **in lock-step**
> (fixed relationship) — they always carry the same version and bump together. Publishing happens in CI on a
> tag push, behind a required security/legal gate. **Never** publish from a laptop directly to `latest`.

## Versioning policy

- Driven by **Conventional Commits** (`feat:` → minor, `fix:` → patch, `feat!` / `BREAKING CHANGE:` → major).
- While `0.x`: a **minor** bump may carry breaking changes (minor is the de-facto "major" pre-1.0); **patch**
  is bug-fix only. We go `1.0.0` only when the public API is stable.
- `latest` dist-tag = current stable. `next` = pre-releases (`npm i <pkg>@next`).
- The public API is **additive-only** — it is whatever each lib's `src/index.ts` exports. Removing or
  changing an export is a breaking change and must be called out in the changelog with a migration note.

## Cut a release

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
