import type { CollectionConfig } from 'payload';

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  labels: {
    singular: 'Legal page',
    plural: 'Legal pages'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'This becomes the URL path for the page'
      }
    },
    {
      name: 'content',
      type: 'richText',
      required: true
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString(),
      admin: {
        readOnly: true
      }
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' }
      ]
    }
  ]
};
