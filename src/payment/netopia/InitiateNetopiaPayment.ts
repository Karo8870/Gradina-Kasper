import { randomUUID } from 'crypto';

import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types';
import { getNextDeliveryDate } from '@/lib/boxHelpers';
import {
  isRomanianAddress,
  type MapboxAddressFields
} from '@/lib/addressValidation';
import { getDeliveryPickupConfig } from '@/lib/deliveryPickupConfig';
import { netopiaConfig } from '@/payment/netopia/creds';

type StoredAddress = MapboxAddressFields & {
  firstName?: string | null;
  lastName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  country?: string | number | null;
};

const getClientIP = (req: { headers: Headers }) => {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip') || '127.0.0.1';
};

const getID = (value: unknown): string | number | undefined => {
  if (!value) return undefined;
  if (typeof value === 'object' && 'id' in value) {
    return value.id as string | number;
  }
  return value as string | number;
};

const getUnitPrice = (item: any, currency: string) => {
  if (item.variant && typeof item.variant === 'object') {
    return Number(
      currency === 'EUR' ? item.variant.priceInEUR : item.variant.priceInRON
    );
  }

  if (item.product && typeof item.product === 'object') {
    const product = item.product;
    return Number(
      product.hasDiscount && product.discountedPrice
        ? product.discountedPrice
        : product.price
    );
  }

  return 0;
};

const getItemName = (item: any) => {
  const product = item.product;

  if (product && typeof product === 'object') {
    return product.name || `Produs ${product.id}`;
  }

  return `Produs ${product || item.id || ''}`.trim();
};

const copyCartItemsForTransaction = (items: any[] | null | undefined) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const { id: _id, product: _product, variant: _variant, ...rest } = item;
    const productID = getID(item.product);

    return {
      ...rest,
      product: productID,
      quantity: item.quantity
    };
  });
};

const toJSONAddress = (address: unknown) =>
  address ? (address as Record<string, unknown>) : null;

const toNetopiaAddress = ({
  address,
  email
}: {
  address: StoredAddress;
  email: string;
}) => {
  console.log(address, 777);

  return {
    email,
    phone: address.phone || '',
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    city: address.city || '',
    country: 642,
    state: address.state || address.city || '',
    postalCode: address.postalCode || '',
    details: [address.addressLine1, address.addressLine2]
      .filter(Boolean)
      .join(', ')
  };
};

const normalizeAction = (response: any) => {
  console.log(response, 555);

  if (response?.payment.paymentURL) {
    return {
      type: 'redirect',
      url: response?.payment.paymentURL
    };
  }

  if (response?.error) {
    return {
      type: 'error',
      message: response.error.message || 'Netopia payment failed.'
    };
  }

  return {
    type: 'pending'
  };
};

