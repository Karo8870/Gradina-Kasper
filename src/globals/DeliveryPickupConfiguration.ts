import type { GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

const weekdayCheckbox = ({
  defaultValue = false,
  label,
  name
}: {
  defaultValue?: boolean;
  label: string;
  name: string;
}) => ({
  name,
  label,
  type: 'checkbox' as const,
  defaultValue
});

export const DeliveryPickupConfiguration: GlobalConfig = {
  slug: 'delivery-pickup-configuration',
  label: 'Delivery / Pickup Configuration',
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: 'Settings'
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Default schedule',
          fields: [
            {
              type: 'row',
              fields: [
                weekdayCheckbox({ name: 'monday', label: 'Monday' }),
                weekdayCheckbox({
                  name: 'tuesday',
                  label: 'Tuesday',
                  defaultValue: true
                }),
                weekdayCheckbox({ name: 'wednesday', label: 'Wednesday' }),
                weekdayCheckbox({ name: 'thursday', label: 'Thursday' }),
                weekdayCheckbox({
                  name: 'friday',
                  label: 'Friday',
                  defaultValue: true
                }),
                weekdayCheckbox({ name: 'saturday', label: 'Saturday' }),
                weekdayCheckbox({ name: 'sunday', label: 'Sunday' })
              ]
            }
          ]
        },
        {
          label: 'Modified weeks',
          fields: [
            {
              name: 'weekOverrides',
              label: 'Modified weeks',
              type: 'json',
              defaultValue: [],
              admin: {
                components: {
                  Field:
                    '@/components/admin/DeliveryPickupWeekOverridesField#DeliveryPickupWeekOverridesField'
                },
                description:
                  'Modify only specific weeks. An empty selected week means no delivery / pickup dates that week.'
              }
            }
          ]
        }
      ]
    }
  ]
};
