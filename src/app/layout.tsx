import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import './globals.css'
import '@/styles/typography.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'
import { HeaderSkeleton } from '@/components/Skeletons'

export const metadata: Metadata = {
  metadataBase: new URL('https://racelab.kr'),
  title: {
    default: 'RaceLab - 경마 경륜 경정 통합 정보',
    template: '%s | RaceLab'
  },
  description: '대한민국 모든 경주(경마, 경륜, 경정)의 실시간 결과, 출주표, 배당률 분석 및 AI 기반 예상 정보를 제공합니다. 공공데이터포털 KRA·KSPO 공식 데이터 활용.',
  keywords: [
    '경마', '경륜', '경정',
    '경마 결과', '경륜 결과', '경정 결과',
    '부산경남경마', '과천경마', '서울경마', '제주경마',
    '배당률', '출마표', '경주결과',
    '한국마사회', '스피드온', 'KRA', 'KSPO',
    'RaceLab', 'racelab.kr'
  ],
  authors: [{ name: 'RaceLab', url: 'https://racelab.kr' }],
  creator: 'RaceLab',
  publisher: 'RaceLab',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://racelab.kr',
    siteName: 'RaceLab',
    title: 'RaceLab - 경마 경륜 경정 통합 정보',
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에. 공공데이터포털 공식 데이터로 출마표, 배당률, 경주결과를 무료로 제공합니다.',
    images: [
      {
        url: '/opengraph-image.svg',
        width: 1200,
        height: 630,
        alt: 'RaceLab - 경마 경륜 경정 통합 정보',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaceLab - 경마 경륜 경정 통합 정보',
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에',
  },
  alternates: {
    canonical: 'https://racelab.kr',
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'naver-site-verification': 'your-naver-verification-code',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  // JSON-LD structured data for Organization and WebSite
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RaceLab',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에 제공하는 통합 플랫폼',
    sameAs: [],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RaceLab - 경마 경륜 경정 통합 정보',
    url: baseUrl,
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에. 출마표, 배당률, 경주결과를 무료로 제공합니다.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#1a56db" />

        {/* JSON-LD Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

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
