let warned = false;

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    const message = 'NEXT_PUBLIC_SITE_URL is not set; defaulting to https://racelab.kr';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
    if (!warned) {
      console.warn(message);
      warned = true;
    }
    return 'https://racelab.kr';
  }

  return normalize(siteUrl);
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith('/')) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}
