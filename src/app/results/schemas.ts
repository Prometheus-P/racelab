// src/app/results/schemas.ts
// JSON-LD schemas for Results page SEO
import { getSiteUrl } from '@/lib/seo/siteUrl';

const baseUrl = getSiteUrl();

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '홈',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '경주 결과',
      item: `${baseUrl}/results`,
    },
  ],
};

export const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${baseUrl}/results#page`,
  name: '경주 결과 - 경마 경륜 경정 과거 기록 조회',
  description: '경마, 경륜, 경정 과거 경주 결과를 검색하고 분석하세요.',
  url: `${baseUrl}/results`,
  inLanguage: 'ko-KR',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'RaceLab',
    url: baseUrl,
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${baseUrl}/opengraph-image.svg`,
    contentUrl: `${baseUrl}/opengraph-image.svg`,
    caption: '경주 결과 - RaceLab 경마 경륜 경정 과거 기록 조회',
    width: 1200,
    height: 630,
    encodingFormat: 'image/svg+xml',
  },
  about: [
    { '@type': 'Thing', name: '경마' },
    { '@type': 'Thing', name: '경륜' },
    { '@type': 'Thing', name: '경정' },
  ],
  provider: {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'RaceLab',
    url: baseUrl,
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '경마 결과는 어디서 확인할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RaceLab에서 경마, 경륜, 경정의 모든 경주 결과를 무료로 확인할 수 있습니다. 날짜별, 경기장별로 필터링하여 원하는 경주 결과를 쉽게 찾을 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '과거 경주 배당금은 어떻게 조회하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경주 결과 페이지에서 날짜 필터를 사용하여 과거 경주를 검색하면 각 경주의 배당금 정보를 확인할 수 있습니다. 단승, 복승, 쌍승 등 다양한 베팅 유형별 배당금이 제공됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경마와 경륜의 차이점은 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경마는 말과 기수가 함께 달리는 경주로 한국마사회(KRA)에서 주관하며, 경륜은 사이클 선수가 트랙에서 경쟁하는 경주로 국민체육진흥공단(KSPO)에서 주관합니다. 경마는 서울, 부산, 제주에서, 경륜은 광명에서 개최됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경정이란 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경정은 모터보트를 이용한 수상 경주 스포츠입니다. 국민체육진흥공단(KSPO)에서 주관하며 미사리경정공원에서 개최됩니다. 선수들은 600m 코스를 3바퀴 돌아 순위를 결정합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '단승식과 복승식의 차이는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '단승식은 1위를 정확히 맞추는 방식이고, 복승식은 1~2위를 순서 상관없이 맞추는 방식입니다. 단승식이 더 쉽지만 배당률이 낮고, 복승식은 난이도가 높아 배당률이 더 높습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '배당률은 언제 확정되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '배당률은 경주 시작 직전까지 변동되며, 경주가 종료되면 최종 배당률이 확정됩니다. RaceLab에서는 실시간 배당률과 확정 배당률 모두 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경주 결과는 얼마나 빨리 업데이트되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RaceLab의 경주 결과는 경주 종료 후 즉시 업데이트됩니다. 공공데이터포털 API를 통해 실시간으로 데이터를 가져오며, 60초 간격으로 캐시를 갱신합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '특정 기수의 성적만 조회할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 가능합니다. 경주 결과 페이지에서 기수 이름으로 필터링하여 특정 기수의 모든 경주 기록을 조회할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'RaceLab 데이터의 출처는 어디인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RaceLab의 모든 데이터는 공공데이터포털(data.go.kr)을 통해 제공되는 한국마사회(KRA)와 국민체육진흥공단(KSPO)의 공식 데이터를 사용합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '모바일에서도 경주 결과를 확인할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, RaceLab은 반응형 웹사이트로 제작되어 스마트폰, 태블릿 등 모든 기기에서 최적화된 화면으로 경주 결과를 확인할 수 있습니다.',
      },
    },
  ],
};
