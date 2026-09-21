import type { CollectionConfig } from 'payload';
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';

import { isDocumentOwner } from '@/access/users';

export const transactionsCollectionOverride: CollectionOverride = ({
  defaultCollection
}): CollectionConfig => ({
  ...defaultCollection,
  access: {
    ...defaultCollection.access,
    read: isDocumentOwner
  },
  admin: {
    ...defaultCollection.admin,
    defaultColumns: [
      'createdAt',
      'customer',
      'paymentMethod',
      'amount',
      'status'
    ]
  }
});
