import { describe, expect, test } from 'bun:test';

import { buildInvoiceData, getOrCreateInvoice } from './invoices';

const checkoutSnapshot = {
  billingAddress: {
    addressLine1: 'Strada Florilor 1',
    city: 'Brașov',
    country: 'RO',
    firstName: 'Ana',
    lastName: 'Ionescu',
    phone: '0712345678',
    postalCode: '500001',
    state: 'Brașov'
  },
  deliveryFee: 2400,
  deliveryVAT: 417,
  fulfillmentDate: '2026-09-30T12:00:00.000Z',
  fulfillmentMethod: 'delivery',
  grandTotal: 13840,
  lines: [
    { name: 'Box de legume', product: 7, quantity: 2, unitPrice: 4520 },
    { name: 'Box cu roșii', product: 8, quantity: 1, unitPrice: 2400 }
  ],
  productSubtotal: 11440,
  productVAT: 1134,
  vatRates: { delivery: 21, products: 11 }
};
const order = {
  id: 101,
  amount: 13840,
  checkoutSnapshot,
  currency: 'RON',
  customerEmail: 'ana@example.com'
};

const invoice = { id: 17, issuedAt: '2026-09-28T10:00:00.000Z' };

describe('invoice generation', () => {
  test('uses paid checkout prices and separates product and delivery VAT', () => {
    const data = buildInvoiceData({
      customerEmail: order.customerEmail,
      invoice,
      order
    });

    expect(data).toMatchObject({
      billingAddress: 'Strada Florilor 1, Brașov, Brașov, 500001, RO',
      clientName: 'Ana Ionescu',
      globalNoVAT: '122.89',
      globalTotal: '138.40',
      globalVAT: '15.51',
      invoiceID: 17
    });
    expect(data.products).toMatchObject([
      {
        name: 'Box de legume',
        quantity: '2',
        totalNoVAT: '81.44',
        totalVAT: '8.96',
        vat: '11%'
      },
      {
        name: 'Box cu roșii',
        totalNoVAT: '21.62',
        totalVAT: '2.38',
        vat: '11%'
      },
      {
        name: 'Serviciu de livrare',
        totalNoVAT: '19.83',
        totalVAT: '4.17',
        vat: '21%'
      }
    ]);
  });

  test('rejects a mismatch between invoice lines and paid total before issuing a number', async () => {
    let created = false;
    const req = {
      payload: {
        find: async () => ({ docs: [] }),
        create: async () => {
          created = true;
        }
      }
    };

    await expect(
      getOrCreateInvoice({
        order: {
          ...order,
          checkoutSnapshot: { ...checkoutSnapshot, grandTotal: 13841 },
          amount: 13841
        },
        req
      })
    ).rejects.toThrow('invoice lines do not match');
    expect(created).toBe(false);
  });

  test('reuses the existing invoice for an order', async () => {
    let created = false;
    const req = {
      payload: {
        find: async () => ({ docs: [invoice] }),
        create: async () => {
          created = true;
        }
      }
    };

    expect(await getOrCreateInvoice({ order, req })).toBe(invoice);
    expect(created).toBe(false);
  });
});
