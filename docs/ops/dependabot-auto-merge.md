# Dependabot auto-merge & manual-review playbook

Tiered system that auto-lands only the truly-safe bumps (gated on green CI) and keeps everything
that ships in the published packages on a manual-review track. Implemented by
[`.github/workflows/dependabot-auto-merge.yml`](../../.github/workflows/dependabot-auto-merge.yml) +
[`.github/dependabot.yml`](../../.github/dependabot.yml).

## Why this exists

A Dependabot PR can edit the **published contract**, not just the demo app. `@tiptap/*`, for example,
is declared in three places that must stay in sync — root `devDependencies`, core `dependencies`,
angular `peerDependencies` — so a tiptap bump changes what every external consumer installs. CI catches
build/test/type/API-drift breakage, but it **cannot** catch a runtime-behavior regression that still
builds and passes tests. That residual risk only matters for **shipped** deps, which is exactly why
those are never auto-merged on minor/major.

## The tier table (what the workflow decides)

| Bump | Track | Rationale |
| --- | --- | --- |
| **`dev-dependency` patch or minor** (jest, eslint, prettier, playwright, `@types/*`, …) | AUTO | never ships to consumers |
| **`github-actions` non-major** | AUTO | CI plumbing; never enters the npm package |
| **framework-spine build tools** (`nx`, `@nx/*`, `@swc/*`, `ng-packagr`) — any version | MANUAL | dev-typed but workspace-wide blast radius; they build the published `.d.ts`/fesm output |
| **ANY `production`/peer dep — patch, minor _or_ major** (tiptap, `@floating-ui/dom`, lodash-es, angular, rxjs, …) | MANUAL | ships to / is resolved by consumers — even a patch edits the published contract |
| **every `major`** (incl. dev-tooling major) | MANUAL | breaking by definition; framework-spine majors are `ignore`d entirely |

**Golden rule (strict):** anything that enters the published npm package — or that a consumer resolves
as a peer — is **never** auto-merged, at any version level (patch included). A production patch still
edits the published contract, and CI cannot catch a runtime regression that still builds + tests green;
that residual risk is a human's call. Only build/test tooling and CI plumbing auto-merge, and never on a
major. Auto-merge is **not** blind merge — `gh pr merge --auto` waits for the branch-protection required
checks (`validate` + `e2e`) and only lands the PR once they are green.

How it is gated:

- `ci.yml` (`validate` + `e2e`) runs on **every** PR to `main` — the universal safety net.
- `security-gate.yml` (builds both libs; secret/vuln/license/tarball/publint/attw/API-surface) runs when
  a PR touches `libs/**` or `pnpm-lock.yaml` → **every npm Dependabot PR triggers the gate**.
  github-actions PRs only change `.github/workflows/**`, so they run `validate` + `e2e` but not the gate.
- `cooldown: 7 days` in `dependabot.yml` means we are never first to hit a bad release.

## Manual-review checklist

Order of questions:

0. **Mine the PR body FIRST.** Dependabot embeds the upstream **release notes**, **changelog**, **commits**,
   and a **compatibility score** right in the PR (collapsed `<details>` blocks) — read them before anything
   else and pull out breaking changes / deprecations / migration notes. This is the cheapest, richest signal
   and it tells you where to look in every step below.
1. **Is CI fully green?** Red → investigate the failure first; never merge red.
2. **Does it touch `libs/*/package.json`?** If yes it changes the published contract → scrutinize.
3. **patch / minor / major?** Major → the breaking notes you mined in step 0 drive what to test.
4. A **tiptap / angular major** affecting a published lib may force a **major bump of our own package**
   (it is breaking for our consumers) — coordinate, don't just merge.

Commands:

```bash
gh pr view <n>                   # 0. READ the body: release notes / changelog / commits / compat score
gh pr view <n> --comments        #    + any @dependabot / maintainer notes
gh pr checks <n>                 # 1. all required checks green?
gh pr diff <n> --name-only       # 2. touches libs/*/package.json?
gh pr checkout <n>               # 4. pull locally
pnpm install && pnpm build:libs && pnpm test:all && pnpm e2e:ci
# 5. for SHIPPED deps (tiptap, @floating-ui): run the app and exercise real features
pnpm start                       #    tables, dynamic fields, restricted editing, …
# 6. confirm tiptap is synced across all 3 manifests (root + core + angular)
grep -R '"@tiptap/core"' package.json libs/*/package.json
```

Don't reflex-reject. Default is **review-then-merge**. Close a PR only when:

- a **major isn't ready to adopt** → add an `ignore` rule in `dependabot.yml` so it doesn't reopen, or
- a bump **breaks the build with a non-trivial fix** → defer and note why.

