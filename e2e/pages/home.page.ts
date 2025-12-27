// e2e/pages/home.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  // Layout
  readonly header: Locator;
  readonly footer: Locator;
  readonly mainContent: Locator;

  // Landing Page Sections
  readonly heroSection: Locator;
  readonly heroHeadline: Locator;
  readonly heroCTAButton: Locator;
  readonly liveTicker: Locator;
  readonly todayPicksSection: Locator;
  readonly todayPicksCards: Locator;
  readonly demoSection: Locator;
  readonly demoTerminal: Locator;
  readonly interactiveDemo: Locator;
  readonly strategyButtons: Locator;
  readonly pricingPreview: Locator;
  readonly beforeAfterSection: Locator;
  readonly socialProofSection: Locator;
  readonly featuresSection: Locator;
  readonly leadMagnetSection: Locator;
  readonly ctaSection: Locator;

  constructor(page: Page) {
    super(page);
    // Layout elements
    this.header = page.locator('body > header').first();
    this.footer = page.locator('body > footer').first();
    this.mainContent = page.locator('main').first();

    // Hero Section
    this.heroSection = page.locator('section').filter({ hasText: /백테스팅|전략|RaceLab/ }).first();
    this.heroHeadline = page.locator('h1');
    this.heroCTAButton = page.locator('a[href="/dashboard"]').first();

    // Live Ticker
    this.liveTicker = page.locator('[class*="animate-scroll"]').first();

    // Today Picks Section
    this.todayPicksSection = page.locator('section').filter({ hasText: '오늘의 주목 경주' });
    this.todayPicksCards = this.todayPicksSection.locator('[class*="rounded-xl"]');

    // Demo Section
    this.demoSection = page.locator('section#demo');
    this.demoTerminal = page.locator('[class*="bg-neutral-900"], [class*="bg-neutral-800"]').first();

    // Interactive Demo (in Hero)
    this.interactiveDemo = page.locator('[class*="InteractiveDemo"], section').filter({ hasText: '전략 체험' }).first();
    this.strategyButtons = page.locator('button').filter({ hasText: /역배팅|급등|안정형/ });

    // Pricing Preview
    this.pricingPreview = page.locator('section').filter({ hasText: '간단한 요금제' });

    // Before/After Section
    this.beforeAfterSection = page.locator('section').filter({ hasText: /감 vs 데이터|결과가 다릅니다/ });

    // Social Proof Section
    this.socialProofSection = page.locator('section').filter({ hasText: '베타 테스터들의 후기' });

    // Features Section
    this.featuresSection = page.locator('section').filter({ hasText: '데이터 기반 의사결정' });

    // Lead Magnet Section
    this.leadMagnetSection = page.locator('section').filter({ hasText: '백테스트 전략 가이드' });

    // CTA Section
    this.ctaSection = page.locator('section').filter({ hasText: '데이터로 승부하세요' });
  }

  async goto() {
    await super.goto('/');
    await this.waitForPageLoad();
  }

  async clickStrategyButton(index: number = 0) {
    const buttons = this.strategyButtons;
    const count = await buttons.count();
    if (count > index) {
      await buttons.nth(index).click();
    }
  }

  async clickHeroCTA() {
    await this.heroCTAButton.click();
  }

  async getTodayPicksCount(): Promise<number> {
    return await this.todayPicksCards.count();
  }

  async scrollToSection(section: Locator) {
    await section.scrollIntoViewIfNeeded();
  }

  async isLiveTickerAnimating(): Promise<boolean> {
    const ticker = this.liveTicker;
    if (await ticker.isVisible()) {
      const style = await ticker.getAttribute('style');
      const classList = await ticker.getAttribute('class');
      return classList?.includes('animate') || style?.includes('animation') || false;
    }
    return false;
  }
}
