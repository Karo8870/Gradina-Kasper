import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const DidYouKnowPage: GlobalConfig = {
  slug: 'did-you-know-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Știai că...',
      required: true
    },
    {
      name: 'didYouKnowContent',
      type: 'richText',
      required: true
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/did-you-know'])]
  }
};
