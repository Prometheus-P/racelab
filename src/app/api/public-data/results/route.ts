import { NextResponse } from 'next/server';

import { fetchRaceResultsWithCache } from '@/lib/services/publicDataCache';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? undefined;

  try {
    const result = await fetchRaceResultsWithCache(date ?? undefined);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[PublicDataCache] 핸들러 오류', error);
    return NextResponse.json(
      { success: false, message: 'Data Updating... 최신 데이터를 불러오는 중입니다.' },
      { status: 503 },
    );
  }
}
