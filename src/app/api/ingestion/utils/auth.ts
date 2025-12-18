import { NextRequest, NextResponse } from 'next/server';

interface AuthErrorBody {
  success: false;
  error: { code: 'ENV_MISSING' | 'UNAUTHORIZED'; message: string };
  timestamp: string;
}

export function enforceCronSecret(request: NextRequest): NextResponse<AuthErrorBody> | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'ENV_MISSING', message: 'CRON_SECRET is not configured' },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  return null;
}
