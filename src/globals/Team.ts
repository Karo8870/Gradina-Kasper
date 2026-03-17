import { GlobalConfig } from 'payload';

export const Team: GlobalConfig = {
  slug: 'team',
  label: 'Team',
  fields: [
    {
      name: 'teamImage',
      label: 'Team image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
      required: true
    },
    {
      name: 'members',
      label: 'Team members',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'bio',
          type: 'textarea',
          required: true
        }
      ]
    }
  ]
};
