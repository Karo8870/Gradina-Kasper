import type { DateField } from 'payload';

export const publishedOnField: DateField = {
  name: 'publishedOn',
  type: 'date',
  admin: {
    date: {
      pickerAppearance: 'dayAndTime'
    },
    position: 'sidebar'
  },
  hooks: {
    beforeChange: [
      ({ siblingData, value }) => {
        if (siblingData._status === 'published' && !value) {
          return new Date();
        }

        return value;
      }
    ]
  }
};
