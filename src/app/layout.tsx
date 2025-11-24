import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'KRace - 경마 경륜 경정 통합 정보',
    template: '%s | KRace'
  },
  description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에. 출마표, 배당률, 경주결과를 무료로 제공합니다.',
  keywords: ['경마', '경륜', '경정', '배당률', '출마표', '경주결과', '한국마사회', '스피드온'],
  authors: [{ name: 'KRace' }],
  creator: 'KRace',
  publisher: 'KRace',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://krace.co.kr',
    siteName: 'KRace',
    title: 'KRace - 경마 경륜 경정 통합 정보',
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KRace',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRace - 경마 경륜 경정 통합 정보',
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1a56db" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* 로고 */}
              <a href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🏇</span>
                <span className="font-bold text-xl text-gray-900">KRace</span>
              </a>
              
              {/* 네비게이션 */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/horse" className="text-gray-600 hover:text-horse font-medium">
                  🐎 경마
                </a>
                <a href="/cycle" className="text-gray-600 hover:text-cycle font-medium">
                  🚴 경륜
                </a>
                <a href="/boat" className="text-gray-600 hover:text-boat font-medium">
                  🚤 경정
                </a>
              </nav>

              {/* 모바일 메뉴 */}
              <div className="md:hidden flex items-center space-x-4">
                <a href="/horse" className="text-xl">🐎</a>
                <a href="/cycle" className="text-xl">🚴</a>
                <a href="/boat" className="text-xl">🚤</a>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* 푸터 */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                본 서비스는 정보 제공 목적이며, 베팅 결과를 보장하지 않습니다.
              </p>
              <p className="mb-2">
                도박 문제 상담: <a href="tel:1336" className="text-primary">1336</a> (한국도박문제관리센터)
              </p>
              <p>
                © 2024 KRace. 공공데이터포털 API 활용.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
