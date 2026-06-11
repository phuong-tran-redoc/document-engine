# Architecture Decision Records

<!-- Document important technical decisions and their rationale -->

---

### [2026-06-10] ADR-001 — Release tooling & versioning model: `nx release` (native), fixed/locked

**Context:** Two interdependent publishable packages (`document-engine-core`, `document-engine-angular`)
need a repeatable version-bump + changelog + publish flow. The repo is solo-maintained on Nx 22 + pnpm.
The current `publish.yml` auto-publishes on push-to-`main` with **no version-bump step** (republishes
whatever is on disk → 409 conflicts or accidental publishes), no changelog, no tag, no human gate.

**Decision:** Use Nx's native `nx release` (version + changelog + publish), with
`projectsRelationship: "fixed"` (both packages share one version, bump in lock-step) and
`preserveLocalDependencyProtocols: false`. Trigger releases manually from local
(`nx release --skip-publish` → `git push --follow-tags`); CI only builds + publishes on tag push, gated.
Do **not** adopt Changesets or release-please.

**Rationale:**
- `nx release` is built-in, understands the project graph and the `workspace:*` edge, and already has a
  partial `release` block. Zero new tooling.
- Changesets is built for multi-contributor OSS (intent-file ceremony + Release-PR bot) and has known
  friction with Nx's `dist/` output via ng-packagr. No payoff for a solo maintainer who already writes
  Conventional Commits.
- **Fixed** sidesteps an Nx bug: in *independent* mode, if angular bumps but core didn't, the `workspace:*`
  dep is left un-replaced (nrwl/nx#27729, closed "not planned"). Fixed keeps core always in the release set.
- `preserveLocalDependencyProtocols: false` makes Nx stamp a real semver range (`^0.1.0`) at version time,
  so the published manifest is correct whether published with npm or pnpm — fixes the latent broken-publish bug.

**Consequences:** First cut is `0.0.41 → 0.1.0` via `nx release 0.1.0 --first-release`. One git tag per
release (`v{version}`). One no-op version bump on the package that didn't change (cheap). Full procedure in
[`ops/release-versioning.md`](ops/release-versioning.md).

---

### [2026-06-10] ADR-002 — IP ownership / copyright holder: the company (Realestatedoc / Redoc)

**Context:** `LICENSE.md` (root + both libs) reads `Copyright 2025 Realestatedoc (Redoc)` (a company),
but the package `author` field reads `Duc Phuong (Jack)` (an individual). This contradiction was never
resolved and is fundamentally a "who owns the IP" question.

**Decision:** The **company (Realestatedoc / Redoc)** is the copyright holder. This is an in-house library;
under typical work-for-hire terms the employer owns the copyright. `author` becomes the company; Duc Phuong
is credited as a `contributor`.

**Rationale:** Built on company time/resources and related to the company's business → work-for-hire →
company owns it. Making the holder and `author` consistent removes the contradiction that downstream
consumers and license scanners would flag.

**Consequences (applied 2026-06-10 via de-007):**
- Root `LICENSE.md` normalized to `Copyright (c) 2025 Realestatedoc (Redoc).` (per-lib files already had `(c)`).
- Both lib `package.json`: `"author": "Realestatedoc (Redoc)"` + `"contributors": ["Duc Phuong (Jack) …"]`.
- Root `package.json` stays `UNLICENSED` + `private: true` (correct for the unpublished monorepo root).
- **Still open:** confirm the exact **registered legal entity name** — "Realestatedoc (Redoc)" is informal;
  swap in the registered name across the three `LICENSE.md` + both `author` fields if it differs.

---

### [2026-06-10] ADR-003 — Pre-publish security & legal gate scope: MUST-have baseline

**Context:** CI runs lint/test/build/e2e only — no dependency audit, secret scan, license scan, tarball
verification, or SBOM. The release flow needs a gate it can call before every publish.

**Decision:** Adopt the **MUST-have baseline** tier: tarball-content verification (`npm pack` denylist),
`files` allowlist, Gitleaks (secret scan), OSV-Scanner (vuln scan, block on HIGH/CRITICAL),
`license-checker-rseidelsohn` allowlist (fail on GPL/AGPL/unknown), publint + attw (export/type correctness),
dependency cooldown (`minimumReleaseAge`), `SECURITY.md`, Dependabot, and SHA-pinned GitHub Actions.
Defer the SHOULD tier (Socket.dev, OpenSSF Scorecard, CodeQL) and nice-to-haves (SBOM, attestations).

**Rationale:** Baseline is free, near-zero-noise, and blocks only genuinely publish-stopping issues — the
right weight for a solo-maintained small lib. Already have the two hardest wins (OIDC Trusted Publishing +
`--provenance`); the gate protects inputs (deps, secrets) and output (tarball contents).

**Consequences:** Single `security-gate` CI job that `publish` `needs:`. Nothing reaches npm unless green.
Full spec in [`ops/security-legal-gate.md`](ops/security-legal-gate.md).

---

## Template

### [Date] Decision Title

**Context:** Why this decision was needed

**Decision:** What was decided

**Rationale:** Why this option was chosen

**Consequences:** What this means going forward

---
