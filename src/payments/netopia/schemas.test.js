import { describe, expect, test } from 'bun:test';

import {
  netopiaPaymentState,
  netopiaStartResponseSchema,
  netopiaStatusResponseSchema
} from './schemas';

describe('NETOPIA schemas', () => {
  test('maps documented payment statuses', () => {
    expect(netopiaPaymentState(3)).toBe('succeeded');
    expect(netopiaPaymentState(5)).toBe('succeeded');
    expect(netopiaPaymentState(12)).toBe('failed');
    expect(netopiaPaymentState(15)).toBe('pending');
  });

  test('accepts a valid payment start response', () => {
    expect(
      netopiaStartResponseSchema.parse({
        payment: {
          amount: 100,
          currency: 'RON',
          ntpID: '99003322',
          paymentURL: 'https://secure.sandbox.netopia-payments.com/pay/example',
          status: 15
        }
      }).payment?.ntpID
    ).toBe('99003322');
  });

  test('rejects malformed monetary status data', () => {
    expect(() =>
      netopiaStatusResponseSchema.parse({
        order: { amount: '100', currency: 'RON', orderID: 'order-1' },
        payment: {
          amount: 100,
          currency: 'RON',
          ntpID: '99003322',
          status: 5
        }
      })
    ).toThrow();
  });
});

