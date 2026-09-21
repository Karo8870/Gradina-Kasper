import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Field,
  Where
} from 'payload';
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types';

import { adminOnlyField, hasRole } from '@/access/users';

function cartSecret(req: Parameters<Access>[0]['req']) {
  const value = req.context?.cartSecret ?? req.query?.secret;
  return typeof value === 'string' && value ? value : null;
}

export const cartDocumentAccess: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  const conditions: Where[] = [];
  if (req.user?.id) {
    conditions.push({ customer: { equals: req.user.id } });
  }

  const secret = cartSecret(req);
  if (secret) {
    conditions.push({
      and: [{ customer: { exists: false } }, { secret: { equals: secret } }]
    });
  }

  if (!conditions.length) return false;
  return conditions.length === 1 ? conditions[0] : { or: conditions };
};

export const secureCartOwnership: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req
}) => {
  if (hasRole(req.user, 'admin')) return data;

  if (operation === 'create' && req.user?.id) {
    return {
      ...data,
      customer: req.user.id,
      secret: null
    };
  }

  if (operation === 'update' && originalDoc?.customer && req.user?.id) {
    return { ...data, secret: null };
  }

  if (operation === 'update' && !originalDoc?.customer && req.user?.id) {
    return {
      ...data,
      customer: req.user.id,
      secret: null
    };
  }

  return data;
};

function protectCustomerField(field: Field): Field {
  if (field.type !== 'relationship' || field.name !== 'customer') return field;

  return {
    ...field,
    access: {
      ...field.access,
      create: adminOnlyField,
      update: adminOnlyField
    }
  };
}

export const cartsCollectionOverride: CollectionOverride = ({
  defaultCollection
}): CollectionConfig => ({
  ...defaultCollection,
  access: {
    ...defaultCollection.access,
    delete: cartDocumentAccess,
    read: cartDocumentAccess,
    update: cartDocumentAccess
  },
  fields: defaultCollection.fields.map(protectCustomerField),
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      secureCartOwnership,
      ...(defaultCollection.hooks?.beforeChange ?? [])
    ]
  }
});
