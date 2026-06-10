export type SortFilterItem = {
  reverse: boolean;
  slug: null | string;
  title: string;
};

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'Alphabetic A-Z'
};
