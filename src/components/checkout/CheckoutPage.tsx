'use client';

import { Message } from '@/components/Message';
import { Price } from '@/components/Price';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/Auth';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import {
  useAddresses,
  useCart,
  usePayments
} from '@payloadcms/plugin-ecommerce/client/react';
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses';
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal';
import { Address, CheckoutSetting } from '@/payload-types';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressItem } from '@/components/addresses/AddressItem';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getNextDeliveryDate } from '@/lib/boxHelpers';
import { formatDateTime } from '@/utilities/formatDateTime';
import RenderImage from '@/components/RenderImage';
import Section from '@/components/Section';
import { cn } from '@/utilities/cn';
import { isRomanianAddress } from '@/lib/addressValidation';
import { DeliveryPickupConfig } from '@/lib/deliveryPickupConfig';

type Props = {
  checkoutSettings: CheckoutSetting;
  deliveryPickupConfig?: DeliveryPickupConfig | null;
};

type NetopiaAction =
  | {
      type: 'redirect';
      url: string;
    }
  | {
      type: 'submit_form';
      url: string;
      fields: Record<string, string>;
    }
  | {
      type: 'pending';
    }
  | {
      type: 'error';
      message: string;
    };

const submitPostForm = (url: string, fields: Record<string, string>) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

const roundToCents = (amount: number) => Math.round(amount * 100) / 100;

