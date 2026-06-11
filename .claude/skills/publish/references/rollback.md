# Rollback / incident response

Read this when a published document-engine release went bad (`/publish rollback`, "deprecate", "the release is
broken", "a secret leaked"). Self-contained — drive it for the user.

## Doctrine

**Published npm versions are immutable and permanent. You never take a release back — you supersede it.**
Three levers, in order of speed/preference:

1. **dist-tag rollback** — fastest (seconds, no republish). Stops *new* installs getting the bad version.
2. **deprecate** — warns everyone (incl. pinned users) at install time. Permanent signpost.
3. **forward-fix patch** — the actual fix. Publish a new version that supersedes the bad one.

`npm unpublish` is almost always the **wrong** tool (see below). Reserve it for the secret-leak emergency.

## Decision tree

```
RELEASE WENT BAD
│
├─ Secret leaked / actively malicious? → §Secret-leak emergency FIRST (rotate!), then continue.
│
├─ STEP A (seconds): did the bad version get tagged `latest`?
│      → npm dist-tag add <pkg>@<lastGood> latest        # stop the bleeding
│
├─ STEP B (minutes): warn pinned users
│      → npm deprecate <pkg>@<bad> "BROKEN: <reason>. Fixed in <good>. npm i <pkg>@<good>"
│
└─ STEP C (real fix): publish a superseding version (forward-fix, never rewrite git history)
       ├─ revert of a feature that never worked → patch bump (0.1.0 → 0.1.1)
       ├─ corrected impl, same API            → patch bump
       └─ removes an API that shipped & was usable → minor/major (pre-1.0: 0.1.0 → 0.2.0)
```

## Commands

```bash
# FASTEST — re-point latest to last good (you ADD, never rm latest)
npm dist-tag add <pkg>@<lastGood> latest
npm dist-tag ls  <pkg>

# WARN — deprecate single version or range; un-deprecate with empty string
npm deprecate <pkg>@<bad>    "BROKEN: <reason>. Fixed in <good>."
npm deprecate <pkg>@"<<good>" "<reason>"     # range (also matches prereleases)
npm deprecate <pkg>@<bad>    ""              # UN-deprecate
```

## npm unpublish — why it's the wrong tool

Self-serve unpublish allowed only: within **72h** (and nothing depends on it), OR after 72h if **all** of
[no dependents · <300 downloads/week · single owner]. Consequences are permanent: `pkg@version` is **burned
forever** (can't republish even identical bytes); unpublishing *all* versions locks the name for **24h**; it
**breaks downstream builds** (left-pad). → deprecate + dist-tag + forward-patch keeps every consumer working.

## Coupled packages (core breaks angular)

1. dist-tag **both** back to last-good in lock-step.
2. deprecate the bad `core` **and** the matching `angular` if it pulls the bad core.
3. forward-patch both — publish `core` first, then `angular` pinned to the fixed core.
   Publish both at the **same version** (lock-step); angular depends on core with `^x.y.z` so a patched core is
   auto-adopted. An exact-pinned angular is itself broken → must be patched, not just deprecated.

## Git side — forward-only

- Do **not** delete/move the published tag or force-push the release commit (it's the provenance record).
- Fix on a branch → `git revert <bad-commit>` (or hand-fix) → merge → `git tag v<patch>` → `git push --follow-tags`.
- A bad GitHub Release (if one exists): **edit** it (banner `⚠️ Broken — superseded by vX`), set **pre-release**
  to drop the "Latest" badge. Cut a normal Release for the patch.

## Prevention — soak on `next`, then promote (the highest-leverage habit)

Never publish straight to `latest` for risky cuts. Use prerelease mode (`/publish next`), smoke-test the **real
published tarball** in a clean dir, then promote:
```bash
# after a `next` publish, in a throwaway dir:
TMP=$(mktemp -d); cd "$TMP"; npm init -y >/dev/null
npm install <pkg>@<version>
node -e "const m=require('<pkg>'); if(!m.<knownExport>){process.exit(1)} console.log('smoke ok')"
npm audit signatures
# only after green → promote:
npm dist-tag add <pkg>@<version> latest
```
For angular, install both published packages into a throwaway app and run a real `ng build` — SSR/compiler
breakage only shows in a real build.

## Secret-leak emergency

A leaked secret is **rotate-first** — removing the version does NOT un-leak it (mirrors/CDN/scrapers cache it).
1. **ROTATE** the credential at its source immediately (the only action that neutralizes the leak).
2. dist-tag `latest` back to the last clean version (stop new exposure).
3. `npm unpublish <pkg>@<bad>` **only if** it qualifies under the 72h policy (surface reduction, not a fix).
   Never `--force` the whole package (24h name lock breaks downstream).
4. `npm deprecate <pkg>@<bad> "SECURITY: ... (rotated). Upgrade to <good>."` regardless.
5. Forward-patch a clean version; `npm pack --dry-run` to confirm the secret is gone; add the path to `files`.
6. Report to npm if a malware / out-of-policy takedown is needed.
7. Rotate any *other* secret reachable from the build environment.
