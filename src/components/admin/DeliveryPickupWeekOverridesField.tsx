'use client';

import React, { useMemo, useState } from 'react';
import { useFieldPath, useForm, useFormFields } from '@payloadcms/ui';

import {
  DeliveryPickupConfig,
  getDefaultAllowedWeekdays,
  normalizeWeekOverrides,
  WeekOverride,
  WEEKDAY_FIELDS
} from '@/lib/deliveryPickupConfig';
import {
  buildDateFromOffset,
  dateFromDateKey,
  getBucharestDateKey,
  getBucharestWeekStartKey
} from '@/lib/boxHelpers';

type Props = {
  path?: string;
};

const labelsByWeekday = new Map<number, string>(
  WEEKDAY_FIELDS.map((weekday) => [weekday.value, weekday.label])
);

const arraysMatch = (first: number[], second: number[]) => {
  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
};

const normalizeWeekdays = (weekdays: number[]) =>
  Array.from(new Set(weekdays)).sort((a, b) => a - b);

const getWeekDates = (weekStart: string) => {
  const monday = dateFromDateKey(weekStart);

  return WEEKDAY_FIELDS.map((weekday, index) => {
    const date = buildDateFromOffset(monday, index);

    return {
      ...weekday,
      date,
      dateKey: getBucharestDateKey(date)
    };
  });
};

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'short'
  }).format(date);

const formatWeekLabel = (weekStart: string) => {
  const dates = getWeekDates(weekStart);
  const first = dates[0]?.date;
  const last = dates[dates.length - 1]?.date;

  if (!first || !last) return weekStart;

  return `${formatDateLabel(first)} - ${formatDateLabel(last)}`;
};

export const DeliveryPickupWeekOverridesField: React.FC<Props> = ({ path }) => {
  const pathFromContext = useFieldPath();
  const fieldPath = path || pathFromContext || 'weekOverrides';
  const { setModified } = useForm();
  const dispatchFields = useFormFields(([, dispatch]) => dispatch);
  const value = useFormFields(
    ([fields]) => fields?.[fieldPath]?.value as WeekOverride[] | undefined
  );
  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    getBucharestWeekStartKey(new Date())
  );

  const weekdayValues = useFormFields(([fields]) =>
    WEEKDAY_FIELDS.reduce<DeliveryPickupConfig>((acc, weekday) => {
      const value = fields?.[weekday.key]?.value;
      acc[weekday.key] = typeof value === 'boolean' ? value : undefined;
      return acc;
    }, {})
  );

  const defaultWeekdays = useMemo(
    () => normalizeWeekdays(getDefaultAllowedWeekdays(weekdayValues)),
    [weekdayValues]
  );
  const overrides = useMemo(() => normalizeWeekOverrides(value), [value]);
  const override = overrides.find(
    (item) => item.weekStart === selectedWeekStart
  );
  const selectedAllowedWeekdays = normalizeWeekdays(
    override?.allowedWeekdays || defaultWeekdays
  );
  const currentWeekStart = getBucharestWeekStartKey(new Date());
  const todayKey = getBucharestDateKey(new Date());

  const saveWeek = (weekStart: string, allowedWeekdays: number[]) => {
    const normalizedAllowedWeekdays = normalizeWeekdays(allowedWeekdays);
    const nextOverrides = overrides.filter(
      (item) => item.weekStart !== weekStart
    );

    if (!arraysMatch(normalizedAllowedWeekdays, defaultWeekdays)) {
      nextOverrides.push({
        weekStart,
        allowedWeekdays: normalizedAllowedWeekdays
      });
    }

    dispatchFields({
      type: 'UPDATE',
      path: fieldPath,
      value: nextOverrides.sort((a, b) =>
        a.weekStart.localeCompare(b.weekStart)
      )
    });
    setModified(true);
  };

  const goToWeek = (offset: number) => {
    const nextWeekStart = getBucharestWeekStartKey(
      buildDateFromOffset(dateFromDateKey(selectedWeekStart), offset * 7)
    );

    if (nextWeekStart < currentWeekStart) return;

    setSelectedWeekStart(nextWeekStart);
  };

  const toggleWeekday = (weekday: number) => {
    const nextAllowedWeekdays = selectedAllowedWeekdays.includes(weekday)
      ? selectedAllowedWeekdays.filter((value) => value !== weekday)
      : [...selectedAllowedWeekdays, weekday];

    saveWeek(selectedWeekStart, nextAllowedWeekdays);
  };

  const futureOverrides = overrides.filter(
    (item) => item.weekStart >= currentWeekStart
  );

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 12,
          padding: 16
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
            marginBottom: 14
          }}
        >
          <button
            disabled={selectedWeekStart <= currentWeekStart}
            onClick={() => goToWeek(-1)}
            type='button'
          >
            Previous week
          </button>
          <strong>{formatWeekLabel(selectedWeekStart)}</strong>
          <button onClick={() => goToWeek(1)} type='button'>
            Next week
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))'
          }}
        >
          {getWeekDates(selectedWeekStart).map((day) => {
            const isSelected = selectedAllowedWeekdays.includes(day.value);
            const isPast = day.dateKey < todayKey;

            return (
              <button
                disabled={isPast}
                key={day.dateKey}
                onClick={() => toggleWeekday(day.value)}
                style={{
                  background: isSelected
                    ? 'var(--theme-success-150)'
                    : 'var(--theme-elevation-50)',
                  border: `1px solid ${
                    isSelected
                      ? 'var(--theme-success-500)'
                      : 'var(--theme-elevation-200)'
                  }`,
                  borderRadius: 10,
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  opacity: isPast ? 0.45 : 1,
                  padding: '12px 8px'
                }}
                type='button'
              >
                <span style={{ display: 'block', fontWeight: 600 }}>
                  {day.label}
                </span>
                <span style={{ display: 'block', marginTop: 4 }}>
                  {formatDateLabel(day.date)}
                </span>
              </button>
            );
          })}
        </div>

        <p style={{ color: 'var(--theme-elevation-600)', marginTop: 12 }}>
          Days are preselected from the default schedule. Any change stores this
          week as an override. If no days are selected, the whole week is
          disabled.
        </p>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px' }}>Modified current / future weeks</h4>
        {futureOverrides.length ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {futureOverrides.map((item) => (
              <button
                key={item.weekStart}
                onClick={() => setSelectedWeekStart(item.weekStart)}
                style={{
                  alignItems: 'center',
                  background: 'var(--theme-elevation-50)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  textAlign: 'left'
                }}
                type='button'
              >
                <span>{formatWeekLabel(item.weekStart)}</span>
                <span style={{ color: 'var(--theme-elevation-600)' }}>
                  {item.allowedWeekdays.length
                    ? item.allowedWeekdays
                        .map((weekday) => labelsByWeekday.get(weekday))
                        .join(', ')
                    : 'No delivery / pickup dates'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--theme-elevation-600)' }}>
            No modified current or future weeks yet.
          </p>
        )}
      </div>
    </div>
  );
};
