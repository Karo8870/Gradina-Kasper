import type { CollectionConfig } from 'payload';

export const Boxes: CollectionConfig = {
  slug: 'boxes',
  labels: {
    singular: 'Box',
    plural: 'Box-uri'
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'showOnHome', 'updatedAt']
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'title',
      label: 'Titlu',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      label: 'Descriere',
      type: 'textarea',
      required: true
    },
    {
      name: 'contents',
      label: 'Conținut box',
      type: 'array',
      defaultValue: [
        { item: 'Morcovi' },
        { item: 'Roșii' },
        { item: 'Castraveți' },
        { item: 'Salată verde' }
      ],
      fields: [
        {
          name: 'item',
          label: 'Produs',
          type: 'text',
          required: true
        }
      ]
    },
    {
      name: 'seasonInterval',
      label: 'Interval sezonier',
      type: 'group',
      fields: [
        {
          name: 'from',
          label: 'Disponibil de la',
          type: 'text',
          required: true,
          defaultValue: '5 martie'
        },
        {
          name: 'to',
          label: 'Disponibil până la',
          type: 'text',
          required: true,
          defaultValue: '10 noiembrie'
        }
      ]
    },
    {
      name: 'image',
      label: 'Imagine',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'price',
      label: 'Preț',
      type: 'text',
      required: true,
      defaultValue: '99 lei'
    },
    {
      name: 'showOnHome',
      label: 'Afișează pe Home',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Selectează un singur box pentru afișare pe home.'
      }
    }
  ]
};
