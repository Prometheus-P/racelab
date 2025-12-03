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

test.describe('Results Page - Filter by Date and Type (US2)', () => {
  let resultsPage: ResultsPage;

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();
  });

  test('should display filter controls', async () => {
    // Date range filter
    await expect(resultsPage.dateFromInput).toBeVisible();
    await expect(resultsPage.dateToInput).toBeVisible();

    // Race type filter chips
    await expect(resultsPage.horseTypeChip).toBeVisible();
    await expect(resultsPage.cycleTypeChip).toBeVisible();
    await expect(resultsPage.boatTypeChip).toBeVisible();
  });

  test('should filter by date range', async ({ page }) => {
    // Set date range
    await resultsPage.setDateFrom('2023-12-01');
    await resultsPage.setDateTo('2023-12-31');

    // Wait for filtered results
    await resultsPage.waitForResults();

    // URL should reflect date filters
    expect(page.url()).toContain('dateFrom=2023-12-01');
    expect(page.url()).toContain('dateTo=2023-12-31');
  });

  test('should filter by horse race type', async ({ page }) => {
    // Click horse filter
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // URL should reflect type filter
    expect(page.url()).toContain('types=horse');

    // All visible cards should be horse races
    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="race-type-icon"]')).toContainText('🐎');
  });

  test('should filter by cycle race type', async ({ page }) => {
    await resultsPage.selectRaceType('cycle');
    await resultsPage.waitForResults();

    expect(page.url()).toContain('types=cycle');

    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="race-type-icon"]')).toContainText('🚴');
  });

  test('should filter by boat race type', async ({ page }) => {
    await resultsPage.selectRaceType('boat');
    await resultsPage.waitForResults();

    expect(page.url()).toContain('types=boat');

    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard.locator('[data-testid="race-type-icon"]')).toContainText('🚤');
  });

  test('should filter by multiple race types', async ({ page }) => {
    // Select both horse and cycle
    await resultsPage.selectRaceType('horse');
    await resultsPage.selectRaceType('cycle');
    await resultsPage.waitForResults();

    // URL should contain both types
    expect(page.url()).toMatch(/types=.*horse/);
    expect(page.url()).toMatch(/types=.*cycle/);
  });

  test('should combine date and type filters', async ({ page }) => {
    // Set date range
    await resultsPage.setDateFrom('2023-12-01');

    // Select horse type
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Both filters in URL
    expect(page.url()).toContain('dateFrom=2023-12-01');
    expect(page.url()).toContain('types=horse');
  });

  test('should show clear filter button when filters active', async () => {
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    await expect(resultsPage.clearFiltersButton).toBeVisible();
  });

  test('should clear all filters when clear button clicked', async ({ page }) => {
    // Apply filters
    await resultsPage.setDateFrom('2023-12-01');
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Clear filters
    await resultsPage.clearFilters();
    await resultsPage.waitForResults();

    // URL should not have filters
    expect(page.url()).not.toContain('dateFrom');
    expect(page.url()).not.toContain('types');
  });

  test('should update results count after filtering', async () => {
    const initialCount = await resultsPage.getTotalCount();

    // Apply filter
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Count should update (may be same or different)
    const filteredCount = await resultsPage.getTotalCount();
    expect(filteredCount).toBeTruthy();
  });

  test('should reset pagination when filter changes', async ({ page }) => {
    // Go to page 2
    await page.goto('/results?page=2');
    await resultsPage.waitForResults();

    // Apply filter
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Should reset to page 1
    expect(page.url()).not.toContain('page=2');
  });

  test('should preserve filters on page navigation', async ({ page }) => {
    // Apply filter
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Go to next page
    await resultsPage.goToNextPage();
    await resultsPage.waitForResults();

    // Filter should persist
    expect(page.url()).toContain('types=horse');
  });
});

test.describe('Results Page - Filter Mobile (US2)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should collapse filters by default on mobile', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Filter toggle should be visible
    await expect(resultsPage.filterToggle).toBeVisible();
  });

  test('should expand filters when toggle clicked', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();

    // Click toggle
    await resultsPage.filterToggle.click();

    // Filters should be visible
    await expect(resultsPage.dateFromInput).toBeVisible();
    await expect(resultsPage.horseTypeChip).toBeVisible();
  });

  test('should show active filter count on mobile', async ({ page }) => {
    const resultsPage = new ResultsPage(page);
    await page.goto('/results?types=horse&dateFrom=2023-12-01');
    await resultsPage.waitForResults();

    // Filter count badge should show
    await expect(resultsPage.filterCountBadge).toBeVisible();
    await expect(resultsPage.filterCountBadge).toContainText(/\d+/);
  });
});

