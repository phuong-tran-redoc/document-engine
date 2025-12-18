# How to Tag E2E Tests for CI

## 🎯 Best Practice: Tag at `test.describe()` Level

Instead of tagging each individual test, tag the entire describe block:

```typescript
import { test, expect } from '@playwright/test';

// ✅ GOOD: Tag once for all tests in this file
test.describe('@ci Editor Basic Tests', () => {
  test('should do something', async ({ page }) => {
    // This test will run on CI
  });

  test('should do another thing', async ({ page }) => {
    // This test will also run on CI
  });
});
```

**Benefits:**

- ✅ Cleaner code
- ✅ Easier to maintain
- ✅ One place to control CI execution for entire file

---

## 📝 Alternative: Tag Individual Tests

If you need fine-grained control:

```typescript
test.describe('Mixed Tests', () => {
  // This runs on CI
  test('@ci critical feature', async ({ page }) => {
    // ...
  });

  // This only runs locally
  test('edge case scenario', async ({ page }) => {
    // ...
  });
});
```

---

## 🎨 Multiple Tags

You can use multiple tags:

```typescript
// Runs on CI AND marked as smoke test
test.describe('@ci @smoke Login Tests', () => {
  // ...
});
```

Then filter by tag:

```bash
# Run only smoke tests
pnpm exec playwright test --grep @smoke

# Run CI tests
pnpm exec playwright test --project=ci
```

---

## 📂 Organizing Test Files

### Recommended Structure:

```
apps/document-engine-e2e/src/
├── critical/                    # All files tagged @ci
│   ├── login.spec.ts           # test.describe('@ci Login Tests')
│   ├── editor-basic.spec.ts    # test.describe('@ci Editor Basic')
│   └── navigation.spec.ts      # test.describe('@ci Navigation')
│
└── extended/                    # No @ci tag, local only
    ├── performance.spec.ts
    └── edge-cases.spec.ts
```

---

## 🔧 Current Configuration

### Playwright Config:

```typescript
// apps/document-engine-e2e/playwright.config.ts
projects: [
  {
    name: 'ci',
    grep: /@ci/, // Only runs tests/describes with @ci tag
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'local',
    // Runs all tests
    use: { ...devices['Desktop Chrome'] },
  },
];
```

### CI Workflow:

```yaml
# .github/workflows/ci.yml
- name: Run E2E Tests (CI Suite)
  run: pnpm exec playwright test --project=ci
```

---

## 📊 Examples

### Example 1: Entire File for CI

```typescript
// apps/document-engine-e2e/src/critical/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('@ci Login Tests', () => {
  test('should login with valid credentials', async ({ page }) => {
    // ...
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // ...
  });
});
```

**Result:** All tests in this file run on CI ✅

---

### Example 2: Mixed CI and Local Tests

```typescript
// apps/document-engine-e2e/src/editor.spec.ts
import { test, expect } from '@playwright/test';

// Critical tests - run on CI
test.describe('@ci Editor Core Features', () => {
  test('should type text', async ({ page }) => {
    // Runs on CI
  });
});

// Extended tests - local only
test.describe('Editor Edge Cases', () => {
  test('should handle 10000 characters', async ({ page }) => {
    // Only runs locally
  });
});
```

---

### Example 3: Nested Describes

```typescript
test.describe('@ci Document Operations', () => {
  // All nested tests inherit @ci tag

  test.describe('Create Document', () => {
    test('should create blank document', async ({ page }) => {
      // Runs on CI (inherited from parent)
    });
  });

  test.describe('Delete Document', () => {
    test('should delete document', async ({ page }) => {
      // Runs on CI (inherited from parent)
    });
  });
});
```

---

## ✅ Quick Reference

| Command                                       | What it does                     |
| --------------------------------------------- | -------------------------------- |
| `pnpm exec playwright test --project=ci`      | Run only @ci tagged tests        |
| `pnpm exec playwright test --project=local`   | Run all tests                    |
| `pnpm exec playwright test --grep @ci`        | Alternative way to run @ci tests |
| `pnpm exec playwright test --grep-invert @ci` | Run everything EXCEPT @ci tests  |

---

## 🎯 Recommendation

For this project:

1. **Tag entire files** with `test.describe('@ci ...')`
2. **Create folders** to organize:
   - `src/critical/` → All files tagged @ci
   - `src/extended/` → Local-only tests
3. **Keep it simple** - avoid mixing CI and local tests in same file

This makes it crystal clear which tests run on CI! 🚀
