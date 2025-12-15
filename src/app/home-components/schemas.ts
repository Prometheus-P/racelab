// src/app/home-components/schemas.ts
// JSON-LD schemas for Home page SEO

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'RaceLab은 어떤 서비스인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RaceLab은 한국 경마, 경륜, 경정 정보를 한 곳에서 확인할 수 있는 통합 정보 플랫폼입니다. 실시간 배당률, 출마표, 경주 결과를 무료로 제공합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경마, 경륜, 경정의 차이는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경마는 말을 이용한 경주로 한국마사회(KRA)가 주관하며, 경륜은 사이클을 이용한 트랙 경주, 경정은 모터보트를 이용한 수상 경주로 국민체육진흥공단(KSPO)이 주관합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '배당률은 어떻게 확인하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '메인 페이지에서 원하는 경주를 선택하면 상세 페이지에서 실시간 배당률을 확인할 수 있습니다. 단승 배당률이 표시되며, 경주 시작 직전까지 업데이트됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경주 결과는 언제 확인할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경주가 종료되면 즉시 결과가 업데이트됩니다. 경주 상세 페이지에서 순위, 배당금 등의 정보를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'RaceLab은 무료로 이용할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, RaceLab의 모든 정보는 무료로 제공됩니다. 회원가입 없이도 모든 경주 정보, 배당률, 결과를 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경마는 어디서 열리나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경마는 서울경마공원(과천), 부산경남경마공원, 제주경마공원에서 개최됩니다. 서울과 제주는 주로 토·일요일, 부산경남은 금·토·일요일에 경주가 열립니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경륜은 어디서 열리나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경륜은 경기도 광명시의 광명스피돔에서 금·토·일요일에 개최됩니다. 실내 벨로드롬에서 진행되어 날씨 영향을 적게 받습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '경정은 어디서 열리나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '경정은 경기도 하남시의 미사리경정공원에서 금·토·일요일에 개최됩니다. 600m 코스를 3바퀴 돌아 순위를 결정합니다.',
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
      name: 'RaceLab 데이터의 출처는 어디인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RaceLab의 모든 데이터는 공공데이터포털(data.go.kr)을 통해 제공되는 한국마사회(KRA)와 국민체육진흥공단(KSPO)의 공식 데이터를 사용합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '배당률은 언제 확정되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '배당률은 경주 시작 직전까지 변동되며, 경주가 종료되면 최종 배당률이 확정됩니다. 많은 사람이 베팅할수록 배당률이 낮아집니다.',
      },
    },
    {
      '@type': 'Question',
      name: '출마표에서 어떤 정보를 확인할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '출마표에서는 출전 마필/선수의 번호, 이름, 기수(경마), 최근 성적, 마체중, 부담중량 등의 정보를 확인할 수 있습니다. 이 정보들은 경주 분석에 중요한 참고 자료입니다.',
      },
    },
  ],
};

export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '경주 관람 방법',
  description: '경마, 경륜, 경정 경주를 처음 관람하는 분들을 위한 단계별 가이드입니다.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '출마표 확인',
      text: '출전 마필/선수의 정보와 최근 성적을 확인합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '배당률 확인',
      text: '실시간 배당률을 확인하여 예상을 세웁니다.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '경주 관람',
      text: '현장 또는 온라인으로 경주를 관람합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '결과 확인',
      text: '경주 종료 후 결과와 배당금을 확인합니다.',
    },
  ],
};
