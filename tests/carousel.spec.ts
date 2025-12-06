/**
 * Selfie PullAI - Template Carousel Tests
 * Tests for Feature 6: Template Carousel with lazy loading
 * 
 * TDD Verification: These tests verify the celebrity template carousel
 * is correctly implemented with proper accessibility and interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Feature 6: Template Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display carousel container', async ({ page }) => {
    await expect(page.locator('[data-testid="carousel-container"]')).toBeVisible();
  });

  test('should render celebrity templates', async ({ page }) => {
    // Wait for JavaScript to render templates
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    const templates = page.locator('.template-card');
    const count = await templates.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have at least 3 celebrity templates', async ({ page }) => {
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    const templates = page.locator('.template-card');
    const count = await templates.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should allow template selection via click', async ({ page }) => {
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    const firstTemplate = page.locator('.template-card').first();
    await firstTemplate.click();
    
    // Check if template is selected (has active class)
    await expect(firstTemplate).toHaveClass(/active|selected/);
  });

  test('should have accessible template buttons with aria-labels', async ({ page }) => {
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    const firstTemplate = page.locator('.template-card').first();
    const ariaLabel = await firstTemplate.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should be horizontally scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    const carousel = page.locator('[data-testid="carousel-container"]');
    const isScrollable = await carousel.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.waitForSelector('.template-card', { timeout: 5000 });
    
    // Tab to first template
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should be on a template or within carousel
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
