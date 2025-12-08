// src/components/seo/FAQJsonLd.tsx
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  items: FAQItem[];
}

const FAQJsonLd = ({ items }: FAQJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default FAQJsonLd;
