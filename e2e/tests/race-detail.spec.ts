// e2e/tests/race-detail.spec.ts
import { test, expect } from '@playwright/test';
import { RaceDetailPage } from '../pages/race-detail.page';

test.describe('Race Detail Page', () => {
    let raceDetailPage: RaceDetailPage;

    test.beforeEach(async ({ page }) => {
        raceDetailPage = new RaceDetailPage(page);
    });

    test('should load race detail page successfully', async ({ page }) => {
        // Navigate to a specific race (using dummy data)
        await raceDetailPage.gotoRace('horse-1-1-20240115');

        // Check page loaded
        const title = await raceDetailPage.getRaceTitle();
        expect(title.length).toBeGreaterThan(0);

        // Check race info is visible
        await expect(raceDetailPage.raceInfo).toBeVisible();
    });

    test('should display race basic information', async ({ page }) => {
        await raceDetailPage.gotoRace('horse-1-1-20240115');

        // Check race title
        const title = await raceDetailPage.getRaceTitle();
        expect(title).toMatch(/경주|제\d+경주/);

        // Check race info contains track, time, distance
        const raceInfoText = await raceDetailPage.raceInfo.textContent();
        expect(raceInfoText).toBeTruthy();
    });

    test('should display entries section', async ({ page }) => {
        await raceDetailPage.gotoRace('horse-1-1-20240115');

        // Check entries section is visible
        const hasEntries = await raceDetailPage.hasEntries();
        expect(hasEntries).toBe(true);
    });

    test('should display odds section', async ({ page }) => {
        await raceDetailPage.gotoRace('horse-1-1-20240115');

        // Check odds section is visible
        const hasOdds = await raceDetailPage.hasOdds();
        expect(hasOdds).toBe(true);
    });

    test('should handle 404 for invalid race ID', async ({ page }) => {
        await raceDetailPage.gotoRace('invalid-race-id');

        // Check for 404 or error message
        const pageContent = await page.textContent('body');
        expect(pageContent).toMatch(/찾을 수 없습니다|404|Not Found/i);
    });

    test('should have proper meta tags for SEO', async ({ page }) => {
        await raceDetailPage.gotoRace('horse-1-1-20240115');

        // Check page title
        const title = await page.title();
        expect(title).toContain('경주');
        expect(title).toContain('KRace');

        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
});
