import type { Block } from 'payload';

export const StepCardListBlock: Block = {
  slug: 'step-card-list',
  labels: {
    singular: 'Lista pasi',
    plural: 'Liste pasi'
  },
  fields: [
    {
      name: 'items',
      label: 'Pasi',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 3,
      defaultValue: [
        {
          content: 'Selecteaza produsele si cantitatea',
          icon: 'basket',
          textClass: 'text-secondary-700',
          baseClass: 'bg-secondary-50'
        },
        {
          content: 'Verifica comanda si alege modalitatea de plata',
          icon: 'card',
          textClass: 'text-[#3F6A2B]',
          baseClass: 'bg-[#DDF7D1]'
        },
        {
          content:
            'Trimite comanda si ridic-o de la locatia noastra Come Back din Coresi Mall',
          icon: 'shop',
          textClass: 'text-primary-700',
          baseClass: 'bg-primary-100'
        }
      ],
      fields: [
        {
          name: 'content',
          label: 'Continut',
          type: 'textarea',
          required: true
        },
        {
          name: 'icon',
          label: 'Iconita',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Cos',
              value: 'basket'
            },
            {
              label: 'Card',
              value: 'card'
            },
            {
              label: 'Magazin',
              value: 'shop'
            }
          ]
        },
        {
          name: 'textClass',
          label: 'Clasa culoare text',
          type: 'text',
          required: true
        },
        {
          name: 'baseClass',
          label: 'Clasa fundal card',
          type: 'text',
          required: true
        }
      ]
    }
  ]
};
