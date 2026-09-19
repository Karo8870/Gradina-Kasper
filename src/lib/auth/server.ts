import 'server-only';

import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import { parseSetCookieHeader, toCookieOptions } from 'better-auth/cookies';
import { cookies, headers } from 'next/headers';
import type { BasePayload } from 'payload';

import { getCMS } from '@/lib/cms';

import type { betterAuthOptions } from './options';

type AppPayload = PayloadWithAuth<typeof betterAuthOptions>;

export function getBetterAuth(payload: BasePayload) {
  return (payload as AppPayload).betterAuth;
}

export async function getBetterAuthRequest() {
  const [payload, requestHeaders] = await Promise.all([getCMS(), headers()]);

  return {
    auth: getBetterAuth(payload),
    requestHeaders
  };
}

export async function applyBetterAuthCookies(responseHeaders: Headers) {
  const cookieStore = await cookies();

  for (const setCookie of responseHeaders.getSetCookie()) {
    for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
      cookieStore.set(name, attributes.value, toCookieOptions(attributes));
    }
  }
}
