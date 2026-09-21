import { describe, expect, test } from 'bun:test';

import {
  cartDocumentAccess,
  cartsCollectionOverride,
  secureCartOwnership
} from './Carts';

function accessRequest({ secret, user }) {
  return {
    req: {
      context: {},
      query: secret ? { secret } : {},
      user
    }
  };
}

describe('cart ownership access', () => {
  test('blocks customers and guests from writing the customer field', () => {
    const collection = cartsCollectionOverride({
      defaultCollection: {
        slug: 'carts',
        fields: [
          {
            name: 'customer',
            type: 'relationship',
            relationTo: 'users'
          }
        ]
      }
    });
    const customerField = collection.fields.find(
      (field) => 'name' in field && field.name === 'customer'
    );

    expect(customerField.access.create(accessRequest({}))).toBe(false);
    expect(
      customerField.access.update(
        accessRequest({ user: { id: 12, role: 'customer' } })
      )
    ).toBe(false);
    expect(
      customerField.access.update(
        accessRequest({ user: { id: 1, role: 'admin' } })
      )
    ).toBe(true);
  });

  test('limits guest-secret access to unowned carts', () => {
    expect(
      cartDocumentAccess(accessRequest({ secret: 'guest-secret' }))
    ).toEqual({
      and: [
        { customer: { exists: false } },
        { secret: { equals: 'guest-secret' } }
      ]
    });
  });

  test('limits customers to their own carts without a guest secret', () => {
    expect(
      cartDocumentAccess(accessRequest({ user: { id: 12, role: 'customer' } }))
    ).toEqual({ customer: { equals: 12 } });
  });

  test('allows admins to manage every cart', () => {
    expect(
      cartDocumentAccess(accessRequest({ user: { id: 1, role: 'admin' } }))
    ).toBe(true);
  });

  test('assigns authenticated cart creation to the current customer', async () => {
    const result = await secureCartOwnership({
      data: { customer: 99 },
      operation: 'create',
      originalDoc: {},
      req: { user: { id: 12, role: 'customer' } }
    });

    expect(result).toMatchObject({ customer: 12, secret: null });
  });

  test('claims an unowned guest cart and revokes its secret', async () => {
    const result = await secureCartOwnership({
      data: {},
      operation: 'update',
      originalDoc: { customer: null, secret: 'guest-secret' },
      req: { user: { id: 12, role: 'customer' } }
    });

    expect(result).toMatchObject({ customer: 12, secret: null });
  });
});
