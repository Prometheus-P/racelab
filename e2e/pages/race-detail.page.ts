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
        this.raceTitle = page.locator('h1');
        this.raceInfo = page.locator('[data-testid="race-info"]').or(page.locator('text=/경주장|시간|거리/'));
        this.entriesSection = page.locator('[data-testid="entries"]').or(page.locator('text=출마표'));
        this.oddsSection = page.locator('[data-testid="odds"]').or(page.locator('text=배당률'));
        this.resultsSection = page.locator('[data-testid="results"]').or(page.locator('text=경주 결과'));
        this.backButton = page.locator('a:has-text("목록")').or(page.locator('button:has-text("뒤로")'));
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
