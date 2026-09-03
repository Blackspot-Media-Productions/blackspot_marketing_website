import { headers } from "next/headers";

export async function getDomain() {
  const headersList = await headers();
  const host = headersList.get('host'); // e.g., 'example.com'
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const fullDomain = `${protocol}://${host}`;

  return {
    host,
    domain: fullDomain
  };
}
