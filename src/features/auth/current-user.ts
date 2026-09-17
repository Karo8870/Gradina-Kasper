import 'server-only';

import { headers } from 'next/headers';

import { getCMS } from '@/lib/cms';

export async function getCurrentUser() {
  const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
  const { user } = await payload.auth({ headers: requestHeaders });

  return user;
}
