import { GlobalConfig } from 'payload';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  fields: [
    {
      name: 'columns',
      label: 'Footer Columns',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true
            },
            {
              name: 'url',
              type: 'text',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'description',
      label: 'Footer description',
      type: 'textarea'
    }
  ]
};
