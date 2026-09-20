import { betterAuthStrategy } from '@delmaredigital/payload-better-auth';
import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  adminOnlyField,
  adminOrSelf,
  denyFieldAccess
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
    update: adminOnly
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [betterAuthStrategy()]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      saveToJWT: true
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      saveToJWT: true,
      access: {
        create: adminOnlyField,
        update: denyFieldAccess
      }
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      saveToJWT: true,
      admin: {
        readOnly: true
      },
      access: {
        create: denyFieldAccess,
        update: denyFieldAccess
      }
    },
    {
      name: 'image',
      type: 'text',
      saveToJWT: false
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      saveToJWT: true,
      admin: {
        readOnly: true
      },
      access: {
        create: denyFieldAccess,
        update: denyFieldAccess
      }
    },
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
