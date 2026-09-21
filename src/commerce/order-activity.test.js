import { describe, expect, test } from 'bun:test';

import { canCancelOrder } from './order-activity';
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
      customer: 4,
      customerEmail: 'checkout@example.com',
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
          logger: { error: () => undefined },
          sendEmail: async (message) => messages.push(message)
        }
      }
    });

    expect(result).toBe(doc);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      subject: 'Comanda ta a fost finalizată (#42)',
      to: 'account@example.com'
    });
    expect(messages[0].html).toContain('/account/orders/42');
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
});
