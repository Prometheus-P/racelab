// src/components/seo/ImageJsonLd.tsx
import Script from 'next/script';
import { getSiteUrl } from '@/lib/seo/siteUrl';

interface ImageData {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
  encodingFormat?: string;
}

interface ImageJsonLdProps {
  images: ImageData | ImageData[];
  id?: string;
}

/**
 * ImageJsonLd - Structured data for images
 * Helps AI models like Gemini better understand and cite visual content
 */
export function ImageJsonLd({ images, id = 'image-schema' }: ImageJsonLdProps) {
  const baseUrl = getSiteUrl();
  const imageArray = Array.isArray(images) ? images : [images];

  const schema = imageArray.map((img, index) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${baseUrl}/#image-${index}`,
    url: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
    contentUrl: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
    name: img.name || `이미지 ${index + 1}`,
    caption: img.caption || '',
    width: img.width,
    height: img.height,
    encodingFormat: img.encodingFormat || 'image/jpeg',
  }));

  // Return single object if only one image, otherwise array
  const schemaData = schema.length === 1 ? schema[0] : schema;

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

interface RaceImageJsonLdProps {
  raceType: 'horse' | 'cycle' | 'boat';
  track: string;
  raceNo: number;
}

/**
 * RaceImageJsonLd - Structured data for race-specific imagery
 * Uses representative images for each race type
 */
export function RaceImageJsonLd({ raceType, track, raceNo }: RaceImageJsonLdProps) {
  const baseUrl = getSiteUrl();

  const raceTypeNames = {
    horse: '경마',
    cycle: '경륜',
    boat: '경정',
  };

  const raceTypeImages = {
    horse: {
      url: `${baseUrl}/racelab-symbol.svg`,
      caption: `${track} 제${raceNo}경주 경마 정보`,
    },
    cycle: {
      url: `${baseUrl}/racelab-symbol.svg`,
      caption: `${track} 제${raceNo}경주 경륜 정보`,
    },
    boat: {
      url: `${baseUrl}/racelab-symbol.svg`,
      caption: `${track} 제${raceNo}경주 경정 정보`,
    },
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${baseUrl}/#race-image`,
    url: raceTypeImages[raceType].url,
    contentUrl: raceTypeImages[raceType].url,
    name: `${track} 제${raceNo}경주 - ${raceTypeNames[raceType]}`,
    caption: raceTypeImages[raceType].caption,
    width: 200,
    height: 200,
    encodingFormat: 'image/svg+xml',
    representativeOfPage: true,
  };

  return (
    <Script
      id="race-image-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default ImageJsonLd;
