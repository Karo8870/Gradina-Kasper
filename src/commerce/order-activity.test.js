import { describe, expect, test } from 'bun:test';

import { canCancelOrder } from './order-activity';
import {
  getDefaultAllowedWeekdays,
  normalizeWeekOverrides
} from './fulfillment-admin';
import { renderOrderTemplate } from '../emails/orders/templates';
import {
  emailOrderStatusChange,
  recordOrderActivity
} from '../collections/Orders';

describe('order cancellation eligibility', () => {
  test('allows cancellation at least one Bucharest calendar day before fulfillment', () => {
    expect(
      canCancelOrder({
        fulfillmentDate: '2026-09-23T12:00:00.000Z',
        now: new Date('2026-09-22T20:00:00.000Z'),
        status: 'processing'
      })
    ).toBe(true);
  });

  test('blocks cancellation on the Bucharest fulfillment date', () => {
    expect(
      canCancelOrder({
        fulfillmentDate: '2026-09-23T12:00:00.000Z',
        now: new Date('2026-09-22T21:00:00.000Z'),
        status: 'processing'
      })
    ).toBe(false);
  });

  test('blocks cancellation after processing', () => {
    expect(
      canCancelOrder({
        fulfillmentDate: '2026-09-30T12:00:00.000Z',
        now: new Date('2026-09-21T10:00:00.000Z'),
        status: 'completed'
      })
    ).toBe(false);
  });
});

describe('order activity history', () => {
  test('records order placement', () => {
    const result = recordOrderActivity({
      context: {},
      data: { status: 'processing' },
      operation: 'create',
      req: {}
    });

    expect(result.activity).toHaveLength(1);
    expect(result.activity[0]).toMatchObject({
      source: 'system',
      toStatus: 'processing',
      type: 'order_placed'
    });
  });

  test('records a customer cancellation request', () => {
    const result = recordOrderActivity({
      context: { orderActivitySource: 'customer' },
      data: { status: 'cancelled' },
      operation: 'update',
      originalDoc: {
        activity: [],
        createdAt: '2026-09-20T10:00:00.000Z',
        status: 'processing'
      },
      req: { user: { id: 4, role: 'customer' } }
    });

    expect(result.activity.at(-1)).toMatchObject({
      fromStatus: 'processing',
      source: 'customer',
      toStatus: 'cancelled',
      type: 'cancellation_requested'
    });
  });

  test('emails the current account address after a status change', async () => {
    const messages = [];
    const doc = {
      amount: 12500,
      createdAt: '2026-09-20T10:00:00.000Z',
      customer: 4,
      customerEmail: 'checkout@example.com',
      fulfillmentMethod: 'delivery',
      id: 42,
      status: 'completed'
    };
    const result = await emailOrderStatusChange({
      doc,
      operation: 'update',
      previousDoc: { ...doc, status: 'processing' },
      req: {
        payload: {
          findByID: async () => ({ email: 'account@example.com' }),
          findGlobal: async () => ({
            orderDelivered: {
              subject: 'Livrată #{{orderID}}',
              body: '<p>Salut {{customerEmail}}</p><p>{{total}} {{currency}}</p>'
            }
          }),
          logger: { error: () => undefined },
          sendEmail: async (message) => messages.push(message)
        }
      }
    });

    expect(result).toBe(doc);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      subject: 'Livrată #42',
      to: 'account@example.com'
    });
    expect(messages[0].html).toContain('Salut account@example.com');
    expect(messages[0].html).toContain('125.00 RON');
  });

  test('does not email when the status did not change', async () => {
    let sent = false;
    const doc = { id: 42, status: 'processing' };

    await emailOrderStatusChange({
      doc,
      operation: 'update',
      previousDoc: doc,
      req: {
        payload: {
          sendEmail: async () => {
            sent = true;
          }
        }
      }
    });

    expect(sent).toBe(false);
  });

  test('sends the placed-order template when payment creates an order', async () => {
    const messages = [];
    let invoice = null;
    await emailOrderStatusChange({
      doc: {
        amount: 5000,
        checkoutSnapshot: {
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
          deliveryFee: 0,
          deliveryVAT: 0,
          fulfillmentDate: '2026-09-22T12:00:00.000Z',
          fulfillmentMethod: 'pickup',
          grandTotal: 5000,
          lines: [
            { name: 'Box de legume', product: 7, quantity: 1, unitPrice: 5000 }
          ],
          productSubtotal: 5000,
          productVAT: 495,
          vatRates: { delivery: 21, products: 11 }
        },
        createdAt: '2026-09-20T10:00:00.000Z',
        currency: 'RON',
        customerEmail: 'buyer@example.com',
        id: 43,
        items: [{ product: 7, quantity: 1 }],
        status: 'processing'
      },
      operation: 'create',
      req: {
        payload: {
          create: async ({ data }) => {
            invoice = { id: 17, ...data };
            return invoice;
          },
          find: async () => ({ docs: invoice ? [invoice] : [] }),
          findGlobal: async () => ({}),
          logger: { error: () => undefined },
          sendEmail: async (message) => messages.push(message)
        }
      }
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].subject).toBe('Comanda #43 a fost plasată');
    expect(messages[0].html).toContain('Box de legume');
    expect(messages[0].attachments[0].filename).toBe('Factura-17.pdf');
    expect(messages[0].attachments[0].content.subarray(0, 4).toString()).toBe(
      '%PDF'
    );
  });
});

test('fulfillment editor values preserve defaults and Monday week keys', () => {
  expect(getDefaultAllowedWeekdays({}, ['2', '5'])).toEqual([2, 5]);
  expect(
    getDefaultAllowedWeekdays({ tuesday: false, saturday: true }, ['2', '5'])
  ).toEqual([6]);
  expect(
    normalizeWeekOverrides([
      { weekStart: '2026-09-28T12:00:00.000Z', allowedWeekdays: ['2', 5] }
    ])
  ).toEqual([{ weekStart: '2026-09-28', allowedWeekdays: [2, 5] }]);
});

test('email placeholders escape customer values but preserve generated item HTML', () => {
  expect(
    renderOrderTemplate(
      '<p>{{customerEmail}}</p>{{itemsTable}}',
      {
        customerEmail: '<bad@example.com>',
        itemsTable: '<table><tr><td>Safe</td></tr></table>'
      },
      true
    )
  ).toBe('<p>&lt;bad@example.com&gt;</p><table><tr><td>Safe</td></tr></table>');
});
