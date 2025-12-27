'use client';

import { useState } from 'react';
import { FileText, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

const benefits = [
  '배당률 급등락 패턴 5가지 분석법',
  'ROI 극대화를 위한 자금 관리 전략',
  '초보자가 피해야 할 실수 TOP 10',
  '실전 백테스트 케이스 스터디 3건',
];

export function LeadMagnetSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('이메일을 입력해주세요.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'lead-magnet' }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch {
      setStatus('error');
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <section className="bg-gradient-to-br from-horse-container via-white to-cycle-container py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-xl md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            {/* Left: Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-horse-container px-4 py-2">
                <FileText className="h-4 w-4 text-horse-bold" />
                <span className="text-label-medium font-medium text-horse-bold">무료 PDF 가이드</span>
              </div>

              <h2 className="text-headline-large font-bold text-neutral-text-primary">
                백테스트 전략 가이드
              </h2>

              <p className="mt-3 text-body-large text-zinc-600">
                데이터 기반 베팅의 핵심 전략을 담은 30페이지 무료 가이드를 받아보세요.
              </p>

              <ul className="mt-6 space-y-3">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-horse" />
                    <span className="text-body-medium text-zinc-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Form */}
            <div className="flex flex-col justify-center">
              {status === 'success' ? (
                <div className="rounded-xl bg-horse-container p-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-horse-bold" />
                  <h3 className="mt-4 text-title-large font-bold text-horse-bold">감사합니다!</h3>
                  <p className="mt-2 text-body-medium text-zinc-600">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="lead-email" className="block text-label-large font-medium text-neutral-text-primary mb-2">
                      이메일 주소
                    </label>
                    <input
                      type="email"
                      id="lead-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full rounded-xl border border-neutral-divider px-4 py-3 text-body-large transition-all focus:border-horse focus:outline-none focus:ring-2 focus:ring-horse/20"
                      disabled={status === 'loading'}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-body-small text-red-600">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-horse-bold py-4 text-label-large font-semibold text-white transition-all hover:bg-green-900 disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        전송 중...
                      </>
                    ) : (
                      <>
                        무료로 받기
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-body-small text-zinc-500">
                    스팸 없이, 유용한 전략 인사이트만 보내드립니다.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
