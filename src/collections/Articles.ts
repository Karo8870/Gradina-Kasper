import { slugField } from 'payload';
import type { CollectionConfig, DefaultDocumentIDType } from 'payload';

import { adminOnly, adminOrPublishedContent } from '@/access/users';
import { publishedOnField } from '@/fields/published-on';
import {
  articleRevalidationPaths,
  createCollectionRevalidationHooks
} from '@/hooks/revalidate-content';

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedContent,
    update: adminOnly
  },
  admin: {
    defaultColumns: ['title', 'slug', 'publishedOn', '_status'],
    group: 'Content',
    useAsTitle: 'title'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    publishedOnField,
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
      defaultValue: [],
      hasMany: true,
      filterOptions: ({ id }) =>
        id
          ? {
              id: {
                not_in: [id as DefaultDocumentIDType]
              }
            }
          : true
    },
    slugField({
      position: 'sidebar',
      useAsSlug: 'title'
    })
  ],
  hooks: createCollectionRevalidationHooks({
    publishedOnly: true,
    resolvePaths: ({ doc }) => articleRevalidationPaths(doc)
  }),
  versions: {
    drafts: {
      autosave: true
    },
    maxPerDoc: 50
  }
};
