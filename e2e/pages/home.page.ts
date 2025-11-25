// e2e/pages/home.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
    readonly header: Locator;
    readonly footer: Locator;
    readonly quickStats: Locator;
    readonly todayRaces: Locator;
    readonly horseTab: Locator;
    readonly cycleTab: Locator;
    readonly boatTab: Locator;
    readonly raceCards: Locator;

    constructor(page: Page) {
        super(page);
        this.header = page.locator('header');
        this.footer = page.locator('footer');
        this.quickStats = page.locator('[data-testid="quick-stats"]').or(page.locator('text=빠른 통계'));
        this.todayRaces = page.locator('[data-testid="today-races"]').or(page.locator('text=오늘의 경주'));
        this.horseTab = page.locator('button:has-text("경마")');
        this.cycleTab = page.locator('button:has-text("경륜")');
        this.boatTab = page.locator('button:has-text("경정")');
        this.raceCards = page.locator('[data-testid="race-card"]').or(page.locator('a[href*="/race/"]'));
    }

    async goto() {
        await super.goto('/');
        await this.waitForPageLoad();
    }

    async switchToTab(type: 'horse' | 'cycle' | 'boat') {
        const tab = type === 'horse' ? this.horseTab : type === 'cycle' ? this.cycleTab : this.boatTab;
        await tab.click();
        await this.page.waitForTimeout(500); // Wait for tab content to load
    }

    async clickFirstRaceCard() {
        await this.raceCards.first().click();
        await this.waitForPageLoad();
    }

    async getRaceCardCount(): Promise<number> {
        return await this.raceCards.count();
    }
}
