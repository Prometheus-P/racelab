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
}