test.describe('Results Page - Search by Jockey (US4)', () => {
  let resultsPage: ResultsPage;

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();
  });

  test('should display search input', async () => {
    await expect(resultsPage.searchInput).toBeVisible();
  });

  test('should search by jockey name', async ({ page }) => {
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    // URL should reflect search query
    expect(page.url()).toContain('jockey=');
  });

  test('should highlight matching jockey name in results', async () => {
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    // Check for highlight in result card
    const firstCard = resultsPage.resultCards.first();
    const highlight = firstCard.locator('[data-testid="search-highlight"], mark');
    // If results exist and contain the search term, there should be highlight
    const cardText = await firstCard.textContent();
    if (cardText?.includes('김기수')) {
      await expect(highlight).toBeVisible();
    }
  });

  test('should show no results message when search has no matches', async () => {
    await resultsPage.search('존재하지않는이름12345');
    await resultsPage.waitForResults();

    // Should show empty state
    await expect(resultsPage.emptyState).toBeVisible();
  });

  test('should clear search when clear button clicked', async ({ page }) => {
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    await resultsPage.clearSearch();
    await resultsPage.waitForResults();

    // URL should not have search param
    expect(page.url()).not.toContain('jockey=');
  });

  test('should combine search with filters', async ({ page }) => {
    // Apply type filter
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Apply search
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    // Both in URL
    expect(page.url()).toContain('types=horse');
    expect(page.url()).toContain('jockey=');
  });

  test('should reset pagination when search changes', async ({ page }) => {
    // Go to page 2
    await page.goto('/results?page=2');
    await resultsPage.waitForResults();

    // Search
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    // Should reset to page 1
    expect(page.url()).not.toContain('page=2');
  });

  test('should preserve search on pagination', async ({ page }) => {
    await resultsPage.search('김기수');
    await resultsPage.waitForResults();

    // Go to next page
    await resultsPage.goToNextPage();
    await resultsPage.waitForResults();

    // Search should persist
    expect(page.url()).toContain('jockey=');
  });
});

test.describe('Results Page - Filter by Track (US3)', () => {
  let resultsPage: ResultsPage;

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.goto();
    await resultsPage.waitForResults();
  });

  test('should display track filter dropdown', async () => {
    await expect(resultsPage.trackSelect).toBeVisible();
  });

  test('should show all tracks when no race type selected', async () => {
    // Track dropdown should contain tracks from all types
    await expect(resultsPage.trackSelect).toContainText('서울');
    await expect(resultsPage.trackSelect).toContainText('광명');
    await expect(resultsPage.trackSelect).toContainText('미사리');
  });

  test('should filter track options based on race type', async ({ page }) => {
    // Select horse type
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Track dropdown should only show horse tracks
    const options = resultsPage.trackSelect.locator('option');
    const optionTexts = await options.allTextContents();

    expect(optionTexts.join('')).toContain('서울');
    expect(optionTexts.join('')).not.toContain('광명');
  });

  test('should filter results by selected track', async ({ page }) => {
    // Select a track
    await resultsPage.selectTrack('서울');
    await resultsPage.waitForResults();

    // URL should reflect track filter
    expect(page.url()).toContain('track=서울');

    // All visible cards should be from Seoul track
    const firstCard = resultsPage.resultCards.first();
    await expect(firstCard).toContainText('서울');
  });

  test('should combine track with other filters', async ({ page }) => {
    // Apply type filter first
    await resultsPage.selectRaceType('horse');
    await resultsPage.waitForResults();

    // Then apply track filter
    await resultsPage.selectTrack('서울');
    await resultsPage.waitForResults();

    // Both filters in URL
    expect(page.url()).toContain('types=horse');
    expect(page.url()).toContain('track=서울');
  });

  test('should clear track when clear filters clicked', async ({ page }) => {
    // Apply track filter
    await resultsPage.selectTrack('서울');
    await resultsPage.waitForResults();

    // Clear filters
    await resultsPage.clearFilters();
    await resultsPage.waitForResults();

    // URL should not have track filter
    expect(page.url()).not.toContain('track=');
  });

  test('should preserve track filter on pagination', async ({ page }) => {
    // Apply track filter
    await resultsPage.selectTrack('서울');
    await resultsPage.waitForResults();

    // Go to next page
    await resultsPage.goToNextPage();
    await resultsPage.waitForResults();

    // Track filter should persist
    expect(page.url()).toContain('track=서울');
  });
});