export const initiateNetopiaPayment: NonNullable<PaymentAdapter>['initiatePayment'] =
  async ({ data, req, transactionsSlug }) => {
    const payload = req.payload;
    const currency = data.currency;
    const cart = data.cart;
    const billingAddress = data.billingAddress;
    const shippingAddress = data.shippingAddress;
    const customerEmail = data.customerEmail;
    const isDelivery = Boolean(shippingAddress);

    try {
      if (currency !== 'RON') {
        return {
          message: 'Netopia supports RON payments only.',
          action: {
            type: 'error',
            message: 'Plata cu cardul este disponibilă doar în RON.'
          }
        };
      }

      const checkoutSettings = await payload.findGlobal({
        slug: 'checkout-settings'
      });
      const configuredDeliveryFee = Number(checkoutSettings.deliveryPrice);
      const minimumDeliveryOrderAmount = Number(
        checkoutSettings.minimumDeliveryOrderAmount
      );
      const deliveryFee = isDelivery ? configuredDeliveryFee : 0;

      if (isDelivery && !isRomanianAddress(shippingAddress)) {
        return {
          message: 'Delivery address is not in Romania.',
          action: {
            type: 'error',
            message: 'Pentru livrare, adresa trebuie să fie în România.'
          }
        };
      }

      if (isNaN(configuredDeliveryFee) || isNaN(minimumDeliveryOrderAmount)) {
        return {
          message: 'Checkout settings are not configured.',
          action: {
            type: 'error',
            message: 'Setările de checkout nu sunt configurate corect.'
          }
        };
      }

      const cartSubtotal = Number(cart.subtotal);

      if (isDelivery && cartSubtotal < minimumDeliveryOrderAmount) {
        return {
          message: 'Delivery minimum order amount not met.',
          action: {
            type: 'error',
            message: `Comandă minimă pentru livrare: ${minimumDeliveryOrderAmount.toFixed(2)} RON`
          }
        };
      }

      const amount = cartSubtotal + deliveryFee;
      const shouldBeDeliveredOn = getNextDeliveryDate(
        await getDeliveryPickupConfig(payload)
      ).toISOString();

      if (isNaN(amount)) {
        return {
          message: "Couldn't calculate subtotal.",
          action: {
            type: 'error',
            message: "Couldn't calculate subtotal."
          }
        };
      }

      const providerOrderID = `NTP-${cart.id}-${randomUUID()}`;

      const transaction = await payload.create({
        collection: 'transactions',
        data: {
          ...(req.user
            ? {
                customer: req.user.id
              }
            : {
                customerEmail
              }),
          amount,
          billingAddress,
          cart: cart.id,
          currency,
          items: copyCartItemsForTransaction(cart.items),
          netopia: {
            fulfillmentMethod: isDelivery ? 'delivery' : 'pickup',
            shippingAddress: isDelivery ? toJSONAddress(shippingAddress) : null,
            shouldBeDeliveredOn
          },
          paymentMethod: 'netopia',
          status: 'pending'
        },
        req
      });

      const requestBody = {
        config: {
          emailTemplate: 'confirm',
          notifyUrl: process.env.NETOPIA_NOTIFY_URL,
          redirectUrl: process.env.NETOPIA_REDIRECT_URL,
          language: 'ro'
        },
        payment: {
          options: {
            installments: 1,
            bonus: 0
          },
          instrument: {
            type: 'card'
          },
          data: {
            BROWSER_USER_AGENT: req.headers.get('user-agent') || '',
            IP_ADDRESS: getClientIP(req)
          }
        },
        order: {
          ntpID: '',
          posSignature: netopiaConfig.NETOPIA_POS_SIGNATURE,
          dateTime: new Date().toISOString(),
          description: `Comanda #${cart.id}`,
          orderID: providerOrderID,
          amount,
          currency,
          billing: toNetopiaAddress({
            address: billingAddress,
            email: customerEmail
          }),
          shipping: shippingAddress
            ? toNetopiaAddress({
                address: shippingAddress,
                email: customerEmail
              })
            : undefined,
          products: [
            ...(cart.items || []).map((item: any) => ({
              name: getItemName(item),
              code: String(
                getID(item.variant) || getID(item.product) || item.id
              ),
              category: 'Produse',
              price: getUnitPrice(item, currency),
              vat: 21
            })),
            ...(deliveryFee > 0
              ? [
                  {
                    name: 'Taxa de livrare',
                    code: 'DELIVERY',
                    category: 'Livrare',
                    price: deliveryFee,
                    vat: 21
                  }
                ]
              : [])
          ],
          installments: {
            selected: 1,
            available: [0]
          },
          data: {
            transactionID: String(transaction.id)
          }
        }
      };

      console.log(requestBody);

      const response = await fetch(
        `${netopiaConfig.NETOPIA_BASE_URL}/payment/card/start`,
        {
          method: 'POST',
          headers: {
            Authorization: netopiaConfig.NETOPIA_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const responseData = await response.json();

      await payload.update({
        id: transaction.id,
        collection: 'transactions',
        data: {
          netopia: {
            fulfillmentMethod: isDelivery ? 'delivery' : 'pickup',
            ntpID: responseData?.payment.ntpID,
            shippingAddress: isDelivery ? toJSONAddress(shippingAddress) : null,
            shouldBeDeliveredOn,
            tempOrderID: providerOrderID
          }
        },
        req
      });

      console.log('returning', {
        message: 'Payment initiated successfully',
        action: responseData,
        transactionID: transaction.id
      });

      return {
        message: 'Payment initiated successfully',
        action: normalizeAction(responseData),
        transactionID: transaction.id
      };
    } catch (error) {
      console.log(error, 'Error initiating payment with Netopia');

      return {
        message: 'Error initiating Netopia payment.',
        action: {
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'A aparut o eroare la initierea platii.'
        }
      };
    }
  };
