import type { Block } from 'payload';

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Hero'
  },
  fields: [
    {
      name: 'title',
      label: 'Titlu',
      type: 'text',
      required: true,
      defaultValue: 'Bine ati venit la Gradina Kasper!'
    },
    {
      name: 'description',
      label: 'Descriere',
      type: 'textarea',
      required: true,
      defaultValue:
        'Lorem ipsum dolor sit amet consectetur. Placerat euismod ullamcorper etiam semper morbi pulvinar.'
    },
    {
      name: 'desktopImage',
      label: 'Imagine desktop',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'mobileImage',
      label: 'Imagine mobile',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'ctaLabel',
      label: 'Text buton',
      type: 'text',
      required: true,
      defaultValue: 'Comanda acum'
    },
    {
      name: 'ctaUrl',
      label: 'Link buton',
      type: 'text',
      defaultValue: '/did-you-know'
    }
  ]
};
