'use client';

import { useEffect } from 'react';

import { FormStatus, type FormStatusKind } from '@/components/form-components';
import { getSearchParam } from '@/lib/auth/utils';

const feedbackOrder = ['error', 'warning', 'success', 'message'] as const;

export function AuthFeedback({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const hasFeedback = feedbackOrder.some((kind) =>
    Boolean(getSearchParam(searchParams, kind))
  );

  useEffect(() => {
    if (!hasFeedback) return;

    const url = new URL(window.location.href);

    for (const kind of feedbackOrder) {
      url.searchParams.delete(kind);
    }

    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
  }, [hasFeedback]);

  return (
    <div className='flex flex-col gap-3'>
      {feedbackOrder.map((kind) => {
        const message = getSearchParam(searchParams, kind);
        return message ? (
          <FormStatus key={kind} kind={kind as FormStatusKind}>
            {message}
          </FormStatus>
        ) : null;
      })}
    </div>
  );
}
