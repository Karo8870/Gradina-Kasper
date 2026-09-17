import type { Metadata } from 'next';

import envConfig from '../../env.config';

export function staticMetadata(
  title: string,
  description: string,
  pathname: string,
  { noIndex = false }: { noIndex?: boolean } = {}
): Metadata {
  const url = new URL(pathname, envConfig.NEXT_PUBLIC_SERVER_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url
    },
    robots: noIndex ? { follow: false, index: false } : undefined
  };
}
