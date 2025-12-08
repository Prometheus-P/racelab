// e2e/tests/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Homepage', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test('should load homepage successfully', async () => {
        // Check page title
        const title = await homePage.getTitle();
        expect(title).toContain('RaceLab');

        // Check header is visible
        await expect(homePage.header).toBeVisible();

        // Check footer is visible
        await expect(homePage.footer).toBeVisible();
    });

    test('should display today races section', async () => {
        // Check today races section is visible
        await expect(homePage.todayRaces).toBeVisible();

        // Check race cards are displayed
        const raceCardCount = await homePage.getRaceCardCount();
        expect(raceCardCount).toBeGreaterThan(0);
    });

    test('should switch between race type tabs', async ({ page }) => {
        // Switch to horse racing tab
        await homePage.switchToTab('horse');
        await expect(homePage.horseTab).toHaveAttribute('aria-selected', 'true');

        // Switch to cycle racing tab
        await homePage.switchToTab('cycle');
        await expect(homePage.cycleTab).toHaveAttribute('aria-selected', 'true');

        // Switch to boat racing tab
        await homePage.switchToTab('boat');
        await expect(homePage.boatTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should navigate to race detail page when clicking race card', async ({ page }) => {
        // Click first race card
        await homePage.clickFirstRaceCard();

        // Check URL changed to race detail page
        expect(page.url()).toContain('/race/');

        // Check race detail page loaded
        await expect(page.locator('h1')).toBeVisible();
    });

    test('should have proper SEO meta tags', async ({ page }) => {
        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /.+/);

        // Check Open Graph tags
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveAttribute('content', /.+/);
    });
});

test.describe('Homepage - Critical User Flows', () => {
    test('complete user journey: home → race detail → back', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goto();

        // Verify home page loaded
        await expect(homePage.todayRaces).toBeVisible();

        // Click first race card
        await homePage.clickFirstRaceCard();

        // Verify navigation to race detail
        expect(page.url()).toContain('/race/');
        await expect(page.locator('h1')).toBeVisible();

        // Navigate back
        await page.goBack();

        // Verify returned to homepage
        await expect(homePage.todayRaces).toBeVisible();
    });

    test('should preserve tab selection on page reload', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goto();

        // Switch to cycle tab
        await homePage.switchToTab('cycle');
        expect(page.url()).toContain('tab=cycle');

        // Reload page
        await page.reload();

        // Tab should still be selected (via URL param)
        await expect(page.url()).toContain('tab=cycle');
    });

    test('should display quick stats for all race types', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goto();

        // Check quick stats section exists
        await expect(homePage.quickStats).toBeVisible();
    });
});

test.describe('Homepage - Accessibility', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test('should have semantic HTML structure', async ({ page }) => {
        // Check for semantic landmarks (use .first() to avoid strict mode violation)
        await expect(page.locator('body > header').first()).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
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

    test('race cards should be keyboard navigable', async ({ page }) => {
        // Focus on the first race card directly
        const firstRaceCard = page.locator('[data-testid="race-card"]').first();
        await firstRaceCard.focus();

        // Press Enter to navigate
        await page.keyboard.press('Enter');

        // Should navigate to race detail
        await page.waitForURL(/\/race\//, { timeout: 10000 });
    });
});

test.describe('Homepage - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display mobile-friendly layout', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goto();

        // Header should be visible
        await expect(homePage.header).toBeVisible();

        // Race cards should be visible
        const raceCardCount = await homePage.getRaceCardCount();
        expect(raceCardCount).toBeGreaterThan(0);
    });

    test('should allow tab switching on mobile', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.goto();

        // All tabs should be tappable
        await homePage.switchToTab('horse');
        await homePage.switchToTab('cycle');
        await homePage.switchToTab('boat');
    });
});
