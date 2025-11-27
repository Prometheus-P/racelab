import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'
import { HeaderSkeleton } from '@/components/Skeletons'

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
        url: '/opengraph-image.svg',
        width: 1200,
        height: 630,
        alt: 'KRace - 경마 경륜 경정 통합 정보',
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#1a56db" />
        {/* Google Analytics Scripts */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        
        <main
          id="main-content"
          className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full"
        >
          {children}
        </main>
        
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
