import type { CollectionConfig } from 'payload';
import { slugField } from 'payload';
import { generatePreviewPath } from '@/utilities/generatePreviewPath';
import { adminOnly } from '@/access/adminOnly';
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';
import { seoFields } from '@/fields/seo-fields';

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req
        })
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req
      }),
    useAsTitle: 'title'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'publishedOn',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime'
        },
        position: 'sidebar'
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date();
            }
            return value;
          }
        ]
      }
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true
            }
          ],
          label: 'Content'
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: seoFields
        }
      ]
    },
    slugField()
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete]
  },
  versions: {
    drafts: {
      autosave: true
    },
    maxPerDoc: 50
  }
};
