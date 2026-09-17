import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  adminOnlyField,
  adminOrSelf,
  publicAccess
} from '@/access/users';
import {
  passwordResetEmailHTML,
  passwordResetEmailSubject
} from '@/emails/auth/password-reset';
import {
  verificationEmailHTML,
  verificationEmailSubject
} from '@/emails/auth/verification';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email'
  },
  access: {
    admin: adminOnly,
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14,
    verify: {
      generateEmailHTML: (args) => {
        if (!args?.token || !args.user?.email) return '';
        return verificationEmailHTML({
          email: args.user.email,
          token: args.token
        });
      },
      generateEmailSubject: verificationEmailSubject
    },
    forgotPassword: {
      expiration: 1000 * 60 * 15,
      generateEmailHTML: (args) =>
        args?.token ? passwordResetEmailHTML({ token: args.token }) : '',
      generateEmailSubject: passwordResetEmailSubject
    }
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      saveToJWT: true,
      defaultValue: ['customer'],
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
