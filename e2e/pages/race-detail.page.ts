// e2e/pages/race-detail.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class RaceDetailPage extends BasePage {
    readonly raceTitle: Locator;
    readonly raceInfo: Locator;
    readonly entriesSection: Locator;
    readonly oddsSection: Locator;
    readonly resultsSection: Locator;
    readonly backButton: Locator;

    constructor(page: Page) {
        super(page);
        this.raceTitle = page.locator('h1').first();
        // Use more specific locators to avoid strict mode violations
        this.raceInfo = page.locator('[data-testid="race-info"]');
        this.entriesSection = page.locator('[data-testid="entries"]');
        this.oddsSection = page.locator('[data-testid="odds"]');
        this.resultsSection = page.locator('[data-testid="results"]');
        this.backButton = page.locator('a:has-text("목록")').first();
    }

    async gotoRace(raceId: string) {
        await super.goto(`/race/${raceId}`);
        await this.waitForPageLoad();
    }

    async getRaceTitle(): Promise<string> {
        return await this.raceTitle.textContent() || '';
    }

    async hasEntries(): Promise<boolean> {
        return await this.entriesSection.isVisible();
    }

    async hasOdds(): Promise<boolean> {
        return await this.oddsSection.isVisible();
    }

    async hasResults(): Promise<boolean> {
        return await this.resultsSection.isVisible();
    }

    async goBack() {
        await this.backButton.click();
        await this.waitForPageLoad();
    }
}
