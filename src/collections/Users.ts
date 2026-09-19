import type { CollectionConfig } from 'payload';
import { betterAuthStrategy } from '@delmaredigital/payload-better-auth';

import {
  adminOnly,
  adminOnlyField,
  adminOrSelf
} from '@/access/users';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email'
  },
  access: {
    admin: adminOnly,
    create: adminOnly,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()]
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      saveToJWT: true,
      defaultValue: 'customer',
      options: [
        {
          label: 'Admin',
          value: 'admin'
        },
        {
          label: 'Customer',
          value: 'customer'
        }
      ],
      access: {
        create: adminOnlyField,
        read: adminOnlyField,
        update: adminOnlyField
      }
    }
  ]
};
