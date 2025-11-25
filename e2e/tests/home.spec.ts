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
        expect(title).toContain('KRace');

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
