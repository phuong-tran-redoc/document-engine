import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: 'retain-on-failure',
    // headless: false, // hoặc true vẫn được, nhưng nên test cả 2
    // viewport: { width: 1920, height: 1080 },
    // userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    // actionTimeout: 30000,
    // video: {
    //   mode: 'retain-on-failure',
    //   size: {
    //     width: 1920,
    //     height: 1080,
    //   },
    // },
  },

  /* Only run tests with @ci tag in CI environment */
  grep: process.env['CI'] ? /@ci/ : undefined,

  /* Run your local dev server before starting the tests */
  webServer: process.env['CI']
    ? {
        // CI: Serve static build (faster and more reliable)
        command: 'npx serve dist/apps/document-engine -l 4200',
        url: 'http://localhost:4200',
        reuseExistingServer: false,
        timeout: 60 * 1000, // 1 minute should be enough for static server
      }
    : {
        // Local: Use dev server
        command: 'pnpm exec nx run document-engine:serve',
        url: 'http://localhost:4200',
        reuseExistingServer: true, // Reuse existing server in dev
        cwd: workspaceRoot,
        timeout: 120 * 1000, // 2 minutes for slow builds
      },
  projects: [
    // CI Project: Only runs tests tagged with @ci
    {
      name: 'ci',
      grep: /@ci/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Local Project: Runs all tests
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'] },
    },

    // Optional: Other browsers for comprehensive testing
    // Uncomment if needed for cross-browser testing
    /* {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }, */
  ],
});
