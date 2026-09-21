import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/users';

const weekdayOptions = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '7' }
];

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
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Default Schedule',
          fields: [
            {
              name: 'allowedWeekdays',
              type: 'select',
              label: 'Allowed weekdays',
              defaultValue: ['2', '5'],
              hasMany: true,
              options: weekdayOptions,
              required: true
            }
          ]
        },
        {
          label: 'Week Overrides',
          fields: [
            {
              name: 'weekOverrides',
              type: 'array',
              label: 'Week overrides',
              admin: {
                description:
                  'The week starts on Monday. Leave allowed weekdays empty to disable fulfillment for that week.'
              },
              fields: [
                {
                  name: 'weekStart',
                  type: 'date',
                  label: 'Week starting',
                  required: true,
                  validate: (value) => {
                    if (!value) return true;

                    const date = new Date(value);
                    return Number.isFinite(date.getTime()) &&
                      date.getUTCDay() === 1
                      ? true
                      : 'Select a Monday as the start of the week.';
                  },
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly'
                    }
                  }
                },
                {
                  name: 'allowedWeekdays',
                  type: 'select',
                  label: 'Allowed weekdays',
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
