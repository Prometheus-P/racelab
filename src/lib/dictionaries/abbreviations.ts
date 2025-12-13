export const abbreviations: Record<string, string> = {
  HCP: '핸디캡 경주',
  G: '등급',
  JKY: '기수',
  TRN: '조교사',
  POP: '인기도',
  ODDS: '배당률',
  FORM: '최근 전적 요약',
};

export type AbbreviationKey = keyof typeof abbreviations;
