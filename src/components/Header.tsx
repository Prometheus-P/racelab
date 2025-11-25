// src/components/Header.tsx
import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header>
      <h1>KRace</h1>
      <nav>
        <Link href="/horse">경마</Link>
        <Link href="/cycle">경륜</Link>
        <Link href="/boat">경정</Link>
      </nav>
    </header>
  );
};

export default Header;