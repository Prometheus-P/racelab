// e2e/pages/results.page.ts
import { Page, Locator } from '@playwright/test';

export class ResultsPage {
  readonly page: Page;
  readonly header: Locator;
  readonly pageTitle: Locator;
  readonly resultsList: Locator;
  readonly resultCards: Locator;
  readonly pagination: Locator;
  readonly loadingSkeleton: Locator;
  readonly emptyState: Locator;
  readonly totalCount: Locator;

  // Filter elements
  readonly dateFromInput: Locator;
  readonly dateToInput: Locator;
  readonly horseTypeChip: Locator;
  readonly cycleTypeChip: Locator;
  readonly boatTypeChip: Locator;
  readonly trackSelect: Locator;
  readonly searchInput: Locator;
  readonly searchClearButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly filterToggle: Locator;
  readonly filterCountBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.pageTitle = page.locator('h1');
    this.resultsList = page.locator('[data-testid="results-list"]');
    this.resultCards = page.locator('[data-testid^="result-card"]');
    this.pagination = page.locator('nav[aria-label*="페이지"]');
    this.loadingSkeleton = page.locator('[data-testid="results-skeleton"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.totalCount = page.locator('[data-testid="total-count"]');

    // Filter elements
    this.dateFromInput = page.locator('input[aria-label*="시작일"]');
    this.dateToInput = page.locator('input[aria-label*="종료일"]');
    this.horseTypeChip = page.locator('button[aria-label*="경마"]');
    this.cycleTypeChip = page.locator('button[aria-label*="경륜"]');
    this.boatTypeChip = page.locator('button[aria-label*="경정"]');
    this.trackSelect = page.locator('select[aria-label*="경기장"]');
    this.searchInput = page.locator('input[type="search"], input[aria-label*="검색"]');
    this.searchClearButton = page.locator('button[aria-label*="지우기"], button[aria-label*="초기화"]').first();
    this.clearFiltersButton = page.locator('button[aria-label*="필터 초기화"]');
    this.filterToggle = page.locator('button[aria-label*="필터"]').first();
    this.filterCountBadge = page.locator('[data-testid="filter-count"]');
  }

  async goto() {
    await this.page.goto('/results');
  }

  async getTitle(): Promise<string | null> {
    return this.page.title();
  }

  async getResultCardCount(): Promise<number> {
    return this.resultCards.count();
  }

  async clickResultCard(index: number) {
    await this.resultCards.nth(index).click();
  }

  async getResultCardText(index: number): Promise<string | null> {
    return this.resultCards.nth(index).textContent();
  }

  async goToPage(pageNumber: number) {
    await this.page.locator(`[data-testid="page-${pageNumber}"]`).click();
  }

  async goToNextPage() {
    await this.page.locator('button[aria-label*="다음"]').click();
  }

  async goToPreviousPage() {
    await this.page.locator('button[aria-label*="이전"]').click();
  }

  async waitForResults() {
    await this.resultsList.waitFor({ state: 'visible' });
  }

  async isLoading(): Promise<boolean> {
    return this.loadingSkeleton.isVisible();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  async getTotalCount(): Promise<string | null> {
    return this.totalCount.textContent();
  }

  // Filter methods
  async setDateFrom(date: string) {
    await this.dateFromInput.fill(date);
  }

  async setDateTo(date: string) {
    await this.dateToInput.fill(date);
  }

  async selectRaceType(type: 'horse' | 'cycle' | 'boat') {
    const chipMap = {
      horse: this.horseTypeChip,
      cycle: this.cycleTypeChip,
      boat: this.boatTypeChip,
    };
    await chipMap[type].click();
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async toggleFilters() {
    await this.filterToggle.click();
  }

  async selectTrack(track: string) {
    await this.trackSelect.selectOption(track);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async clearSearch() {
    await this.searchClearButton.click();
  }
}
