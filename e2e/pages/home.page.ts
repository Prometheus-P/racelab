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
        // Use more specific locators to avoid strict mode violations
        this.header = page.locator('body > header').first();
        this.footer = page.locator('body > footer').first();
        this.quickStats = page.locator('[data-testid="quick-stats"]');
        this.todayRaces = page.locator('[data-testid="today-races"]');
        // Tabs are implemented as Links with role="tab"
        this.horseTab = page.locator('a[role="tab"]#tab-horse');
        this.cycleTab = page.locator('a[role="tab"]#tab-cycle');
        this.boatTab = page.locator('a[role="tab"]#tab-boat');
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
        const firstCard = this.raceCards.first();
        await firstCard.waitFor({ state: 'visible' });
        await Promise.all([
            this.page.waitForURL(/\/race\//),
            firstCard.click()
        ]);
    }

    async getRaceCardCount(): Promise<number> {
        return await this.raceCards.count();
    }
}
