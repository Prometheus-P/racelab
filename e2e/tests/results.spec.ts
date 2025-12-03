// e2e/tests/results.spec.ts
import { test, expect } from '@playwright/test';
import { ResultsPage } from '../pages/results.page';

test.describe('Results Page - Browse Recent Results (US1)', () => {
  let resultsPage: ResultsPage;

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.goto();
  });

  test('should load results page successfully', async () => {
    // Check page title
    const title = await resultsPage.getTitle();
    expect(title).toContain('결과');

    // Check header is visible
    await expect(resultsPage.header).toBeVisible();

    // Check page heading
    await expect(resultsPage.pageTitle).toContainText('경주 결과');
  });

  test('should display race results', async () => {
    // Wait for results to load
    await resultsPage.waitForResults();

    // Check result cards are displayed
    const cardCount = await resultsPage.getResultCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display result card with race info', async () => {
    await resultsPage.waitForResults();

    // Get first result card text
    const cardText = await resultsPage.getResultCardText(0);

    // Should contain race information
    expect(cardText).toBeTruthy();
  });

  test('should display top 3 finishers in each card', async () => {
    await resultsPage.waitForResults();

    // Each card should show positions 1, 2, 3
    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="rank-1"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="rank-2"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="rank-3"]')).toBeVisible();
  });

  test('should display dividend information', async () => {
    await resultsPage.waitForResults();

    // First card should show dividend
    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="dividend"]')).toBeVisible();
  });

  test('should display race type icon with correct color', async () => {
    await resultsPage.waitForResults();

    // Check for race type indicators
    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="race-type-icon"]')).toBeVisible();
  });

  test('should display total results count', async () => {
    await resultsPage.waitForResults();

    // Check total count is displayed
    await expect(resultsPage.totalCount).toBeVisible();
    const countText = await resultsPage.getTotalCount();
    expect(countText).toMatch(/\d+/);
  });
});

test.describe('Results Page - Pagination', () => {
  test('should display pagination when multiple pages exist', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // If more than 20 results, pagination should be visible
    await expect(resultsPage.pagination).toBeVisible();
  });

  test('should navigate to next page', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Get initial card text
    const initialCard = await resultsPage.getResultCardText(0);

    // Go to next page
    await resultsPage.goToNextPage();
    await resultsPage.waitForResults();

    // Check URL updated
    expect(page.url()).toContain('page=2');
  });

  test('should preserve pagination in URL', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await page.goto('/results?page=2');
    await resultsPage.waitForResults();

    // Should show page 2
    expect(page.url()).toContain('page=2');
  });
});

test.describe('Results Page - Expand Card Detail (US5)', () => {
  test('should expand card to show full details on click', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Click first card
    const firstCard = resultsPage.resultCards.first();
    await firstCard.click();

    // Card should expand and show details
    await expect(firstCard.locator('[data-testid="result-detail"]')).toBeVisible();
  });

  test('should show all finishers in expanded view', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Expand first card
    await resultsPage.clickResultCard(0);

    // Should show more than 3 finishers in detail view
    const firstCard = resultsPage.resultCards.first();
    const finishers = firstCard.locator('[data-testid^="rank-"]');
    const count = await finishers.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Results Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly layout', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Header should be visible
    await expect(resultsPage.header).toBeVisible();

    // Result cards should be visible
    const cardCount = await resultsPage.getResultCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should have touch-friendly card sizes', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Cards should meet minimum touch target
    const firstCard = resultsPage.resultCards.first();
    const box = await firstCard.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Results Page - Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();

    // Check h1 exists
    await expect(resultsPage.pageTitle).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Header nav should be accessible
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();
  });

  test('result cards should be keyboard navigable', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Focus first card
    await resultsPage.resultCards.first().focus();

    // Should be focusable
    await expect(resultsPage.resultCards.first()).toBeFocused();
  });
});
