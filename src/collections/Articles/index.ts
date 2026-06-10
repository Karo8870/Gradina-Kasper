import type { CollectionConfig, DefaultDocumentIDType } from 'payload';
import { slugField } from 'payload';
import { adminOnly } from '@/access/adminOnly';
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';
import { seoFields } from '@/fields/seo-fields';

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
              name: 'description',
              type: 'textarea',
              required: true
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              required: true
            },
            {
              name: 'content',
              type: 'richText',
              required: true
            },
            {
              name: 'relatedArticles',
              type: 'relationship',
              relationTo: 'articles',
              required: true,
              defaultValue: [],
              hasMany: true,
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id as DefaultDocumentIDType]
                    }
                  };
                }

                return {
                  id: {
                    exists: true
                  }
                };
              }
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
