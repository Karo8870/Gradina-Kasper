import {
  APIError,
  createAuthEndpoint,
  createAuthMiddleware,
  getSessionFromCtx,
  sessionMiddleware
} from 'better-auth/api';
import {
  deleteSessionCookie,
  expireCookie,
  setSessionCookie
} from 'better-auth/cookies';
import { generateRandomString } from 'better-auth/crypto';
import type { BetterAuthPlugin, GenericEndpointContext } from 'better-auth';

import {
  TRUSTED_DEVICE_MAX_AGE,
  TWO_FACTOR_CHALLENGE_MAX_AGE,
  type TwoFactorMode
} from './config';

const TWO_FACTOR_COOKIE_NAME = 'two_factor';
const TRUST_DEVICE_COOKIE_NAME = 'two_factor_trust';
const SOCIAL_COMPLETION_PATH = '/two-factor/complete-social';

function encodeBase64URL(value: ArrayBuffer) {
  return Buffer.from(value).toString('base64url');
}

async function signTrustedDevice(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  );

  return encodeBase64URL(signature);
}

async function verifyTrustedDeviceSignature(
  secret: string,
  value: string,
  signature: string
) {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(signature, 'base64url'),
      new TextEncoder().encode(value)
    );
  } catch {
    return false;
  }
}

async function consumeTrustedDevice(
  ctx: GenericEndpointContext,
  userId: string
) {
  const cookie = ctx.context.createAuthCookie(TRUST_DEVICE_COOKIE_NAME, {
    maxAge: TRUSTED_DEVICE_MAX_AGE
  });
  const value = await ctx.getSignedCookie(cookie.name, ctx.context.secret);

  if (!value) return false;

  const [token, identifier] = value.split('!');
  const hasValidToken =
    token && identifier
      ? await verifyTrustedDeviceSignature(
          ctx.context.secret,
          `${userId}!${identifier}`,
          token
        )
      : false;
  const verification = identifier
    ? await ctx.context.internalAdapter.findVerificationValue(identifier)
    : null;

  if (
    hasValidToken &&
    verification?.value === userId &&
    verification.expiresAt > new Date()
  ) {
    await ctx.context.internalAdapter.deleteVerificationByIdentifier(
      identifier!
    );

    const nextIdentifier = `trust-device-${generateRandomString(32)}`;
    const nextToken = await signTrustedDevice(
      ctx.context.secret,
      `${userId}!${nextIdentifier}`
    );

    await ctx.context.internalAdapter.createVerificationValue({
      expiresAt: new Date(Date.now() + TRUSTED_DEVICE_MAX_AGE * 1000),
      identifier: nextIdentifier,
      value: userId
    });
    await ctx.setSignedCookie(
      cookie.name,
      `${nextToken}!${nextIdentifier}`,
      ctx.context.secret,
      cookie.attributes
    );

    return true;
  }

  expireCookie(ctx, cookie);
  return false;
}

function isProviderCallback(path: string | undefined) {
  return Boolean(
    path?.startsWith('/callback/') || path?.startsWith('/oauth2/callback/')
  );
}

function isPendingSessionAllowed(path: string | undefined) {
  return (
    path === '/get-session' ||
    path === '/sign-out' ||
    path === SOCIAL_COMPLETION_PATH
  );
}

function isMethodAllowed(path: string | undefined, mode: TwoFactorMode) {
  if (!path?.startsWith('/two-factor/')) return true;
  if (path === SOCIAL_COMPLETION_PATH) return true;

  if (mode === 'otp') {
    return ![
      '/two-factor/generate-backup-codes',
      '/two-factor/get-totp-uri',
      '/two-factor/verify-backup-code',
      '/two-factor/verify-totp'
    ].includes(path);
  }

  if (mode === 'totp') {
    return !['/two-factor/send-otp', '/two-factor/verify-otp'].includes(path);
  }

  return false;
}