export const CheckoutPage: React.FC<Props> = ({
  checkoutSettings,
  deliveryPickupConfig
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const { cart } = useCart();
  const [error, setError] = useState<null | string>(null);
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('');
  const [emailEditable, setEmailEditable] = useState(true);
  const { initiatePayment } = usePayments();
  const { addresses } = useAddresses();
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>();
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>();
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] =
    useState(true);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    'delivery' | 'pickup'
  >('delivery');
  const [isProcessingPayment, setProcessingPayment] = useState(false);

  const cartIsEmpty = !cart || !cart.items || !cart.items.length;
  const deliveryFeeLabel = 'Taxă de livrare';
  const deliveryFeeAmount = Number(checkoutSettings.deliveryPrice);
  const deliveryFeeValue =
    fulfillmentMethod === 'delivery' ? deliveryFeeAmount : 0;
  const cartSubtotal = Number(cart?.subtotal || 0);
  const payableTotal = cartSubtotal + deliveryFeeValue;
  const minimumDeliveryOrderAmount = Number(
    checkoutSettings.minimumDeliveryOrderAmount
  );
  const deliveryMinimumNotMet =
    fulfillmentMethod === 'delivery' &&
    cartSubtotal < minimumDeliveryOrderAmount;
  const productsSubtotalWithoutTVA = roundToCents(cartSubtotal / 1.11);
  const productsTVA = roundToCents(
    Math.max(0, cartSubtotal - productsSubtotalWithoutTVA)
  );
  const deliverySubtotalWithoutTVA = roundToCents(deliveryFeeValue / 1.21);
  const deliveryTVA = roundToCents(
    Math.max(0, deliveryFeeValue - deliverySubtotalWithoutTVA)
  );
  const subtotalWithoutTVA = roundToCents(
    productsSubtotalWithoutTVA + deliverySubtotalWithoutTVA
  );
  const nextDeliveryDate = getNextDeliveryDate(deliveryPickupConfig);
  const selectedDeliveryAddress = billingAddressSameAsShipping
    ? billingAddress
    : shippingAddress;
  const deliveryAddressIsValid =
    fulfillmentMethod !== 'delivery' ||
    isRomanianAddress(selectedDeliveryAddress);

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Trebuie să fiți autentificat pentru a putea plasa o comandă')}`
    );
  }

  const canGoToPayment = Boolean(
    (email || user) &&
    billingAddress &&
    (fulfillmentMethod === 'pickup' ||
      ((billingAddressSameAsShipping || shippingAddress) &&
        deliveryAddressIsValid))
  );

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0];
        if (defaultAddress) {
          setBillingAddress(defaultAddress);
        }
      }
    }
  }, [addresses]);

  useEffect(() => {
    return () => {
      setShippingAddress(undefined);
      setBillingAddress(undefined);
      setBillingAddressSameAsShipping(true);
      setEmail('');
      setEmailEditable(true);
    };
  }, []);

  const initiatePaymentIntent = useCallback(async () => {
    setError(null);
    setProcessingPayment(true);

    try {
      const paymentData = (await initiatePayment('netopia', {
        additionalData: {
          ...(email ? { customerEmail: email } : {}),
          billingAddress,
          shippingAddress:
            fulfillmentMethod === 'delivery'
              ? billingAddressSameAsShipping
                ? billingAddress
                : shippingAddress
              : undefined
        }
      })) as Record<string, unknown>;

      const action = paymentData.action as NetopiaAction | undefined;

      if (action?.type === 'redirect') {
        window.location.assign(action.url);
        return;
      }

      if (action?.type === 'submit_form') {
        submitPostForm(action.url, action.fields);
        return;
      }

      if (action?.type === 'error') {
        setError(action.message);
        toast.error(action.message);
        setProcessingPayment(false);
        return;
      }

      const transactionID = paymentData.transactionID;
      if (transactionID) {
        router.push(`/checkout/confirm-order?transactionID=${transactionID}`);
        return;
      }

      router.push('/checkout/confirm-order');
    } catch (error) {
      console.log(error, 666);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'A apărut o eroare la inițierea plății.';

      setError(errorMessage);
      toast.error(errorMessage);
      setProcessingPayment(false);
    }
  }, [
    billingAddress,
    billingAddressSameAsShipping,
    email,
    fulfillmentMethod,
    initiatePayment,
    router,
    shippingAddress
  ]);

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className='prose dark:prose-invert flex w-full items-center justify-center py-12'>
        <div className='mb-8 max-w-none self-center text-center'>
          <p>Procesăm plata...</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (cartIsEmpty) {
    return (
      <div className='prose dark:prose-invert flex w-full flex-col items-center py-12'>
        <p>Coșul tău este gol.</p>
        <Link href='/search'>Continuă cumpărăturile</Link>
      </div>
    );
  }

  return (
    <div className='my-8 flex grow flex-col items-stretch justify-stretch gap-10 md:flex-row md:gap-6 lg:gap-8'>
      <div className='flex basis-full flex-col justify-stretch lg:basis-2/3'>
        <div className='bg-secondary-50 rounded-lg p-4'>
          <p>{user.email}</p>{' '}
          <p>
            Nu ești tu?{' '}
            <Link className='underline' href='/logout'>
              Deconectează-te
            </Link>
          </p>
        </div>

        <Section
          className='!px-0 pb-0 pt-8'
          title='Adresă'
          description={checkoutSettings.addressDescription}
        >
          <></>
        </Section>

        <div className='bg-white'>
          <h3 className='text-primary-900 mb-3 text-base font-semibold'>
            Modalitate de primire
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Button
              type='button'
              className={
                fulfillmentMethod === 'delivery'
                  ? 'bg-primary-900 hover:bg-primary-800 shadow-none h-11 self-start rounded-full px-6 text-white'
                  : 'bg-white border-black border-[1px] text-black shadow-none hover:bg-neutral-100 h-11 rounded-full px-6'
              }
              disabled={isProcessingPayment}
              onClick={(e) => {
                e.preventDefault();
                setFulfillmentMethod('delivery');
              }}
            >
              Livrare
            </Button>
            <Button
              type='button'
              className={cn(
                'h-10 rounded-full px-5',
                fulfillmentMethod === 'pickup'
                  ? 'bg-primary-900 hover:bg-primary-800 shadow-none h-11 self-start rounded-full px-6 text-white'
                  : 'bg-white border-black border-[1px] hover:bg-neutral-100 text-black shadow-none h-11 rounded-full px-6'
              )}
              disabled={isProcessingPayment}
              onClick={(e) => {
                e.preventDefault();
                setFulfillmentMethod('pickup');
              }}
            >
              Ridicare personală
            </Button>
          </div>

          {fulfillmentMethod === 'delivery' && deliveryFeeAmount > 0 && (
            <div className='mt-4 rounded-xl bg-secondary-50 p-3 text-sm text-primary-900'>
              <p className='font-medium'>
                {deliveryFeeLabel}:{' '}
                <Price
                  amount={deliveryFeeAmount}
                  currencyCode='RON'
                  as='span'
                />
              </p>
              <p className='mt-1'>
                Costul livrării este adăugat la totalul comenzii.
              </p>
            </div>
          )}

          <p className='mt-4 leading-relaxed mb-4'>
            <span className='text-primary-900 font-semibold'>
              {fulfillmentMethod === 'pickup'
                ? 'Comanda va putea fi ridicată în data de:'
                : 'Comanda va fi livrată în data de:'}
            </span>{' '}
            <span className='font-medium text-neutral-500'>
              {formatDateTime({ date: nextDeliveryDate })}
            </span>
          </p>

          {fulfillmentMethod === 'pickup' && (
            <p className='my-4'>
              Puteți găsi mai multe informații despre ridicarea personală{' '}
              <Link className='underline' href='/pickup-point'>
                aici
              </Link>
              .
            </p>
          )}
        </div>

        {billingAddress ? (
          <div className='rounded-2xl border mb-4 border-neutral-200 bg-white p-5'>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  className='bg-primary-900 hover:bg-primary-800 shadow-none h-11 self-start rounded-full px-6 text-white'
                  disabled={isProcessingPayment}
                  onClick={(e) => {
                    e.preventDefault();
                    setBillingAddress(undefined);
                  }}
                >
                  Elimină
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses
            heading='Adresa de facturare'
            description='Selectează sau adaugă adresa de facturare.'
            setAddress={setBillingAddress}
          />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address);
            }}
            skipSubmission={true}
          />
        )}

        {fulfillmentMethod === 'delivery' && (
          <div className='bg-secondary-50 flex items-center gap-3 mb-4 rounded-2xl border border-neutral-200 p-4'>
            <Checkbox
              id='shippingTheSameAsBilling'
              checked={billingAddressSameAsShipping}
              disabled={Boolean(
                isProcessingPayment ||
                (!user && (!email || Boolean(emailEditable)))
              )}
              onCheckedChange={(state) => {
                setBillingAddressSameAsShipping(state as boolean);
              }}
            />
            <Label
              className='text-sm text-neutral-700'
              htmlFor='shippingTheSameAsBilling'
            >
              Adresa de livrare este aceeași cu adresa de facturare
            </Label>
          </div>
        )}

        {fulfillmentMethod === 'delivery' &&
          selectedDeliveryAddress &&
          !deliveryAddressIsValid && (
            <div className='mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
              Pentru livrare, adresa trebuie să fie în România. Poți edita
              adresa sau alege o altă adresă de livrare.
            </div>
          )}

        {fulfillmentMethod === 'delivery' && !billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div className='rounded-2xl border  mb-4 border-neutral-200 bg-white p-5'>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      className='bg-primary-900 hover:bg-primary-800 shadow-none h-11 self-start rounded-full px-6 text-white'
                      disabled={isProcessingPayment}
                      onClick={(e) => {
                        e.preventDefault();
                        setShippingAddress(undefined);
                      }}
                    >
                      Elimină
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading='Adresa de livrare'
                description='Selectează sau adaugă adresa de livrare din România.'
                requireRomanian
                setAddress={setShippingAddress}
              />
            ) : (
              <div className='rounded-2xl border border-neutral-200 bg-white p-5'>
                <CreateAddressModal
                  callback={(address) => {
                    setShippingAddress(address);
                  }}
                  disabled={!email || Boolean(emailEditable)}
                  skipSubmission={true}
                />
              </div>
            )}
          </>
        )}

        <div className='self-start'>
          <Button
            className='bg-primary-900 hover:bg-primary-800 h-11 rounded-full px-6 text-white disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:opacity-100 disabled:hover:bg-neutral-300'
            disabled={
              !canGoToPayment || isProcessingPayment || deliveryMinimumNotMet
            }
            onClick={(e) => {
              e.preventDefault();
              void initiatePaymentIntent();
            }}
          >
            {isProcessingPayment ? 'Se procesează...' : 'Plătește cu cardul'}
          </Button>

          {deliveryMinimumNotMet && (
            <p className='mt-2 text-sm text-red-700/70'>
              *Comandă minimă pentru livrare:{' '}
              {minimumDeliveryOrderAmount.toFixed(2)} RON
            </p>
          )}
        </div>

        {error && (
          <div className='my-8 rounded-2xl border border-red-200 bg-red-50 p-5'>
            <Message error={error} />

            <Button
              className='mt-4 h-10 rounded-full px-5'
              onClick={(e) => {
                e.preventDefault();
                router.refresh();
              }}
              variant='default'
            >
              Încearcă din nou
            </Button>
          </div>
        )}
      </div>

      {!cartIsEmpty && (
        <aside className='bg-secondary-50 flex h-fit basis-full flex-col gap-5 rounded-2xl border border-neutral-200 p-6 lg:sticky lg:top-24 lg:basis-1/3'>
          <h2 className='text-primary-900 text-2xl font-semibold'>Coșul tău</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const {
                product,
                product: { name, gallery },
                quantity
              } = item;

              if (!quantity) return null;

              const image = gallery?.[0]?.image;
              let price =
                product?.hasDiscount && product?.discountedPrice
                  ? Number(product.discountedPrice)
                  : Number(product.price);

              return (
                <div
                  className='flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3'
                  key={index}
                >
                  <div className='flex h-16 w-16 shrink-0 items-stretch justify-stretch rounded-lg border'>
                    <RenderImage
                      alt={name}
                      className='rounded-lg object-cover'
                      fallbackSrc='/no-image.png'
                      src={image}
                    />
                  </div>
                  <div className='flex grow items-center justify-between gap-3'>
                    <div className='flex flex-col gap-1'>
                      <p className='text-primary-900 text-lg font-semibold'>
                        {name}
                      </p>
                      <div>x {quantity}</div>
                    </div>

                    {
                      <Price
                        amount={price}
                        className='text-primary-900 text-sm font-semibold'
                        currencyCode={cart?.currency || 'RON'}
                      />
                    }
                  </div>
                </div>
              );
            }
            return null;
          })}
          <hr className='border-neutral-200' />
          <div className='flex items-center justify-between gap-2 text-sm text-neutral-700'>
            <span>Subtotal</span>
            <Price amount={cartSubtotal} currencyCode='RON' as='span' />
          </div>
          <div className='flex items-center justify-between gap-2 text-sm text-neutral-700'>
            <span>
              {deliveryFeeLabel}
              {fulfillmentMethod === 'pickup' ? ' (ridicare personală)' : ''}
            </span>
            <Price amount={deliveryFeeValue} currencyCode='RON' as='span' />
          </div>
          <div className='flex items-center justify-between gap-2 text-sm text-neutral-700'>
            <span>Subtotal fără TVA</span>
            <Price amount={subtotalWithoutTVA} currencyCode='RON' as='span' />
          </div>
          <div className='flex items-center justify-between gap-2 text-sm text-neutral-700'>
            <span>TVA produse (11%)</span>
            <Price amount={productsTVA} currencyCode='RON' as='span' />
          </div>
          {fulfillmentMethod === 'delivery' ? (
            <div className='flex items-center justify-between gap-2 text-sm text-neutral-700'>
              <span>TVA transport (21%)</span>
              <Price amount={deliveryTVA} currencyCode='RON' as='span' />
            </div>
          ) : null}
          <p className='text-xs text-neutral-600'>
            Subtotal fără TVA + TVA = Total
          </p>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-sm font-medium uppercase text-neutral-700'>
              Total
            </span>
            <Price
              className='text-primary-900 text-2xl font-bold'
              amount={payableTotal}
              currencyCode='RON'
            />
          </div>
        </aside>
      )}
    </div>
  );
};
