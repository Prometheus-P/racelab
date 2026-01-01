/**
 * Alerting Utilities
 *
 * 운영 알림을 위한 유틸리티 (Slack, 로깅 등)
 */

interface AlertPayload {
  level: 'info' | 'warn' | 'error' | 'critical';
  title: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp?: string;
}

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

const LEVEL_EMOJI: Record<AlertPayload['level'], string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  critical: '🚨',
};

/**
 * Send alert to Slack webhook
 * Falls back to console logging if SLACK_WEBHOOK_URL is not configured
 */
export async function sendAlert(payload: AlertPayload): Promise<boolean> {
  const { level, title, message, context, timestamp = new Date().toISOString() } = payload;

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // Log to console regardless (for CloudWatch/Vercel logs)
  const logFn = level === 'critical' || level === 'error' ? console.error : console.warn;
  logFn(`[Alert/${level.toUpperCase()}] ${title}: ${message}`, context || '');

  // If no webhook configured, just log
  if (!webhookUrl) {
    console.log('[Alerting] SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return false;
  }

  try {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${LEVEL_EMOJI[level]} ${title}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
    ];

    // Add context fields if provided
    if (context && Object.keys(context).length > 0) {
      blocks.push({
        type: 'section',
        fields: Object.entries(context).slice(0, 10).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${String(value).slice(0, 100)}`,
        })),
      });
    }

    // Add timestamp footer
    blocks.push({
      type: 'context',
      text: {
        type: 'mrkdwn',
        text: `📅 ${timestamp}`,
      },
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      console.error('[Alerting] Slack webhook failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Alerting] Failed to send Slack notification:', error);
    return false;
  }
}

/**
 * Send critical error alert (high priority)
 */
export async function alertCritical(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ level: 'critical', title, message, context });
}

/**
 * Send error alert
 */
export async function alertError(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ level: 'error', title, message, context });
}

/**
 * Send warning alert
 */
export async function alertWarn(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ level: 'warn', title, message, context });
}
