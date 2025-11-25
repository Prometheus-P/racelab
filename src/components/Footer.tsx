// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">KRace</h3>
            <p className="text-sm text-gray-600">
              경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?tab=horse" className="text-gray-600 hover:text-horse transition-colors">
                  경마 일정
                </Link>
              </li>
              <li>
                <Link href="/?tab=cycle" className="text-gray-600 hover:text-cycle transition-colors">
                  경륜 일정
                </Link>
              </li>
              <li>
                <Link href="/?tab=boat" className="text-gray-600 hover:text-boat transition-colors">
                  경정 일정
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">안내</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>본 서비스는 정보 제공 목적입니다</li>
              <li>베팅 결과를 보장하지 않습니다</li>
              <li>도박 문제 상담: 1336</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© 2024 KRace. 공공데이터포털 API 활용.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
