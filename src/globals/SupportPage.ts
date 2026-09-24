import type { GlobalConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createGlobalRevalidationHook } from '@/hooks/revalidate-content';

export const SupportPage: GlobalConfig = {
  slug: 'support-page',
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
      defaultValue: 'Suport',
      required: true
    },
    {
      name: 'description',
      type: 'richText',
      required: true
    },
    {
      name: 'phoneLabel',
      type: 'text',
      defaultValue: 'Telefon',
      required: true
    },
    {
      name: 'phone',
      type: 'text',
      required: true
    },
    {
      name: 'emailLabel',
      type: 'text',
      defaultValue: 'Email',
      required: true
    },
    {
      name: 'email',
      type: 'email',
      required: true
    },
    {
      name: 'whatsappLabel',
      type: 'text',
      defaultValue: 'WhatsApp',
      required: true
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      required: true
    },
    {
      name: 'whatsappPrefillMessage',
      type: 'textarea',
      defaultValue: 'Bună! Am nevoie de ajutor cu o comandă.',
      required: true
    }
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook(['/support'])]
  }
};
