// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="사이트 푸터"
      className="mt-12 border-t border-neutral-divider bg-surface-dim"
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-title-small font-bold text-on-surface">RaceLab</h3>
            <p className="text-body-small leading-relaxed text-zinc-600">
              경마, 경륜, 경정 정보를 한 곳에서 확인하세요. 공공데이터포털의 공식 API를 활용하여
              신뢰할 수 있는 정보를 제공합니다.
            </p>
          </div>

          {/* Data Sources - E-E-A-T 신뢰성 강화 */}
          <div>
            <h3 className="mb-4 text-title-small font-bold text-on-surface">데이터 출처</h3>
            <ul className="space-y-3 text-body-small text-zinc-600">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-horse">
                  ✓
                </span>
                <span>
                  <a
                    href="https://www.data.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded underline transition-colors duration-rl-fast hover:text-boat focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2"
                  >
                    공공데이터포털
                  </a>{' '}
                  (data.go.kr)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-horse">
                  ✓
                </span>
                <span>한국마사회 (KRA) 공식 데이터</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-horse">
                  ✓
                </span>
                <span>국민체육진흥공단 (KSPO) 공식 데이터</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <nav aria-label="푸터 네비게이션">
            <h3 className="mb-4 text-title-small font-bold text-on-surface">빠른 링크</h3>
            <ul className="space-y-3 text-body-small">
              <li>
                <Link
                  href="/?tab=horse"
                  className="-ml-1 inline-flex items-center gap-2 rounded px-1 text-zinc-600 transition-colors duration-rl-fast hover:text-horse focus:outline-none focus:ring-2 focus:ring-horse focus:ring-offset-2"
                >
                  <span aria-hidden="true">🐎</span> 경마 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=cycle"
                  className="-ml-1 inline-flex items-center gap-2 rounded px-1 text-zinc-600 transition-colors duration-rl-fast hover:text-cycle focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2"
                >
                  <span aria-hidden="true">🚴</span> 경륜 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=boat"
                  className="-ml-1 inline-flex items-center gap-2 rounded px-1 text-zinc-600 transition-colors duration-rl-fast hover:text-boat focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2"
                >
                  <span aria-hidden="true">🚤</span> 경정 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="-ml-1 inline-flex items-center gap-2 rounded px-1 text-zinc-600 transition-colors duration-rl-fast hover:text-boat focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2"
                >
                  <span aria-hidden="true">📊</span> 경주 결과
                </Link>
              </li>
            </ul>
          </nav>

          {/* Info */}
          <div>
            <h3 className="mb-4 text-title-small font-bold text-on-surface">안내</h3>
            <ul className="space-y-3 text-body-small text-zinc-600">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-outline">
                  •
                </span>
                본 서비스는 정보 제공 목적입니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-outline">
                  •
                </span>
                베팅 결과를 보장하지 않습니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-status-warning">
                  ⚠
                </span>
                <span>
                  도박 문제 상담:{' '}
                  <a
                    href="tel:1336"
                    className="rounded font-bold text-cycle-bold hover:underline focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2"
                  >
                    1336
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-divider pt-8 text-center text-body-small text-zinc-600">
          <p>© {currentYear} RaceLab. 공공데이터포털 API 활용.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
