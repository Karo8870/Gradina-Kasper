import { format } from 'date-fns';

type Props = {
  date: string | Date;
  format?: string;
};

export const formatDateTime = ({
  date,
  format: formatFromProps
}: Props): string => {
  if (!date) return '';

  const dateFormat = formatFromProps ?? 'dd.MM.yyyy';

  return format(new Date(date), dateFormat);
};
