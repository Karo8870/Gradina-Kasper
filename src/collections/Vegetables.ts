import type { CollectionConfig } from 'payload';

import { adminOnly, publicAccess } from '@/access/users';
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-content';

export const Vegetables: CollectionConfig = {
  slug: 'vegetables',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly
  },
  admin: {
    group: 'Content',
    useAsTitle: 'name'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true
    }
  ],
  hooks: createCollectionRevalidationHooks({
    resolvePaths: async ({ doc, req }) => {
      const paths = ['/products'];

      if (!doc.id) return paths;

      const { docs: products } = await req.payload.find({
        collection: 'products',
        depth: 0,
        overrideAccess: true,
        pagination: false,
        select: {
          slug: true
        },
        where: {
          possibleVegetables: {
            contains: doc.id
          }
        }
      });

      return [
        ...paths,
        ...products.flatMap((product) =>
          product.slug ? [`/products/${product.slug}`] : []
        )
      ];
    }
  })
};
