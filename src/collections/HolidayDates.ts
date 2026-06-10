import { CollectionConfig } from 'payload';
import { adminOnly } from '@/access/adminOnly';

export const HolidayDates: CollectionConfig = {
  slug: 'holiday-dates',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  admin: {
    useAsTitle: 'date',
    group: 'Other'
  },
  fields: [
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly'
        }
      },
      required: true
    }
  ]
};
