import envConfig from '../../../../../env.config';

import {
  safeInternalRedirect,
  withFeedback,
  withSafeRedirect
} from '@/features/auth/utils';
import { copyBetterAuthCookies, getBetterAuth } from '@/lib/auth/server';
import { getCMS } from '@/lib/cms';
import { twoFactorMode } from '@/lib/auth/two-factor/config';

function redirectResponse(pathname: string, responseHeaders?: Headers) {
  const headers = new Headers();

  if (responseHeaders) copyBetterAuthCookies(responseHeaders, headers);

  headers.set(
    'location',
    new URL(pathname, envConfig.NEXT_PUBLIC_SERVER_URL).toString()
  );

  return new Response(null, { headers, status: 303 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination =
    safeInternalRedirect(url.searchParams.get('redirect')) ?? '/account';

  if (twoFactorMode === 'none') {
    return redirectResponse(destination);
  }

  const payload = await getCMS();
  const auth = getBetterAuth(payload);

  try {
    const { headers, response } = await auth.api.completeSocialTwoFactor({
      headers: request.headers,
      returnHeaders: true
    });

    return redirectResponse(
      response.twoFactorRedirect
        ? withSafeRedirect('/two-factor', destination)
        : destination,
      headers
    );
  } catch {
    try {
      const { headers } = await auth.api.signOut({
        headers: request.headers,
        returnHeaders: true
      });

      return redirectResponse(
        withFeedback(
          '/login',
          'error',
          'Autentificarea nu a putut fi finalizată. Încearcă din nou.',
          { redirect: destination }
        ),
        headers
      );
    } catch {
      return redirectResponse(
        withFeedback(
          '/login',
          'error',
          'Autentificarea nu a putut fi finalizată. Încearcă din nou.',
          { redirect: destination }
        )
      );
    }
  }
}
