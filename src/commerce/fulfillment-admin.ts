export type WeekOverride = {
  allowedWeekdays: number[];
  weekStart: string;
};

export type FulfillmentScheduleConfig = Partial<
  Record<(typeof WEEKDAY_FIELDS)[number]['key'], boolean | null>
>;

export const WEEKDAY_FIELDS = [
  { key: 'monday', label: 'Monday', value: 1 },
  { key: 'tuesday', label: 'Tuesday', value: 2 },
  { key: 'wednesday', label: 'Wednesday', value: 3 },
  { key: 'thursday', label: 'Thursday', value: 4 },
  { key: 'friday', label: 'Friday', value: 5 },
  { key: 'saturday', label: 'Saturday', value: 6 },
  { key: 'sunday', label: 'Sunday', value: 7 }
] as const;

const timeZone = 'Europe/Bucharest';

export function getDefaultAllowedWeekdays(
  config: FulfillmentScheduleConfig,
  legacy?: string[]
) {
  if (WEEKDAY_FIELDS.some(({ key }) => typeof config[key] === 'boolean')) {
    return WEEKDAY_FIELDS.filter(({ key }) => config[key]).map(
      ({ value }) => value
    );
  }
  return legacy?.map(Number) ?? [2, 5];
}

export function normalizeWeekOverrides(value: unknown): WeekOverride[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is WeekOverride =>
        typeof item?.weekStart === 'string' &&
        Array.isArray(item?.allowedWeekdays)
    )
    .map((item) => ({
      weekStart: item.weekStart.slice(0, 10),
      allowedWeekdays: [
        ...new Set(
          item.allowedWeekdays
            .map(Number)
            .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
        )
      ].sort((a, b) => a - b)
    }));
}

export function buildDateFromOffset(base: Date, days: number) {
  const date = new Date(base);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export function getBucharestDateKey(value: Date | string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric'
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function dateFromDateKey(key: string) {
  return new Date(`${key}T12:00:00.000Z`);
}

export function getBucharestWeekStartKey(value: Date | string) {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short'
  }).format(date);
  const offset = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
    weekday
  );
  return getBucharestDateKey(buildDateFromOffset(date, -offset));
}
