import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ],
  upload: {
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
        effort: 5
      }
    },
    crop: true,
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    withMetadata: false
  }
};
