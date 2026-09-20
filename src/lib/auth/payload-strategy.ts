import { betterAuthStrategy } from '@delmaredigital/payload-better-auth';
import type { AuthStrategy } from 'payload';

export function twoFactorAwareBetterAuthStrategy(): AuthStrategy {
  const strategy = betterAuthStrategy();

  return {
    ...strategy,
    authenticate: async (args) => {
      const result = await strategy.authenticate(args);
      const user = result.user as
        ({ twoFactorPending?: boolean } & Record<string, unknown>) | null;

      if (user?.twoFactorPending) {
        return { ...result, user: null };
      }

      return result;
    }
  };
}
