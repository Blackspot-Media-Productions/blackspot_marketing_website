import { headers } from "next/headers";

const countryLinks = {
  default: 'https://theblackspotgroup.com',
  ZA: 'https://blackspotmedia.co.za',
  GB: 'https://blackspotmedia.co.uk'
}

export async function getDomain() {
  const headersList = await headers();
  const host = headersList.get('host'); // e.g., 'example.com'
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const fullDomain = `${protocol}://${host}`;
  const country = headersList.get('x-vercel-ip-country') || '';

  return {
    host,
    domain: fullDomain,
    country
  };
}

export async function getMediaProdLink() {
  const { host, country } = await getDomain();
  const isUkDomain = host?.includes('.co.uk');
  const isSaDomain = host?.includes('.co.za');

  if (!country) return '';

  if (isUkDomain) {
    if (country === 'GB') return '';
    if (country === 'ZA') return countryLinks.ZA;
    return countryLinks.default;
  } else if (isSaDomain) {
    if (country === 'ZA') return '';
    if (country === 'GB') return countryLinks.GB;
    return countryLinks.default;
  } else {
    if (country === 'ZA') return countryLinks.ZA;
    if (country === 'GB') return countryLinks.GB;
    return '';
  }
}
