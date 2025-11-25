// src/app/robots.test.ts
import robots from './robots';

describe('robots', () => {
    it('should generate robots.txt with proper rules', () => {
        const robotsConfig = robots();

        // Check that all user agents are allowed
        expect(robotsConfig.rules).toBeDefined();
        expect(robotsConfig.rules.userAgent).toBe('*');
        expect(robotsConfig.rules.allow).toBe('/');
        expect(robotsConfig.rules.disallow).toBeUndefined();
    });

    it('should include sitemap URL', () => {
        const robotsConfig = robots();

        expect(robotsConfig.sitemap).toBeDefined();
        expect(robotsConfig.sitemap).toContain('https://krace.co.kr/sitemap.xml');
    });

    it('should allow search engine crawling', () => {
        const robotsConfig = robots();

        // Ensure no disallow rules that would block crawlers
        expect(robotsConfig.rules.disallow).toBeUndefined();
    });
});
