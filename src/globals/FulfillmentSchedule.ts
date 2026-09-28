import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/users';
import {
  WEEKDAY_FIELDS,
  normalizeWeekOverrides
} from '@/commerce/fulfillment-admin';

const weekdayOptions = WEEKDAY_FIELDS.map(({ label, value }) => ({
  label,
  value: String(value)
}));

export const FulfillmentSchedule: GlobalConfig = {
  slug: 'fulfillment-schedule',
  label: 'Fulfillment Schedule',
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: 'Commerce'
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (!WEEKDAY_FIELDS.some(({ key }) => typeof doc[key] === 'boolean')) {
          const legacyWeekdays = (doc.allowedWeekdays ?? ['2', '5']).map(
            Number
          );
          for (const { key, value } of WEEKDAY_FIELDS) {
            doc[key] = legacyWeekdays.includes(value);
          }
        }
        if (!doc.weeklyOverrides?.length && doc.weekOverrides?.length) {
          doc.weeklyOverrides = doc.weekOverrides.map(
            (item: { allowedWeekdays?: string[]; weekStart: string }) => ({
              allowedWeekdays: (item.allowedWeekdays ?? []).map(Number),
              weekStart: item.weekStart.slice(0, 10)
            })
          );
        }
        return doc;
      }
    ],
    beforeChange: [
      ({ data }) => {
        if (Array.isArray(data.weeklyOverrides)) data.weekOverrides = [];
        return data;
      }
    ]
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Default Schedule',
          fields: [
            {
              type: 'row',
              fields: WEEKDAY_FIELDS.map(({ key, label }) => ({
                name: key,
                label,
                type: 'checkbox' as const
              }))
            },
            {
              name: 'allowedWeekdays',
              type: 'select',
              label: 'Legacy allowed weekdays',
              defaultValue: ['2', '5'],
              hasMany: true,
              options: weekdayOptions,
              admin: { hidden: true }
            }
          ]
        },
        {
          label: 'Week Overrides',
          fields: [
            {
              name: 'weeklyOverrides',
              type: 'json',
              label: 'Modified weeks',
              defaultValue: [],
              validate: (value) => {
                if (value == null) return true;
                if (!Array.isArray(value))
                  return 'Expected a list of modified weeks.';
                return (
                  value.every(
                    (item) =>
                      typeof item?.weekStart === 'string' &&
                      /^\d{4}-\d{2}-\d{2}$/.test(item.weekStart) &&
                      new Date(
                        `${item.weekStart}T12:00:00.000Z`
                      ).getUTCDay() === 1 &&
                      Array.isArray(item.allowedWeekdays) &&
                      normalizeWeekOverrides([item])[0]?.allowedWeekdays
                        .length === item.allowedWeekdays.length
                  ) || 'Each modified week needs a Monday and valid weekdays.'
                );
              },
              admin: {
                components: {
                  Field:
                    '@/components/admin/fulfillment-week-overrides-field#FulfillmentWeekOverridesField'
                },
                description:
                  'Choose a week, then toggle its delivery or pickup days. An empty week disables fulfillment for that week.'
              }
            },
            {
              name: 'weekOverrides',
              type: 'array',
              label: 'Legacy week overrides',
              admin: { hidden: true },
              fields: [
                {
                  name: 'weekStart',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayOnly' } }
                },
                {
                  name: 'allowedWeekdays',
                  type: 'select',
                  hasMany: true,
                  options: weekdayOptions
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
