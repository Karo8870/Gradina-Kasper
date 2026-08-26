import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

export const Media: CollectionConfig = {
  admin: {
    group: 'Content'
  },
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  upload: {
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
        effort: 5
      }
    },

    resizeOptions: {
      width: 2400,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true
    },

    crop: true,
    focalPoint: true,

    adminThumbnail: 'thumbnail',

    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
            effort: 5
          }
        }
      }
    ],

    withMetadata: false
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ]
};
