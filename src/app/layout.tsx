import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Noto_Sans_KR, Exo_2, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '@/styles/typography.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { HeaderSkeleton } from '@/components/Skeletons';
import { getSiteUrl } from '@/lib/seo/siteUrl';
import { SessionProvider } from '@/components/auth';
import { ThemeProvider } from '@/components/ThemeProvider';

// Noto Sans KR - Primary font for Korean text (optimized for 50-60 demographic)
// next/font/google automatically:
// - Self-hosts the font (no external requests)
// - Applies display: swap (prevents FOIT)
// - Creates optimal subsets for Korean
// - Preloads the font for LCP optimization
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
});

// Exo 2 - Brand font for logos and headings
const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--font-exo-2',
  preload: false, // Lower priority than main font
});

// JetBrains Mono - Monospace font for financial data/numbers
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false, // Only used for data display
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RaceLab - 경마 경륜 경정 통합 정보',
    template: '%s | RaceLab',
  },
  description:
    '대한민국 모든 경주(경마, 경륜, 경정)의 실시간 결과, 출주표, 배당률 분석 및 AI 기반 예상 정보를 제공합니다. 공공데이터포털 KRA·KSPO 공식 데이터 활용.',
  keywords: [
    '경마',
    '경륜',
    '경정',
    '경마 결과',
    '경륜 결과',
    '경정 결과',
    '부산경남경마',
    '과천경마',
    '서울경마',
    '제주경마',
    '배당률',
    '출마표',
    '경주결과',
    '한국마사회',
    '스피드온',
    'KRA',
    'KSPO',
    'RaceLab',
    'racelab.kr',
  ],
  authors: [{ name: 'RaceLab', url: siteUrl }],
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
    url: siteUrl,
    siteName: 'RaceLab',
    title: 'RaceLab - 경마 경륜 경정 통합 정보',
    description:
      '한국 경마, 경륜, 경정 실시간 정보를 한눈에. 공공데이터포털 공식 데이터로 출마표, 배당률, 경주결과를 무료로 제공합니다.',
    images: [
      {
        url: `${siteUrl}/opengraph-image.svg`,
        width: 1200,
        height: 630,
        alt: 'RaceLab - 경마 경륜 경정 통합 정보',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaceLab - 경마 경륜 경정 통합 정보',
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에',
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'i5Q0RtQZldOZKbs-upPl2eiP9boxog1a5QDxZd70pv4',
    // Naver verification: configure in production when ready
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = siteUrl;

  // JSON-LD structured data for Organization with ImageObject
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'RaceLab',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${baseUrl}/#logo`,
      url: `${baseUrl}/racelab-logo.svg`,
      contentUrl: `${baseUrl}/racelab-logo.svg`,
      caption: 'RaceLab 로고 - 경마 경륜 경정 통합 정보 플랫폼',
      width: 400,
      height: 400,
      encodingFormat: 'image/svg+xml',
    },
    image: {
      '@type': 'ImageObject',
      '@id': `${baseUrl}/#primaryImage`,
      url: `${baseUrl}/opengraph-image.svg`,
      contentUrl: `${baseUrl}/opengraph-image.svg`,
      caption: 'RaceLab - 한국 경마, 경륜, 경정 통합 정보 플랫폼',
      width: 1200,
      height: 630,
      encodingFormat: 'image/svg+xml',
    },
    description: '한국 경마, 경륜, 경정 실시간 정보를 한눈에 제공하는 통합 플랫폼',
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: '대한민국',
    },
    knowsAbout: ['경마', '경륜', '경정', '배당률', '경주결과', 'KRA', 'KSPO'],
    sameAs: [],
  };

  // JSON-LD for WebSite with image
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'RaceLab - 경마 경륜 경정 통합 정보',
    url: baseUrl,
    description:
      '한국 경마, 경륜, 경정 실시간 정보를 한눈에. 출마표, 배당률, 경주결과를 무료로 제공합니다.',
    publisher: { '@id': `${baseUrl}/#organization` },
    image: { '@id': `${baseUrl}/#primaryImage` },
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // JSON-LD for ImageGallery - main visual assets for AI crawlers
  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${baseUrl}/#imageGallery`,
    name: 'RaceLab 이미지 갤러리',
    description: '경마, 경륜, 경정 정보 플랫폼 RaceLab의 시각 자료',
    url: baseUrl,
    image: [
      {
        '@type': 'ImageObject',
        name: 'RaceLab 오픈그래프 이미지',
        url: `${baseUrl}/opengraph-image.svg`,
        contentUrl: `${baseUrl}/opengraph-image.svg`,
        caption: 'RaceLab - 경마 경륜 경정 통합 정보 플랫폼 대표 이미지',
        width: 1200,
        height: 630,
        encodingFormat: 'image/svg+xml',
      },
      {
        '@type': 'ImageObject',
        name: 'RaceLab 로고',
        url: `${baseUrl}/racelab-logo.svg`,
        contentUrl: `${baseUrl}/racelab-logo.svg`,
        caption: 'RaceLab 브랜드 로고',
        width: 400,
        height: 400,
        encodingFormat: 'image/svg+xml',
      },
      {
        '@type': 'ImageObject',
        name: 'RaceLab 심볼',
        url: `${baseUrl}/racelab-symbol.svg`,
        contentUrl: `${baseUrl}/racelab-symbol.svg`,
        caption: 'RaceLab 심볼 마크',
        width: 200,
        height: 200,
        encodingFormat: 'image/svg+xml',
      },
    ],
    publisher: { '@id': `${baseUrl}/#organization` },
  };

  return (
    <html lang="ko" className={`${notoSansKR.variable} ${exo2.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* RaceLab Design System V1.0 - Soft Coral (#E57373) as primary */}
        <meta name="theme-color" content="#E57373" />

        {/* Theme initialization script - runs before React hydration to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('racelab-theme');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    var theme = parsed.state && parsed.state.theme;
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (theme === 'light') {
                      document.documentElement.classList.add('light');
                    } else if (theme === 'system' || !theme) {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  } else {
                    // Default to system preference
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {
                // Corrupted localStorage - remove and use system default
                try { localStorage.removeItem('racelab-theme'); } catch (_) {}
              }
              })();
            `,
          }}
        />

        {/* JSON-LD Structured Data - Enhanced with ImageObject for AI crawlers */}
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
        <Script
          id="image-gallery-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
        />

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}

        {/* Google Analytics Scripts */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
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
      {/* RaceLab Design System V1.0 - CSS 변수 기반 테마 */}
      <body className={`flex min-h-screen flex-col bg-[var(--rl-background)] text-[var(--rl-text-primary)] font-sans ${notoSansKR.className}`}>
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={<HeaderSkeleton />}>
              <Header />
            </Suspense>

            <main
              id="main-content"
              className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8"
            >
              {children}
            </main>

            <Footer />
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
