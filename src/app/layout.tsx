import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Import Footer
import { Analytics } from '@vercel/analytics/react'; // Import Analytics

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
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {children}
        </main>
        
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}