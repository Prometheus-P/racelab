// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="사이트 푸터"
      className="bg-gray-50 border-t border-gray-200 mt-12"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">RaceLab</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
              공공데이터포털의 공식 API를 활용하여 신뢰할 수 있는 정보를 제공합니다.
            </p>
          </div>

          {/* Data Sources - E-E-A-T 신뢰성 강화 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">데이터 출처</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-green-600">&#10003;</span>
                <span>
                  <a
                    href="https://www.data.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline"
                  >
                    공공데이터포털
                  </a>
                  {' '}(data.go.kr)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-green-600">&#10003;</span>
                <span>한국마사회 (KRA) 공식 데이터</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-green-600">&#10003;</span>
                <span>국민체육진흥공단 (KSPO) 공식 데이터</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <nav aria-label="푸터 네비게이션">
            <h3 className="font-bold text-gray-900 mb-3">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/?tab=horse"
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-horse transition-colors focus:outline-none focus:ring-2 focus:ring-horse focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🐎</span> 경마 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=cycle"
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-cycle transition-colors focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🚴</span> 경륜 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=boat"
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-boat transition-colors focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🚤</span> 경정 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">📊</span> 경주 결과
                </Link>
              </li>
            </ul>
          </nav>

          {/* Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">안내</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-gray-400">•</span>
                본 서비스는 정보 제공 목적입니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-gray-400">•</span>
                베팅 결과를 보장하지 않습니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-amber-500">⚠️</span>
                <span>
                  도박 문제 상담:{' '}
                  <a
                    href="tel:1336"
                    className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    1336
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {currentYear} KRace. 공공데이터포털 API 활용.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
