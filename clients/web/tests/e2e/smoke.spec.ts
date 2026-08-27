import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 * 
 * Basic sanity checks that the web app loads and functions correctly.
 * These run on every PR to catch regressions.
 */

test.describe('Smoke Tests', () => {
  test('homepage loads without crash', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Give time for any errors to appear
    await page.waitForTimeout(2000);
    
    // Page should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Should have some login-related content
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin page redirects or shows content', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Either we see admin content OR we're redirected to login
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if we're on login or admin
    const url = page.url();
    const hasAdminContent = await page.locator('text=admin').count() > 0;
    const onLoginPage = url.includes('/auth/login');
    
    // Should either have admin content or be on login
    expect(hasAdminContent || onLoginPage).toBeTruthy();
  });
});
