import 'server-only';

import type { PayloadWithAuth } from '@delmaredigital/payload-better-auth';
import {
  parseSetCookieHeader,
  toCookieOptions
} from 'better-auth/cookies';
import { cookies } from 'next/headers';
import type { BasePayload } from 'payload';

import type { betterAuthOptions } from './options';

type AppPayload = PayloadWithAuth<typeof betterAuthOptions>;

export function getBetterAuth(payload: BasePayload) {
  return (payload as AppPayload).betterAuth;
}

export async function applyBetterAuthCookies(responseHeaders: Headers) {
  const cookieStore = await cookies();

  for (const setCookie of responseHeaders.getSetCookie()) {
    for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
      cookieStore.set(name, attributes.value, toCookieOptions(attributes));
    }
  }
}
