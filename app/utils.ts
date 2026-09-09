import { headers } from "next/headers";

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

export async function getCountry() {
  const { host, country } = await getDomain();
  const isUkDomain = host?.includes('.co.uk');
  const isSaDomain = host?.includes('.co.za');

  console.log(country);

  return "";
}
