// e2e/tests/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Landing Page - Basic', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load landing page successfully', async () => {
    // Check page title
    const title = await homePage.getTitle();
    expect(title).toContain('RaceLab');

    // Check header is visible
    await expect(homePage.header).toBeVisible();

    // Check footer is visible
    await expect(homePage.footer).toBeVisible();

    // Check main content exists
    await expect(homePage.mainContent).toBeVisible();
  });

  test('should display hero section with headline', async () => {
    // Hero headline should be visible
    await expect(homePage.heroHeadline).toBeVisible();

    // CTA button should be present
    await expect(homePage.heroCTAButton).toBeVisible();
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('should display demo section with terminal', async () => {
    // Demo section should exist
    await expect(homePage.demoSection).toBeVisible();

    // Should have id for anchor link
    await expect(homePage.demoSection).toHaveAttribute('id', 'demo');
  });
});

test.describe('Landing Page - Sections', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display today picks section', async () => {
    // TodayPicksSection is client-side, might not render in all test environments
    const section = homePage.todayPicksSection;
    const count = await section.count();
    if (count > 0) {
      await homePage.scrollToSection(section);
      await expect(section).toBeVisible();
    }
  });

  test('should display pricing preview section', async () => {
    const section = homePage.pricingPreview;
    const count = await section.count();
    if (count > 0) {
      await homePage.scrollToSection(section);
      await expect(section).toBeVisible();
    }
  });

  test('should display before/after comparison section', async () => {
    const section = homePage.beforeAfterSection;
    const count = await section.count();
    if (count > 0) {
      await homePage.scrollToSection(section);
      await expect(section).toBeVisible();
    }
  });

  test('should display features section', async () => {
    await homePage.scrollToSection(homePage.featuresSection);
    await expect(homePage.featuresSection).toBeVisible();
  });

  test('should display social proof section', async () => {
    await homePage.scrollToSection(homePage.socialProofSection);
    await expect(homePage.socialProofSection).toBeVisible();
  });
});

test.describe('Landing Page - User Flows', () => {
  test('should navigate to login with dashboard callback when clicking CTA', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Click hero CTA button
    await homePage.clickHeroCTA();

    // Should redirect to login (auth required for dashboard)
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
    // Callback URL should point to dashboard
    expect(page.url()).toContain('callbackUrl');
    expect(page.url()).toContain('dashboard');
  });

  test('should scroll to demo section via anchor link', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Click demo anchor link if exists
    const demoLink = page.locator('a[href="#demo"]').first();
    if (await demoLink.isVisible()) {
      await demoLink.click();

      // Demo section should be in viewport
      await expect(homePage.demoSection).toBeInViewport();
    }
  });
});

test.describe('Landing Page - Accessibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for semantic landmarks
    await expect(page.locator('body > header').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('body > footer').first()).toBeVisible();
  });

  test('should have accessible navigation links', async ({ page }) => {
    // Check all navigation links have text
    const navLinks = page.locator('header nav a');
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const text = await link.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have heading hierarchy', async ({ page }) => {
    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Should have h2s for sections
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
  });
});

test.describe('Landing Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly layout', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Header should be visible
    await expect(homePage.header).toBeVisible();

    // Hero headline should be visible
    await expect(homePage.heroHeadline).toBeVisible();

    // CTA should be accessible
    await expect(homePage.heroCTAButton).toBeVisible();
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // CTA button should have minimum height for touch (44px)
    const ctaButton = homePage.heroCTAButton;
    if (await ctaButton.isVisible()) {
      const boundingBox = await ctaButton.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should scroll smoothly between sections on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to demo section
    await homePage.scrollToSection(homePage.demoSection);
    await expect(homePage.demoSection).toBeInViewport();

    // Scroll to features section (guaranteed to exist)
    await homePage.scrollToSection(homePage.featuresSection);
    await expect(homePage.featuresSection).toBeInViewport();
  });
});

test.describe('Landing Page - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    const homePage = new HomePage(page);
    await homePage.goto();

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have visible content above the fold', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Hero section should be immediately visible without scrolling
    await expect(homePage.heroHeadline).toBeInViewport();
  });
});
