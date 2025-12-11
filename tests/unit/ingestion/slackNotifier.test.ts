/**
 * @jest-environment node
 *
 * Unit tests for slackNotifier service
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.Mock<any>;

// Mock fetch globally
const mockFetch = jest.fn() as MockFn;
global.fetch = mockFetch as unknown as typeof fetch;

describe('slackNotifier', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendSlackNotification', () => {
    it('should send notification to Slack webhook', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      } as Response);

      const { sendSlackNotification } = await import('@/ingestion/services/slackNotifier');

      await sendSlackNotification({
        type: 'error',
        title: 'Test Error',
        message: 'Test error message',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should skip notification if webhook URL is not configured', async () => {
      delete process.env.SLACK_WEBHOOK_URL;

      const { sendSlackNotification } = await import('@/ingestion/services/slackNotifier');

      await sendSlackNotification({
        type: 'error',
        title: 'Test',
        message: 'Test',
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { sendSlackNotification } = await import('@/ingestion/services/slackNotifier');

      // Should not throw
      await expect(
        sendSlackNotification({
          type: 'error',
          title: 'Test',
          message: 'Test',
        })
      ).resolves.not.toThrow();
    });

    it('should format error notification correctly', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      } as Response);

      const { sendSlackNotification } = await import('@/ingestion/services/slackNotifier');

      await sendSlackNotification({
        type: 'error',
        title: 'Ingestion Failed',
        message: 'KRA API timeout',
        fields: [
          { title: 'Job Type', value: 'schedule_poll' },
          { title: 'Race ID', value: 'horse-seoul-1-20241210' },
        ],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Ingestion Failed'),
        })
      );
    });

    it('should format warning notification correctly', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      } as Response);

      const { sendSlackNotification } = await import('@/ingestion/services/slackNotifier');

      await sendSlackNotification({
        type: 'warning',
        title: 'High Failure Rate',
        message: '5 failures in last hour',
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('notifyIngestionFailure', () => {
    it('should send formatted failure notification', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      } as Response);

      const { notifyIngestionFailure } = await import('@/ingestion/services/slackNotifier');

      await notifyIngestionFailure({
        jobType: 'odds_poll',
        entityId: 'horse-seoul-1-20241210',
        error: 'API timeout after 5 retries',
        retryCount: 5,
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
