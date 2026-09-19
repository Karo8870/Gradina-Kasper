import 'server-only';

import type { BetterAuthOptions } from 'better-auth';

import envConfig from '../../../env.config';

export const socialProviderConfig = {
  google: {
    clientId: envConfig.GOOGLE_CLIENT_ID,
    clientSecret: envConfig.GOOGLE_CLIENT_SECRET
  }
} satisfies NonNullable<BetterAuthOptions['socialProviders']>;
