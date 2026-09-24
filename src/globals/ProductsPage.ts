import type { Field, GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

function stepFields(): Field[] {
  return [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'text',
      required: true
    }
  ];
}

export const ProductsPage: GlobalConfig = {
  slug: 'products-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      name: 'boxesSectionTitle',
      type: 'text',
      defaultValue: 'Boxurile noastre',
      required: true
    },
    {
      name: 'boxesSectionContent',
      type: 'richText',
      required: true
    },
    {
      name: 'howItWorksTitle',
      type: 'text',
      defaultValue: 'Cum funcționează',
      required: true
    },
    {
      name: 'howItWorksContent',
      type: 'richText',
      required: true
    },
    {
      name: 'step1',
      type: 'group',
      fields: stepFields()
    },
    {
      name: 'step2',
      type: 'group',
      fields: stepFields()
    },
    {
      name: 'step3',
      type: 'group',
      fields: stepFields()
    },
    {
      name: 'whatsInYourBoxTitle',
      type: 'text',
      defaultValue: 'Ce poate ajunge în boxul tău?',
      required: true
    },
    {
      name: 'whatsInYourBoxContent',
      type: 'richText',
      required: true
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/products'])]
  }
};
