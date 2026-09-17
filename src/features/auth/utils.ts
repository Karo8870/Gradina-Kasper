import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { FormStatusKind } from '@/components/form-components';

export function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseInternalPath(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;

  const hashIndex = value.indexOf('#');
  const pathAndSearch = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : value.slice(hashIndex);
  const searchIndex = pathAndSearch.indexOf('?');

  return {
    hash,
    pathname:
      searchIndex === -1 ? pathAndSearch : pathAndSearch.slice(0, searchIndex),
    searchParams: new URLSearchParams(
      searchIndex === -1 ? '' : pathAndSearch.slice(searchIndex + 1)
    )
  };
}

function formatInternalPath({
  hash,
  pathname,
  searchParams
}: NonNullable<ReturnType<typeof parseInternalPath>>) {
  const search = searchParams.toString();
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
}

export function safeInternalRedirect(value: string | null | undefined) {
  if (!value) return undefined;

  const path = parseInternalPath(value);
  return path ? formatInternalPath(path) : undefined;
}

export function withFeedback(
  pathname: string,
  kind: FormStatusKind,
  text: string,
  extra: Record<string, string | undefined> = {}
) {
  const path = parseInternalPath(pathname);

  if (!path) {
    throw new Error('Feedback paths must be internal.');
  }

  path.searchParams.set(kind, text);

  for (const [key, value] of Object.entries(extra)) {
    if (value) path.searchParams.set(key, value);
  }

  return formatInternalPath(path);
}

export function redirectQuery(searchParams: ReadonlyURLSearchParams) {
  const redirect = safeInternalRedirect(searchParams.get('redirect'));
  return redirect ? `?${new URLSearchParams({ redirect }).toString()}` : '';
}
