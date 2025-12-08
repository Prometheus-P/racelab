// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

    // Get today's date in YYYYMMDD format
    const today = new Date();
    const rcDate = today.toISOString().split('T')[0].replace(/-/g, '');

    // Fetch all races for today (handle API failures gracefully during build)
    let horseRaces: Awaited<ReturnType<typeof fetchHorseRaceSchedules>> = [];
    let cycleRaces: Awaited<ReturnType<typeof fetchCycleRaceSchedules>> = [];
    let boatRaces: Awaited<ReturnType<typeof fetchBoatRaceSchedules>> = [];

    try {
        [horseRaces, cycleRaces, boatRaces] = await Promise.all([
            fetchHorseRaceSchedules(rcDate).catch(() => []),
            fetchCycleRaceSchedules(rcDate).catch(() => []),
            fetchBoatRaceSchedules(rcDate).catch(() => []),
        ]);
    } catch {
        // API failures during build are expected - continue with static routes only
    }

    const allRaces = [...horseRaces, ...cycleRaces, ...boatRaces];

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: `${baseUrl}/results`,
            lastModified: new Date(),
            changeFrequency: 'always', // 실시간 업데이트됨을 명시
            priority: 0.9,
        },
    ];

    // Dynamic race routes
    const raceRoutes: MetadataRoute.Sitemap = allRaces.map((race) => ({
        url: `${baseUrl}/race/${race.id}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...raceRoutes];
}