> **Automated:** just point Claude at a PR in any phrasing — *"kiểm tra PR &lt;n&gt; giúp mình"*, *"PR &lt;n&gt;
> ổn chưa"*, *"verify/vet PR &lt;n&gt;"*, *"is PR &lt;n&gt; safe to merge"* — and it runs the verify-before-merge
> flow via the [`/dep-bump`](../../.claude/skills/dep-bump/SKILL.md) skill (Mode B): checkout → install →
> depth-appropriate checks → hands you the visual app check for shipped deps → merges on green + your OK →
> syncs your local `main`.

## After a PR merges — sync your local checkout

The merged commit updated `package.json` + `pnpm-lock.yaml` on `main`. Your working copy must catch up.

**AUTO-merged PR (dev tooling, non-major):** CI was green *before* it merged, so it cannot have broken the
build/tests. Just resync — nothing else:

```bash
git checkout main && git pull
pnpm install        # reconcile node_modules with the merged lockfile (required)
```

**MANUAL PR:** the heavy verification happens *before* merge (see below), so after merge the same two lines
are all you need. If `pnpm install` reports a lockfile/manifest mismatch, the merge was incomplete — investigate.

## Adapting a breaking major — verify + fix BEFORE merge

The rule: **never merge red.** For a major with API changes, verify on the PR branch, fix breakage there, and
only merge once `main` will stay green. `build:libs` (TypeScript compile) is the primary "what broke" detector
— it points at every broken call-site.

```bash
gh pr checkout <n>          # work on the PR's branch locally
pnpm install                # install the bumped deps
pnpm build:libs             # TS compile — API breaks show here with exact file:line
pnpm test:all
pnpm nx affected -t lint    # catches newly-promoted lint rules (e.g. angular-eslint prefer-control-flow)
pnpm api:check              # api-extractor: did the dep drift OUR published surface?
pnpm e2e:ci
# shipped deps (tiptap, @floating-ui): exercise the real app
pnpm start                  # tables, dynamic fields, restricted editing, …
```

The fix loop when something breaks:
1. `pnpm build:libs` → read the compile errors (exact call-sites).
2. Read the dependency's CHANGELOG / migration guide for that version range.
3. Fix the call-sites → rebuild → repeat until clean, then `test:all` + `e2e:ci`.
4. **Commit the fixes onto the PR branch** so the merge is green end-to-end (Dependabot stops managing a branch
   you push to — that's fine; you've taken it over).
5. If the break changes **our** public API (api-extractor flags drift) → it's breaking for our consumers → a
   **major/minor bump of our own package** may be required (see `RELEASING.md`).

For any **shipped/runtime** dep (a published lib's `dependencies`/`peerDependencies`), do the full
[`/dep-bump`](../../.claude/skills/dep-bump/SKILL.md) process — cohort lock-step, peer ranges, single-version
assertion, output/serialization check, Angular-floor guard. After merge, resync `main` as above.

## Repo settings (required for auto-merge to work)

Two one-time repo-admin settings, both prerequisites for `gh pr merge --auto`:

**1. Allow auto-merge.** Settings → General → Pull Requests → tick **"Allow auto-merge"**. Without it,
`gh pr merge --auto` errors (`Allow auto-merge` is disabled) and the workflow's AUTO step fails.

**2. Branch protection on `main`** — require the `validate` and `e2e` status checks before merge; that
is the condition `gh pr merge --auto` actually waits on.

**Do NOT** add `gate` (security-gate) as a globally-required check: github-actions Dependabot PRs never
trigger it, so requiring it globally would leave those PRs permanently un-mergeable. The gate still runs
and blocks on every npm PR (it touches `libs/**`/`pnpm-lock.yaml`); it is enforced by path, not by global
branch protection.

Configure once (repo admin):

```bash
gh api -X PUT repos/{owner}/{repo}/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[contexts][]=validate' \
  -f 'required_status_checks[contexts][]=e2e' \
  -F 'enforce_admins=false' \
  -F 'required_pull_request_reviews=null' \
  -F 'restrictions=null'
```

Or in the GitHub UI: **Settings → Branches → Add rule** on `main` → *Require status checks to pass* →
select `validate` and `e2e`.

## Verifying end-to-end

- A low-risk PR (a `@types/*` or a github-actions bump) should auto-merge **only after** CI goes green —
  watch the `Enable auto-merge` step queue it and GitHub land it once checks pass.
- A shipped-dep PR (a tiptap minor) should be **left untouched** and carry the `needs-manual-review`
  label.
