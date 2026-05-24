import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // sequential for shared backend state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    // Bypass auth storage for admin tests
    storageState: undefined,
  },
  projects: [
    // Admin tests use a saved auth state
    {
      name: 'admin-setup',
      testMatch: '**/admin-login.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin-tests',
      testMatch: '**/admin-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['admin-setup'],
    },
    // Public-facing tests (no auth needed)
    {
      name: 'public',
      testMatch: '**/checkout-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
