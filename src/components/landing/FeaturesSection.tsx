import { Code2, LineChart, BarChart3, Trophy } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Code2 className="h-6 w-6" />,
    title: '전략 설정',
    description: '코드 없이 규칙 기반 전략을 정의하세요. 조건, 필터, 베팅 로직을 직관적으로 설정합니다.',
    color: 'text-boat bg-boat-container',
  },
  {
    icon: <LineChart className="h-6 w-6" />,
    title: '실시간 백테스트',
    description: '30초 단위 과거 배당 데이터로 전략을 검증합니다. 3년치 데이터, 수 초 내 결과.',
    color: 'text-horse bg-horse-container',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: '상세 분석',
    description: '수익률, 승률, 안정성 지수, 최대 손실 등 14가지 지표로 전략을 분석합니다.',
    color: 'text-cycle bg-cycle-container',
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: '경마/경륜/경정',
    description: '서울, 부산, 제주 경마장과 전국 경륜/경정 데이터를 모두 지원합니다.',
    color: 'text-primary bg-primary-container',
  },
];

function FeatureCard({ icon, title, description, color }: Feature) {
  const [textColor, bgColor] = color.split(' ');

  return (
    <div className="group rounded-xl border border-neutral-divider bg-neutral-background p-6 transition-all hover:border-primary/30 hover:shadow-lg">
      <div
        className={`mb-4 inline-flex rounded-lg p-3 ${bgColor} ${textColor} transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-title-medium font-semibold text-neutral-text-primary">{title}</h3>
      <p className="text-body-medium leading-relaxed text-zinc-600">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="bg-surface-dim py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-headline-large font-bold text-neutral-text-primary">
            데이터 기반 의사결정
          </h2>
          <p className="mt-3 text-body-large text-zinc-600">
            퀀트 투자의 핵심 기능을 모두 갖춘 플랫폼
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
