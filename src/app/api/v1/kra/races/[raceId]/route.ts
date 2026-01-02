/**
 * GET /api/v1/kra/races/[raceId]
 *
 * 특정 경주 정보 조회
 *
 * raceId 형식: {meet}-{raceNo}-{date}
 * 예: 1-5-20241225 (서울 5경주, 2024년 12월 25일)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRace } from '@/lib/api/kra';

// Valid meet codes: 1=서울, 2=제주, 3=부산/부경
const VALID_MEET_CODES = ['1', '2', '3'];

type Params = { raceId: string };

/**
 * Parse raceId into components
 */
function parseRaceId(raceId: string): {
  valid: boolean;
  error?: string;
  meet?: string;
  raceNo?: number;
  date?: string;
} {
  const parts = raceId.split('-');

  if (parts.length !== 3) {
    return {
      valid: false,
      error: 'Invalid raceId format. Expected: {meet}-{raceNo}-{date} (e.g., 1-5-20241225)',
    };
  }

  const [meet, raceNoStr, date] = parts;

  // Validate meet code
  if (!VALID_MEET_CODES.includes(meet)) {
    return {
      valid: false,
      error: `Invalid meet code: ${meet}. Valid values: 1 (서울), 2 (제주), 3 (부산/부경)`,
    };
  }

  // Validate race number
  const raceNo = parseInt(raceNoStr, 10);
  if (isNaN(raceNo) || raceNo < 1 || raceNo > 16) {
    return {
      valid: false,
      error: `Invalid race number: ${raceNoStr}. Must be between 1 and 16`,
    };
  }

  // Validate date format (YYYYMMDD)
  if (!/^\d{8}$/.test(date)) {
    return {
      valid: false,
      error: 'Invalid date format in raceId. Expected: YYYYMMDD',
    };
  }

  return {
    valid: true,
    meet,
    raceNo,
    date,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { raceId } = await params;

    // Parse and validate raceId
    const parsed = parseRaceId(raceId);
    if (!parsed.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: parsed.error,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { meet, raceNo, date } = parsed;

    // Fetch specific race
    const race = await fetchRace(meet!, raceNo!, date);

    if (!race) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Race not found: ${raceId}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: race,
      meta: {
        raceId,
        meet: meet,
        raceNo: raceNo,
        date: date,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/races/[raceId]] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
