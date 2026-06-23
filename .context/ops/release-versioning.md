# Process ① — Release & Version Bump

> Process spec — the **why** behind the release config. Decision: [ADR-001](../decisions.md).
> Condensed human runbook: `/RELEASING.md`. Operational runbook (drives the steps): the `publish` skill
> (`.claude/skills/publish/`).

## Model (decided)

- **Tool:** `nx release` (native). No Changesets / release-please / semantic-release.
- **Relationship:** `fixed` — `core` and `angular` always carry the same version and bump together.
- **Local protocol:** `preserveLocalDependencyProtocols: false` → Nx writes a real semver range
  (`^x.y.z`) into the manifest at version time, so `workspace:*` never reaches npm.
- **Trigger:** PR merge to `main` → `release.yml` cuts version + tag (auto) → tag push → CI builds + publishes
  (gated by the `npm-publish` environment approval). No auto-publish-on-push; the publish step still waits for a
  reviewer. Manual `nx release` is the fallback.
- **Versioning driver:** Conventional Commits (`feat`→minor, `fix`→patch, `feat!`/`BREAKING CHANGE`→major).

## 0.x semver policy

- `0.MINOR` = breaking changes **and** notable new features (minor is the de-facto "major" pre-1.0).
- `0.x.PATCH` = bug fixes / internal only.
- Go `1.0.0` only when both packages' public API is stable and we'll commit to a deprecation cycle before breaking it.
- First intentional release: **`0.0.41 → 0.1.0`**.

## dist-tags

- Stable cuts → `latest`.
- Pre-releases → `next` (single pre-release channel). Consumers opt in via `npm i <pkg>@next`.

## Runbook

> **Normal path is automated.** Merging a PR to `main` triggers `.github/workflows/release.yml`, which runs
> `nx release --skip-publish` and pushes the commit + tag (via the `RELEASE_TOKEN` secret — see
> [`/RELEASING.md`](../../RELEASING.md) § "Automated release setup"). The commands below are the **manual
> fallback** for when automation is unavailable; `release.yml` runs the same `nx release` underneath.

**First stable cut (one-time):**
```bash
pnpm nx release 0.1.0 --first-release --dry-run      # preview version + changelog, no writes
pnpm nx release 0.1.0 --first-release --skip-publish # build → version src+dist → changelog → commit → tag v0.1.0
git push --follow-tags                               # tag push triggers gated CI publish
```
> `--first-release` is required only the first time (no prior git tag to diff against).

**Every subsequent release:**
```bash
pnpm nx release --dry-run         # preview bump inferred from conventional commits
pnpm nx release --skip-publish    # build → version → changelog → commit → tag
git push --follow-tags
```

**Pre-release:**
```bash
pnpm nx release prerelease --preid=next --skip-publish
git push --follow-tags
# CI publishes with: pnpm nx release publish --tag=next
```

> Prefer the soak-on-`next` → promote-`latest` pattern for risky releases — see [`incident-rollback.md`](incident-rollback.md) §Prevention.

---

## Version-stamping model (model B — what was implemented)

Git tag is the source of truth. **Source** `package.json` keeps `version: 0.0.41` (disk fallback) **and**
`workspace:*` — so local pnpm workspace linking is unaffected. The **dist** manifest is the only one stamped:
each project's `release.version.manifestRootsToUpdate: ["dist/{projectRoot}"]` (already in `project.json`) +
`preserveLocalDependencyProtocols: false` mean `nx release version` writes the new version **and** replaces
`workspace:*` → a real range, in `dist/` only.

Because `dist/` is gitignored, CI rebuilds from source and must re-stamp the tagged version before publishing —
`publish.yml` does this: `nx release version <tag-version> --git-commit=false --git-tag=false` (which runs the
build via `preVersionCommand`) → `nx release publish`.

> Fallback if the CI re-stamp path (`nx release version <v> --git-commit=false --git-tag=false` then
> `nx release publish`) ever proves fragile: model A — commit the version into source via
> `manifestRootsToUpdate: ["{projectRoot}"]`, accepting that `workspace:*` is rewritten in source.

## Implemented config

### `nx.json` (root `release` block) — DONE
```jsonc
"release": {
  "projects": ["tag:scope:public"],
  "projectsRelationship": "fixed",
  "releaseTagPattern": "v{version}",
  "version": {
    "conventionalCommits": true,
    "preserveLocalDependencyProtocols": false,
    "preVersionCommand": "pnpm nx run-many -t build --projects=tag:scope:public"
  },
  "changelog": { "workspaceChangelog": { "createRelease": false }, "projectChangelogs": false }
}
```
Per-project `manifestRootsToUpdate: ["dist/{projectRoot}"]` + `currentVersionResolver: git-tag` stay as-is.
`defaultBase` is `main`.

> **`createRelease: false` (not `"github"`).** The git `origin` remote uses an SSH host alias
> (`git@github-work:phuong-tran-redoc/document-engine.git`), so nx can't parse owner/repo to hit the GitHub
> API — local `nx release` failed at "Creating GitHub Release" with *"No remote repo data could be resolved"*.
> Git tag + `CHANGELOG.md` are the source of truth; a GitHub Release page is optional. Re-enable later by
> creating it from CI (clean `github.com` checkout + token).

### `publish.yml` — rewrite
- Drop the `paths`-on-push trigger; trigger on **tag push `v*`** (or `workflow_dispatch`).
- Add a `security-gate` job and make `publish` `needs: [security-gate]` (the hook point).
- Replace the per-dir `npm publish` steps with `pnpm nx release publish --provenance`.
- Add a post-publish `npm audit signatures` (advisory).

### Manifest fixes (both lib `package.json`)
- `repository.url` → `git+https://github.com/phuong-tran-redoc/document-engine.git` (exact match required for OIDC).
- Angular peer range `@angular/* >=14 <21` → `<22` (A21 consumers).

### Trusted Publishing checklist
- npm ≥ 11.5.1 in CI (the `npm install -g npm@latest` step covers it).
- Configure the trusted publisher **per-package** at `npmjs.com/package/<name>/access` (both packages).
- Keep `--provenance` explicit.

## Pre-existing bugs this fixes
1. **`npm publish` ships `workspace:*` un-rewritten** → consumers get `Unsupported URL Type "workspace:"`. Fixed by `preserveLocalDependencyProtocols: false`.
2. **No version-bump step** → CI republishes whatever is on disk. Fixed by `nx release version` in the flow.
3. `nx.json defaultBase: "master"` but branch is `main` (breaks `nx affected`). Fixed → `"main"`.
4. Zero git tags → resolver falls back to disk. Fixed once the first `v0.1.0` tag exists.

## Sources
nx.dev/docs/guides/nx-release · updating-version-references · nrwl/nx#27729, #29454, #27823 ·
pnpm/pnpm#4624 · github.blog OIDC GA (2025-07-31) · semver.org
