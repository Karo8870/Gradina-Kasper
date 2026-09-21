import { describe, expect, test } from 'bun:test';

import {
  netopiaPaymentState,
  netopiaStartFailureMessage,
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

  test('treats redirect code 101 as an instruction when a payment URL exists', () => {
    const response = netopiaStartResponseSchema.parse({
      customerAction: {},
      error: { code: '101', message: 'Redirect user to payment page' },
      payment: {
        amount: 60,
        currency: 'RON',
        ntpID: '3028326',
        paymentURL:
          'https://secure-sandbox.netopia-payments.com/ui/card?p=example',
        status: 1
      }
    });

    expect(netopiaStartFailureMessage(response)).toBeNull();
  });

  test('still treats a rejected payment as a failure', () => {
    const response = netopiaStartResponseSchema.parse({
      error: { code: '12', message: 'Payment rejected' },
      payment: {
        amount: 60,
        currency: 'RON',
        ntpID: '3028326',
        status: 12
      }
    });

    expect(netopiaStartFailureMessage(response)).toBe('Payment rejected');
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
