import { GlobalConfig } from 'payload';

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  fields: [
    {
      name: 'links',
      label: 'Header links',
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
};
