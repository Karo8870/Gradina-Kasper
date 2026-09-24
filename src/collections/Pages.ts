import { slugField } from 'payload';
import type { CollectionConfig } from 'payload';

import { adminOnly, adminOrPublishedContent } from '@/access/users';
import { publishedOnField } from '@/fields/published-on';
import {
  createCollectionRevalidationHooks,
  pageRevalidationPaths
} from '@/hooks/revalidate-content';

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedContent,
    update: adminOnly
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
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
      name: 'content',
      type: 'richText',
      required: true
    },
    slugField({
      position: 'sidebar',
      useAsSlug: 'title'
    })
  ],
  hooks: createCollectionRevalidationHooks({
    publishedOnly: true,
    resolvePaths: ({ doc }) => pageRevalidationPaths(doc)
  }),
  versions: {
    drafts: {
      autosave: true
    },
    maxPerDoc: 50
  }
};
