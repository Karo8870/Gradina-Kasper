import { FormStatus, type FormStatusKind } from '@/components/form-components';

import { getSearchParam } from './utils';

const feedbackOrder = ['error', 'warning', 'success', 'message'] as const;

export function AuthFeedback({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
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
