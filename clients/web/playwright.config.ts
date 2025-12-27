import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173', // Vite dev server default
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
        PUBLIC_API_URL: 'localhost',
        PUBLIC_API_SECURE: 'false',
        PUBLIC_API_PORT: '3001',
        PRIVATE_API_URL: 'localhost',
        PRIVATE_API_SECURE: 'false',
        PRIVATE_API_PORT: '3001',
    },
    timeout: 120 * 1000,
  },
});
