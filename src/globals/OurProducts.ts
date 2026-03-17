import type { GlobalConfig } from 'payload';

export const OurProducts: GlobalConfig = {
  slug: 'our-products',
  label: 'Produsele noastre',
  fields: [
    {
      name: 'boxesSectionTitle',
      label: 'Titlu secțiune boxuri',
      type: 'text',
      required: true,
      defaultValue: 'Boxurile noastre'
    },
    {
      name: 'boxesSectionContent',
      label: 'Conținut rich text secțiune boxuri',
      type: 'richText'
    },
    {
      name: 'howItWorksSectionTitle',
      label: 'Titlu secțiune Cum funcționează',
      type: 'text',
      required: true,
      defaultValue: 'Cum funcționează'
    },
    {
      name: 'howItWorksSectionContent',
      label: 'Conținut rich text secțiune Cum funcționează',
      type: 'richText'
    },
    {
      name: 'howItWorksCards',
      label: 'Carduri Cum funcționează',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      required: true,
      defaultValue: [
        {
          title: 'Abonează boxul',
          text: 'Flexibil, fără obligații - pauză sau anulare oricând. Legume locale și speciale, livrate direct la tine acasă.'
        },
        {
          title: 'Noi recoltăm',
          text: 'Recoltăm legumele în funcție de sezon și le pregătim proaspăt pentru tine.'
        },
        {
          title: 'Livrăm sau ridici',
          text: 'Livrare direct la tine acasă sau ridicare de la Come Back în Coresi Mall.'
        }
      ],
      fields: [
        {
          name: 'title',
          label: 'Titlu card',
          type: 'text',
          required: true
        },
        {
          name: 'text',
          label: 'Text card',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      name: 'vegetablesSectionTitle',
      label: 'Titlu secțiune legume',
      type: 'text',
      required: true,
      defaultValue: 'Ce poate ajunge în boxul tău'
    },
    {
      name: 'vegetablesSectionDescription',
      label: 'Descriere secțiune legume',
      type: 'textarea',
      required: true,
      defaultValue:
        'În fiecare box pot ajunge legume diferite, în funcție de sezon și de disponibilitatea locală. Mai jos găsești un exemplu orientativ cu legume care pot fi incluse.'
    },
    {
      name: 'vegetablesSectionContent',
      label: 'Conținut rich text secțiune legume',
      type: 'richText'
    },
    {
      name: 'vegetables',
      label: 'Legume',
      type: 'array',
      defaultValue: [
        { name: 'morcovi' },
        { name: 'rosii' },
        { name: 'castraveti' },
        { name: 'ardei' },
        { name: 'vinete' },
        { name: 'ceapa' },
        { name: 'usturoi' },
        { name: 'broccoli' },
        { name: 'conopida' },
        { name: 'cartofi' },
        { name: 'salata' },
        { name: 'spanac' },
        { name: 'ridichi' },
        { name: 'varza' },
        { name: 'dovlecei' },
        { name: 'dovleac' },
        { name: 'patrunjel' },
        { name: 'telina' },
        { name: 'fasole' },
        { name: 'mazare' }
      ],
      fields: [
        {
          name: 'name',
          label: 'Nume',
          type: 'text',
          required: true
        },
        {
          name: 'image',
          label: 'Imagine',
          type: 'upload',
          relationTo: 'media'
        }
      ]
    }
  ]
};
