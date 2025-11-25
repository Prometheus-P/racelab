// src/components/Header.tsx
import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            🏁 KRace
          </Link>
          <nav className="flex space-x-6">
            <Link
              href="/?tab=horse"
              className="text-gray-700 hover:text-horse font-medium transition-colors"
            >
              🐎 경마
            </Link>
            <Link
              href="/?tab=cycle"
              className="text-gray-700 hover:text-cycle font-medium transition-colors"
            >
              🚴 경륜
            </Link>
            <Link
              href="/?tab=boat"
              className="text-gray-700 hover:text-boat font-medium transition-colors"
            >
              🚤 경정
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;