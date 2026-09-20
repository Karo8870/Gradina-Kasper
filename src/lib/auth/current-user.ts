import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';

import { getCMS } from '@/lib/cms';

export const getCurrentUser = cache(async () => {
  const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);
  const { user } = await payload.auth({ headers: requestHeaders });

  return user;
});
