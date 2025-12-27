import { Users, BarChart3, TrendingUp, Star } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  {
    value: '1,200+',
    label: '베타 테스터',
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: '45,000+',
    label: '백테스트 실행',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    value: '+18.7%',
    label: '평균 전략 ROI',
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: '10년간 감으로 하던 베팅을 데이터로 검증하니 확실히 다르더라고요. 첫 달 ROI +15% 달성했습니다.',
    author: '김**',
    role: '경마 10년차',
    avatar: 'K',
    rating: 5,
  },
  {
    quote: '30초 단위 배당률 데이터가 진짜 게임체인저입니다. 급등락 패턴 분석이 가능해졌어요.',
    author: '이**',
    role: '퀀트 트레이더',
    avatar: 'L',
    rating: 5,
  },
  {
    quote: 'DSL로 전략 짜는 게 생각보다 쉬워요. 코딩 몰라도 조건식만 설정하면 끝.',
    author: '박**',
    role: '직장인 투자자',
    avatar: 'P',
    rating: 5,
  },
];

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm border border-neutral-divider">
      <div className="flex items-center gap-2 text-horse-bold">
        {stat.icon}
      </div>
      <span className="text-display-small font-bold text-neutral-text-primary">{stat.value}</span>
      <span className="text-body-medium text-zinc-600">{stat.label}</span>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-neutral-divider">
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-horse text-horse" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-body-large text-zinc-700 leading-relaxed flex-grow">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-horse-container text-horse-bold font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-neutral-text-primary">{testimonial.author}</p>
          <p className="text-body-small text-zinc-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section className="bg-surface-dim py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="mb-16">
          <p className="text-center text-label-large font-medium text-zinc-500 mb-8">
            베타 서비스 현황
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-center text-headline-large font-bold text-neutral-text-primary mb-4">
            베타 테스터들의 후기
          </h2>
          <p className="text-center text-body-large text-zinc-600 mb-12">
            실제 사용자들이 경험한 RaceLab
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-label-medium text-zinc-500 mb-6">공식 데이터 제공</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-zinc-600">
              <span className="text-horse font-bold">KRA</span>
              <span className="text-body-medium">한국마사회</span>
            </div>
            <div className="h-6 w-px bg-neutral-divider" />
            <div className="flex items-center gap-2 text-zinc-600">
              <span className="text-cycle font-bold">KSPO</span>
              <span className="text-body-medium">국민체육진흥공단</span>
            </div>
            <div className="h-6 w-px bg-neutral-divider" />
            <div className="flex items-center gap-2 text-zinc-600">
              <span className="text-boat font-bold">data.go.kr</span>
              <span className="text-body-medium">공공데이터포털</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