export function providerAgnosticTwoFactor(
  mode: Exclude<TwoFactorMode, 'none'>
) {
  return {
    id: 'provider-agnostic-two-factor',
    endpoints: {
      completeSocialTwoFactor: createAuthEndpoint(
        SOCIAL_COMPLETION_PATH,
        {
          method: 'POST',
          use: [sessionMiddleware]
        },
        async (ctx) => {
          const { session, user } = ctx.context.session;

          if (!session.twoFactorPending) {
            return ctx.json({ twoFactorRedirect: false });
          }

          if (!user.twoFactorEnabled) {
            const updatedSession =
              await ctx.context.internalAdapter.updateSession(session.token, {
                twoFactorPending: false
              });

            if (!updatedSession) {
              throw APIError.fromStatus('UNAUTHORIZED');
            }

            await setSessionCookie(ctx, {
              session: updatedSession,
              user
            });
            ctx.context.setNewSession({ session: updatedSession, user });

            return ctx.json({ twoFactorRedirect: false });
          }

          if (await consumeTrustedDevice(ctx, user.id)) {
            const updatedSession =
              await ctx.context.internalAdapter.updateSession(session.token, {
                twoFactorPending: false
              });

            if (!updatedSession) {
              throw APIError.fromStatus('UNAUTHORIZED');
            }

            await setSessionCookie(ctx, {
              session: updatedSession,
              user
            });
            ctx.context.setNewSession({ session: updatedSession, user });

            return ctx.json({ twoFactorRedirect: false });
          }

          deleteSessionCookie(ctx, true);
          await ctx.context.internalAdapter.deleteSession(session.token);
          ctx.context.setNewSession(null);

          const cookie = ctx.context.createAuthCookie(TWO_FACTOR_COOKIE_NAME, {
            maxAge: TWO_FACTOR_CHALLENGE_MAX_AGE
          });
          const identifier = `2fa-${generateRandomString(20)}`;
          const expiresAt = new Date(
            Date.now() + TWO_FACTOR_CHALLENGE_MAX_AGE * 1000
          );

          await ctx.context.internalAdapter.createVerificationValue({
            expiresAt,
            identifier,
            value: user.id
          });
          await ctx.context.internalAdapter.createVerificationValue({
            expiresAt,
            identifier: `2fa-attempts-${identifier}`,
            value: '0'
          });
          await ctx.setSignedCookie(
            cookie.name,
            identifier,
            ctx.context.secret,
            cookie.attributes
          );

          return ctx.json({
            twoFactorMethods: [mode],
            twoFactorRedirect: true
          });
        }
      )
    },
    hooks: {
      after: [
        {
          matcher: (context) => isProviderCallback(context.path),
          handler: createAuthMiddleware(async (ctx) => {
            const data = ctx.context.newSession;

            if (!data?.user.twoFactorEnabled) return;

            const updatedSession =
              await ctx.context.internalAdapter.updateSession(
                data.session.token,
                { twoFactorPending: true }
              );

            if (!updatedSession) {
              deleteSessionCookie(ctx, true);
              await ctx.context.internalAdapter.deleteSession(
                data.session.token
              );
              ctx.context.setNewSession(null);
              throw APIError.fromStatus('UNAUTHORIZED');
            }

            ctx.context.setNewSession({
              session: updatedSession,
              user: data.user
            });
          })
        }
      ],
      before: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            if (!isMethodAllowed(ctx.path, mode)) {
              throw APIError.fromStatus('NOT_FOUND');
            }

            if (isPendingSessionAllowed(ctx.path)) return;

            const currentSession = await getSessionFromCtx(ctx, {
              disableCookieCache: true,
              disableRefresh: true
            });

            if (currentSession?.session.twoFactorPending) {
              throw APIError.fromStatus('UNAUTHORIZED', {
                message: 'Two-factor authentication is required.'
              });
            }
          })
        }
      ]
    }
  } satisfies BetterAuthPlugin;
}
