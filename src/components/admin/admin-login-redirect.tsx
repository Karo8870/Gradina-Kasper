import type { AdminViewServerProps } from 'payload';

import { redirect } from 'next/navigation';

import {
  getSearchParam,
  safeInternalRedirect,
  withSafeRedirect
} from '@/lib/auth/utils';

export function AdminLoginRedirect({ searchParams }: AdminViewServerProps) {
  const requestedPath = safeInternalRedirect(
    getSearchParam(searchParams ?? {}, 'redirect')
  );

  redirect(withSafeRedirect('/login', requestedPath ?? '/admin'));
}
