// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://krace.co.kr';

    // Get today's date in YYYYMMDD format
    const today = new Date();
    const rcDate = today.toISOString().split('T')[0].replace(/-/g, '');

    // Fetch all races for today
    const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
        fetchHorseRaceSchedules(rcDate),
        fetchCycleRaceSchedules(rcDate),
        fetchBoatRaceSchedules(rcDate),
    ]);

    const allRaces = [...horseRaces, ...cycleRaces, ...boatRaces];

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
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
