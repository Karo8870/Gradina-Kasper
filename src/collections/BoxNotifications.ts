import { checkRole } from '@/access/utilities';
import type { CollectionConfig } from 'payload';

export const BoxNotifications: CollectionConfig = {
  slug: 'box-notifications',
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)),
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (checkRole(['admin'], user)) return true;

      return {
        user: {
          equals: user.id
        }
      };
    },
    update: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user))
  },
  admin: {
    defaultColumns: ['user', 'box', 'sentAt', 'createdAt'],
    group: 'Shop',
    useAsTitle: 'id'
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'box',
      type: 'relationship',
      relationTo: 'products',
      required: true
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true
      }
    }
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data;

        const userID = data?.user;
        const boxID = data?.box;

        if (!userID || !boxID) return data;

        const existing = await req.payload.find({
          collection: 'box-notifications' as any,
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              {
                user: {
                  equals: typeof userID === 'object' ? userID.id : userID
                }
              },
              {
                box: {
                  equals: typeof boxID === 'object' ? boxID.id : boxID
                }
              }
            ]
          }
        });

        if (existing.totalDocs > 0) {
          throw new Error('Ai deja o notificare activă pentru acest box.');
        }

        return data;
      }
    ]
  }
};
