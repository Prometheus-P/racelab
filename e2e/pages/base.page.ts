// e2e/pages/base.page.ts
import { Page } from '@playwright/test';

export class BasePage {
    constructor(protected page: Page) { }

    async goto(path: string = '/') {
        await this.page.goto(path);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    async screenshot(name: string) {
        await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    }
}
