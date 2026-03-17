import type { GlobalConfig } from 'payload';
import { HeroBlock } from '@/blocks/HeroBlock';
import { StepCardListBlock } from '@/blocks/StepCardListBlock';

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Acasa',
  fields: [
    {
      name: 'layout',
      label: 'Blocuri homepage',
      type: 'blocks',
      minRows: 1,
      required: true,
      blocks: [HeroBlock, StepCardListBlock],
      defaultValue: [
        {
          blockType: 'hero',
          title: 'Bine ati venit la Gradina Kasper!',
          description:
            'Lorem ipsum dolor sit amet consectetur. Placerat euismod ullamcorper etiam semper morbi pulvinar.',
          ctaLabel: 'Comanda acum',
          ctaUrl: '/did-you-know'
        },
        {
          blockType: 'step-card-list',
          items: [
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
          ]
        }
      ]
    }
  ]
};
