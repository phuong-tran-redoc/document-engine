# Next Steps: Phase 4 - E2E Tests in CI

> **Status:** Ready to implement  
> **Priority:** Medium  
> **Estimated Time:** 30 minutes - 1 hour

---

## 🎯 Goal

Add Playwright E2E tests to CI workflow so they run automatically on every Pull Request.

---

## ✅ Prerequisites

- [x] Phase 1 completed (CI workflow exists)
- [x] Phase 2 completed (Branch protection enabled)
- [x] E2E tests exist locally in `apps/document-engine-e2e`

---

## 📋 Implementation Steps

### Step 1: Verify E2E Tests Work Locally

Before adding to CI, make sure tests run successfully on your machine:

```bash
# Run E2E tests
pnpm nx e2e document-engine-e2e
```

**Expected result:** Tests should pass ✅

If tests fail, fix them first before proceeding.

---

### Step 2: Update CI Workflow

Edit `.github/workflows/ci.yml` and add the E2E job:

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
      # ... existing steps ...

  # NEW: E2E Testing Job
  e2e:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E Tests
        run: pnpm nx e2e document-engine-e2e

      - name: Upload Test Results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/document-engine-e2e/playwright-report/
          retention-days: 7
```

---

### Step 3: Test the Workflow

1. **Create a test branch:**

   ```bash
   git checkout -b test/e2e-ci
   ```

2. **Commit the workflow changes:**

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "ci: add E2E tests to CI workflow"
   git push origin test/e2e-ci
   ```

3. **Create a Pull Request** on GitHub

4. **Verify both jobs run:**
   - ✅ `validate` job (lint, test, build)
   - ✅ `e2e` job (Playwright tests)

---

### Step 4: Update Branch Protection

Once E2E tests are running successfully in CI:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click on `Protect main branch`
3. Scroll to **Require status checks to pass**
4. Click **Add checks**
5. Search and add: `e2e`
6. Click **Save changes**

Now both `validate` AND `e2e` must pass before merging!

---

## 🎨 Optional Optimizations

### Optimization 1: Run Only Affected E2E Tests

If you have multiple E2E projects, run only affected ones:

```yaml
- name: Run E2E Tests
  run: pnpm nx affected --target=e2e --base=origin/main
```

### Optimization 2: Skip E2E for Docs Changes

Add a condition to skip E2E for documentation-only changes:

```yaml
e2e:
  if: |
    !contains(github.event.head_commit.message, '[skip e2e]')
  runs-on: ubuntu-latest
  # ... rest of job
```

Usage:

```bash
git commit -m "docs: update README [skip e2e]"
```

### Optimization 3: Parallel Execution

E2E job already runs in parallel with `validate` job by default. No changes needed!

---

## 🐛 Troubleshooting

### Issue: Playwright browsers fail to install

**Error:** `Failed to install browsers`

**Solution:** Use `--with-deps` flag (already included in Step 2)

### Issue: E2E tests timeout in CI

**Error:** `Test timeout of 30000ms exceeded`

**Solution:** Increase timeout in `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 60000, // 60 seconds
  // ...
});
```

### Issue: Tests pass locally but fail in CI

**Possible causes:**

- Different screen sizes
- Missing environment variables
- Race conditions

**Solution:** Check Playwright report artifacts uploaded by the workflow.

---

## 📊 Expected Results

After completing Phase 4:

| Metric           | Before            | After                      |
| ---------------- | ----------------- | -------------------------- |
| CI/CD Completion | ~60-65%           | **~75-80%**                |
| E2E Coverage     | Local only        | ✅ CI + Local              |
| PR Validation    | Lint, Test, Build | Lint, Test, Build, **E2E** |

---

## 📝 Checklist

- [ ] E2E tests pass locally
- [ ] Updated `.github/workflows/ci.yml` with E2E job
- [ ] Tested workflow on a PR
- [ ] Both `validate` and `e2e` jobs pass
- [ ] Updated branch protection to require `e2e` status check
- [ ] Documented any project-specific E2E setup

---

## 🎉 Success Criteria

You'll know Phase 4 is complete when:

1. ✅ Every PR automatically runs E2E tests
2. ✅ PR cannot be merged if E2E tests fail
3. ✅ Test results are visible in PR checks
4. ✅ Failed test reports are uploaded as artifacts

---

## 📚 References

- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [GitHub Actions - Upload Artifacts](https://github.com/actions/upload-artifact)
- [Nx E2E Testing](https://nx.dev/recipes/playwright/e2e-testing)
