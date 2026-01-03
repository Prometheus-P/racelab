/**
 * Cache Monitoring Page
 *
 * 관리자용 캐시 성능 모니터링 대시보드
 */

import CacheMonitorDashboard from '@/components/monitoring/CacheMonitorDashboard';

export const metadata = {
  title: 'Cache Monitor - RaceLab Admin',
  description: 'Cache performance monitoring dashboard',
};

export default function CacheMonitorPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <CacheMonitorDashboard />
      </div>
    </main>
  );
}
