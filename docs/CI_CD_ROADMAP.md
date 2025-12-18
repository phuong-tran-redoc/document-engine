# CI/CD Assessment & Roadmap

> **Document Engine Project** - CI/CD Implementation Status  
> Last updated: 2025-12-18

---

## Current Status: ~35-40%

### Assessment Matrix

| Component              | Status     | Description                            |
| ---------------------- | ---------- | -------------------------------------- |
| **CD - Deployment**    |            |                                        |
| Auto Publish to npm    | ✅ Done    | Triggers on push to `main` branch      |
| OIDC Authentication    | ✅ Done    | Trusted Publishing (no tokens needed)  |
| Provenance Attestation | ✅ Done    | Sigstore verification enabled          |
| **CI - Integration**   |            |                                        |
| PR Validation Workflow | ❌ Missing | No automated checks on Pull Requests   |
| Lint Check             | ❌ Missing | ESLint configured but not in CI        |
| Unit Tests             | ❌ Missing | Jest configured but not in CI          |
| E2E Tests              | ❌ Missing | Playwright configured but not in CI    |
| Build Validation       | 🔶 Partial | Only builds during publish, not on PRs |
| **Automation**         |            |                                        |
| Auto Version Bump      | ❌ Manual  | Requires manual version updates        |
| Changelog Generation   | ❌ Missing | No automated changelog                 |
| **Security**           |            |                                        |
| Branch Protection      | ❓ Unknown | Not verified                           |
| Dependency Scanning    | ❌ Missing | No Dependabot or similar               |

---

## Implementation Roadmap

### Phase 1: Basic CI Workflow (Priority: HIGH)

**Goal:** Validate code quality on every Pull Request

#### Step 1.1: Create CI Workflow File

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm nx affected --target=lint --base=origin/main

      - name: Test
        run: pnpm nx affected --target=test --base=origin/main

      - name: Build
        run: pnpm nx affected --target=build --base=origin/main
```

#### Step 1.2: Verify Nx Targets

Ensure these targets exist in `project.json` files:

- `lint` - ESLint validation
- `test` - Jest unit tests
- `build` - Production build

---

### Phase 2: Branch Protection (Priority: HIGH)

**Goal:** Prevent direct pushes to `main`, require PR reviews

#### Step 2.1: GitHub Repository Settings

1. Go to **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ☑️ Require a pull request before merging
   - ☑️ Require status checks to pass
   - ☑️ Require branches to be up to date

---

### Phase 3: Automated Versioning (Priority: MEDIUM)

**Goal:** Auto-bump version based on commit messages

#### Option A: Conventional Commits + semantic-release

1. Install: `pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git`
2. Configure `.releaserc.json`
3. Commit format: `feat:`, `fix:`, `chore:`, `BREAKING CHANGE:`

#### Option B: Changesets (simpler)

1. Install: `pnpm add -D @changesets/cli`
2. Run: `pnpm changeset init`
3. Before each PR: `pnpm changeset` to describe changes

---

### Phase 4: E2E Tests in CI (Priority: MEDIUM)

**Goal:** Run Playwright tests on PRs

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm exec playwright install --with-deps
    - run: pnpm nx e2e document-engine-e2e
```

---

### Phase 5: Security & Maintenance (Priority: LOW)

#### Step 5.1: Enable Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
```

#### Step 5.2: Code Coverage Reports

Add coverage reporting with Codecov or similar.

---

## Quick Start: Minimal CI/CD

To achieve a **basic complete CI/CD flow**, implement only:

1. ✅ **Phase 1.1** - Create CI workflow
2. ✅ **Phase 2.1** - Enable branch protection

This gives you:

- Automated validation on PRs
- Protected `main` branch
- Existing auto-publish on merge

**Estimated effort:** ~1-2 hours

---

## Publish Checklist

After modifying libraries, follow these steps:

1. **Bump version** in both:

   - `libs/document-engine-core/package.json`
   - `libs/document-engine-angular/package.json`

2. **Commit & Push**:

   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin main
   ```

3. **Monitor**: Check [GitHub Actions](https://github.com/phuong-tran-redoc/document-engine/actions)

4. **Verify**: Check packages on [npmjs.com](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core)

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx Affected Commands](https://nx.dev/concepts/affected)
- [npm Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements)
- [Conventional Commits](https://www.conventionalcommits.org/)
