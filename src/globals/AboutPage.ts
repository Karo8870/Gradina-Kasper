import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  access: {
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Pages'
  },
  fields: [
    {
      name: 'teamImage',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Echipa noastră',
      required: true
    },
    {
      name: 'description',
      type: 'richText',
      required: true
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/about-us'])]
  }
};
