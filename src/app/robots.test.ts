// src/app/robots.test.ts
import robots from './robots';

describe('robots', () => {
    it('should generate robots.txt with proper rules', () => {
        const robotsConfig = robots();
        const rules = robotsConfig.rules;

        // Check that all user agents are allowed
        expect(rules).toBeDefined();

        // Type guard: rules can be object or array
        if (!Array.isArray(rules)) {
            expect(rules.userAgent).toBe('*');
            expect(rules.allow).toBe('/');
            expect(rules.disallow).toBeUndefined();
        }
    });

    it('should include sitemap URL', () => {
        const robotsConfig = robots();

        expect(robotsConfig.sitemap).toBeDefined();
        expect(robotsConfig.sitemap).toContain('/sitemap.xml');
    });

    it('should allow search engine crawling', () => {
        const robotsConfig = robots();
        const rules = robotsConfig.rules;

        // Type guard: rules can be object or array
        if (!Array.isArray(rules)) {
            // Ensure no disallow rules that would block crawlers
            expect(rules.disallow).toBeUndefined();
        }
    });
});
