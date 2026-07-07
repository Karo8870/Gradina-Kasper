export type WeekOverride = {
  allowedWeekdays: number[];
  weekStart: string;
};

export type DeliveryPickupConfig = {
  friday?: boolean | null;
  monday?: boolean | null;
  saturday?: boolean | null;
  sunday?: boolean | null;
  thursday?: boolean | null;
  tuesday?: boolean | null;
  wednesday?: boolean | null;
  weekOverrides?: WeekOverride[] | null;
};

export const DEFAULT_ALLOWED_WEEKDAYS = [2, 5];

export const WEEKDAY_FIELDS = [
  { key: 'monday', label: 'Monday', value: 1 },
  { key: 'tuesday', label: 'Tuesday', value: 2 },
  { key: 'wednesday', label: 'Wednesday', value: 3 },
  { key: 'thursday', label: 'Thursday', value: 4 },
  { key: 'friday', label: 'Friday', value: 5 },
  { key: 'saturday', label: 'Saturday', value: 6 },
  { key: 'sunday', label: 'Sunday', value: 7 }
] as const;

export const getDefaultAllowedWeekdays = (
  config?: DeliveryPickupConfig | null
) => {
  if (!config) return DEFAULT_ALLOWED_WEEKDAYS;

  const hasConfiguredWeekday = WEEKDAY_FIELDS.some(
    (weekday) => typeof config[weekday.key] === 'boolean'
  );

  if (!hasConfiguredWeekday) return DEFAULT_ALLOWED_WEEKDAYS;

  return WEEKDAY_FIELDS.filter((weekday) => config[weekday.key]).map(
    (weekday) => weekday.value
  );
};

export const normalizeWeekOverrides = (
  overrides?: DeliveryPickupConfig['weekOverrides']
) => {
  if (!Array.isArray(overrides)) return [];

  return overrides
    .filter(
      (override): override is WeekOverride =>
        Boolean(override?.weekStart) && Array.isArray(override.allowedWeekdays)
    )
    .map((override) => ({
      weekStart: override.weekStart,
      allowedWeekdays: Array.from(
        new Set(
          override.allowedWeekdays
            .map((weekday) => Number(weekday))
            .filter((weekday) => weekday >= 1 && weekday <= 7)
        )
      ).sort((a, b) => a - b)
    }));
};

export const getDeliveryPickupConfig = async (
  payload: any
): Promise<DeliveryPickupConfig> => {
  try {
    return await payload.findGlobal({
      slug: 'delivery-pickup-configuration' as any,
      depth: 0
    });
  } catch {
    return {
      tuesday: true,
      friday: true,
      weekOverrides: []
    };
  }
};
