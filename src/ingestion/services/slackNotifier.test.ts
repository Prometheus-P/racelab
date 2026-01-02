/**
 * Slack Notifier Service Tests
 */

import {
  sendSlackNotification,
  notifyIngestionFailure,
  notifyRecoveryComplete,
  notifyMaxRetriesExceeded,
  notifyDailySummary,
} from './slackNotifier';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SlackNotifier', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendSlackNotification', () => {
    it('should skip notification when webhook URL is not configured', async () => {
      delete process.env.SLACK_WEBHOOK_URL;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendSlackNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Webhook URL not configured')
      );

      consoleSpy.mockRestore();
    });

    it('should send notification when webhook URL is configured', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValueOnce({ ok: true });

      await sendSlackNotification({
        type: 'success',
        title: 'Test Success',
        message: 'Operation completed',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].title).toBe('Test Success');
      expect(payload.attachments[0].text).toBe('Operation completed');
      expect(payload.attachments[0].color).toBe('good');
    });

    it('should use correct color for each notification type', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValue({ ok: true });

      const types = [
        { type: 'error' as const, color: 'danger' },
        { type: 'warning' as const, color: 'warning' },
        { type: 'success' as const, color: 'good' },
        { type: 'info' as const, color: '#2196F3' },
      ];

      for (const { type, color } of types) {
        await sendSlackNotification({
          type,
          title: `${type} notification`,
          message: 'Test',
        });

        const payload = JSON.parse(mockFetch.mock.lastCall[1].body);
        expect(payload.attachments[0].color).toBe(color);
      }
    });

    it('should include fields when provided', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValueOnce({ ok: true });

      await sendSlackNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
        fields: [
          { title: 'Field 1', value: 'Value 1' },
          { title: 'Field 2', value: 'Value 2', short: false },
        ],
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].fields).toHaveLength(2);
      expect(payload.attachments[0].fields[0]).toEqual({
        title: 'Field 1',
        value: 'Value 1',
        short: true,
      });
      expect(payload.attachments[0].fields[1]).toEqual({
        title: 'Field 2',
        value: 'Value 2',
        short: false,
      });
    });

    it('should log error when fetch fails', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendSlackNotification({
        type: 'error',
        title: 'Test',
        message: 'Test',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SlackNotifier] Error sending notification:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should log error when response is not ok', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendSlackNotification({
        type: 'error',
        title: 'Test',
        message: 'Test',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification: 400')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('notifyIngestionFailure', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValue({ ok: true });
    });

    it('should send warning for low retry count', async () => {
      await notifyIngestionFailure({
        jobType: 'schedule_poll',
        entityId: 'race-123',
        error: 'Connection timeout',
        retryCount: 1,
        maxRetries: 5,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('warning');
      expect(payload.attachments[0].title).toContain('schedule_poll');
    });

    it('should send error for high retry count (>= 3)', async () => {
      await notifyIngestionFailure({
        jobType: 'odds_poll',
        entityId: 'race-456',
        error: 'API Error',
        retryCount: 3,
        maxRetries: 5,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('danger');
    });

    it('should include all required fields', async () => {
      await notifyIngestionFailure({
        jobType: 'entry_poll',
        entityId: 'race-789',
        error: 'Database error',
        retryCount: 2,
        maxRetries: 5,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      const fields = payload.attachments[0].fields;

      expect(fields.find((f: { title: string }) => f.title === 'Job Type').value).toBe('entry_poll');
      expect(fields.find((f: { title: string }) => f.title === 'Entity ID').value).toBe('race-789');
      expect(fields.find((f: { title: string }) => f.title === 'Retry Count').value).toBe('2/5');
    });
  });

  describe('notifyRecoveryComplete', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValue({ ok: true });
    });

    it('should send success notification', async () => {
      await notifyRecoveryComplete({
        failureId: 'fail-123',
        jobType: 'result_poll',
        entityId: 'race-abc',
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('good');
      expect(payload.attachments[0].title).toContain('Recovery Complete');
    });

    it('should include failure ID in fields', async () => {
      await notifyRecoveryComplete({
        failureId: 'fail-999',
        jobType: 'schedule_poll',
        entityId: 'race-xyz',
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      const fields = payload.attachments[0].fields;

      expect(fields.find((f: { title: string }) => f.title === 'Failure ID').value).toBe('fail-999');
    });
  });

  describe('notifyMaxRetriesExceeded', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValue({ ok: true });
    });

    it('should send error notification', async () => {
      await notifyMaxRetriesExceeded({
        failureId: 'fail-max',
        jobType: 'odds_poll',
        entityId: 'race-max',
        retryCount: 5,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('danger');
      expect(payload.attachments[0].title).toContain('Max Retries Exceeded');
      expect(payload.attachments[0].text).toContain('manual intervention');
    });

    it('should include action required field', async () => {
      await notifyMaxRetriesExceeded({
        failureId: 'fail-action',
        jobType: 'entry_poll',
        entityId: 'race-action',
        retryCount: 5,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      const fields = payload.attachments[0].fields;

      expect(fields.find((f: { title: string }) => f.title === 'Action Required').value).toBe(
        'Manual review needed'
      );
    });
  });

  describe('notifyDailySummary', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      mockFetch.mockResolvedValue({ ok: true });
    });

    it('should send success notification when no failures', async () => {
      await notifyDailySummary({
        totalRaces: 50,
        successfulCollections: 50,
        failedCollections: 0,
        pendingFailures: 0,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('good');
      expect(payload.attachments[0].title).toContain('Daily Ingestion Summary');
    });

    it('should send info notification with some failures but few pending', async () => {
      await notifyDailySummary({
        totalRaces: 50,
        successfulCollections: 45,
        failedCollections: 5,
        pendingFailures: 3,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('#2196F3'); // info color
    });

    it('should send warning notification with many pending failures', async () => {
      await notifyDailySummary({
        totalRaces: 50,
        successfulCollections: 40,
        failedCollections: 10,
        pendingFailures: 8,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].color).toBe('warning');
    });

    it('should calculate correct success rate', async () => {
      await notifyDailySummary({
        totalRaces: 100,
        successfulCollections: 95,
        failedCollections: 5,
        pendingFailures: 0,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].text).toContain('95.0%');
    });

    it('should handle zero total races', async () => {
      await notifyDailySummary({
        totalRaces: 0,
        successfulCollections: 0,
        failedCollections: 0,
        pendingFailures: 0,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload.attachments[0].text).toContain('0%');
    });

    it('should include all stats in fields', async () => {
      await notifyDailySummary({
        totalRaces: 60,
        successfulCollections: 55,
        failedCollections: 5,
        pendingFailures: 2,
      });

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      const fields = payload.attachments[0].fields;

      expect(fields.find((f: { title: string }) => f.title === 'Total Races').value).toBe('60');
      expect(fields.find((f: { title: string }) => f.title === 'Successful').value).toBe('55');
      expect(fields.find((f: { title: string }) => f.title === 'Failed').value).toBe('5');
      expect(fields.find((f: { title: string }) => f.title === 'Pending Failures').value).toBe('2');
    });
  });
});
