'use client';

import {
  useCart,
  useCurrency,
  usePayments
} from '@payloadcms/plugin-ecommerce/client/react';
import { AlertCircle, CreditCard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { AddressDTO } from '@/actions/addresses';
import { isValidBillingAddress } from '@/commerce/addresses/billing';
import { isRomanianDeliveryAddress } from '@/commerce/addresses/delivery';
import {
  calculateCheckout,
  type CheckoutSettingsDTO,
  type FulfillmentMethod
} from '@/commerce/checkout';
import { getProductAvailability } from '@/commerce/products';
import { CheckoutAddressSelector } from '@/components/checkout/checkout-address-selector';
import { RenderMedia } from '@/components/render-media';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Cart, Media } from '@/payload-types';

type CartItem = NonNullable<Cart['items']>[number];
type InvalidCartItem = {
  available?: number;
  name: string;
  reason: 'inventory' | 'unavailable';
};

function getProduct(item: CartItem) {
  return typeof item.product === 'object' && item.product ? item.product : null;
}

function formatFulfillmentDate(value: string | null) {
  if (!value) return 'Program indisponibil';

  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'long',
    timeZone: 'Europe/Bucharest'
  }).format(new Date(value));
}

function paymentErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Plata nu a putut fi inițiată. Încearcă din nou.';
  }

  try {
    const response = JSON.parse(error.message) as { message?: unknown };
    if (typeof response.message === 'string') return response.message;
  } catch {
    // Provider errors are intentionally replaced with a generic message.
  }

  return 'Plata nu a putut fi inițiată. Încearcă din nou.';
}

export function CheckoutPage({
  fulfillmentDate,
  initialAddresses,
  mapboxEnabled,
  settings
}: {
  fulfillmentDate: string | null;
  initialAddresses: AddressDTO[];
  mapboxEnabled: boolean;
  settings: CheckoutSettingsDTO;
}) {
  const cartState = useCart();
  const cart = cartState.cart as Cart | undefined;
  const { formatCurrency } = useCurrency();
  const {
    initiatePayment,
    isLoading: paymentIsLoading,
    paymentMethods
  } = usePayments();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [billingAddress, setBillingAddress] = useState<AddressDTO | undefined>(
    initialAddresses[0]
  );
  const [shippingAddress, setShippingAddress] = useState<
    AddressDTO | undefined
  >();
  const [sameAddress, setSameAddress] = useState(true);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>('delivery');
  const [status, setStatus] = useState<string | null>(null);
  const items = cart?.items ?? [];
  const productSubtotal = cart?.subtotal ?? 0;
  const selectedShippingAddress = sameAddress
    ? billingAddress
    : shippingAddress;
  const billingAddressIsValid = isValidBillingAddress(billingAddress);
  const deliveryAddressIsValid =
    fulfillmentMethod === 'pickup' ||
    isRomanianDeliveryAddress(selectedShippingAddress);

  const productLineTotals = useMemo(
    () =>
      items.map((item) => {
        const product = getProduct(item);
        return (product?.priceInRON ?? 0) * item.quantity;
      }),
    [items]
  );
  const totals = calculateCheckout({
    fulfillmentMethod,
    productLineTotals,
    productSubtotal,
    settings
  });
  const invalidItems = items.flatMap<InvalidCartItem>((item) => {
    const product = getProduct(item);
    if (!product)
      return [{ name: 'Produs indisponibil', reason: 'unavailable' as const }];

    const availability = getProductAvailability(product);
    const inventoryShortage =
      typeof product.inventory !== 'number' ||
      product.inventory < item.quantity;
    const validPrice =
      typeof product.priceInRON === 'number' && product.priceInRON > 0;

    if (inventoryShortage) {
      return [
        {
          name: product.name,
          reason: 'inventory' as const,
          available: Math.max(0, product.inventory ?? 0)
        }
      ];
    }

    return availability.purchasable && validPrice
      ? []
      : [{ name: product.name, reason: 'unavailable' as const }];
  });
  const paymentMethod = paymentMethods[0];
  const canPay = Boolean(
    billingAddressIsValid &&
    deliveryAddressIsValid &&
    totals.deliveryMinimumMet &&
    fulfillmentDate &&
    !invalidItems.length &&
    paymentMethod
  );

  function addAddress(address: AddressDTO) {
    setAddresses((current) => [
      address,
      ...current.filter((item) => item.id !== address.id)
    ]);
  }

  async function proceedToPayment() {
    if (!canPay || !paymentMethod || !billingAddress) return;

    setStatus(null);

    try {
      const response = (await initiatePayment(paymentMethod.name, {
        additionalData: {
          billingAddress,
          fulfillmentDate,
          fulfillmentMethod,
          shippingAddress:
            fulfillmentMethod === 'delivery'
              ? selectedShippingAddress
              : undefined
        }
      })) as {
        action?: {
          fields?: Record<string, string>;
          message?: string;
          type?: string;
          url?: string;
        };
        transactionID?: string | number;
      };

      if (response.action?.type === 'redirect' && response.action.url) {
        window.location.assign(response.action.url);
        return;
      }

      if (
        response.action?.type === 'submit_form' &&
        response.action.url &&
        response.action.fields
      ) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.action.url;

        for (const [name, value] of Object.entries(response.action.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (response.action?.message) {
        setStatus(response.action.message);
        return;
      }

      setStatus('Plata nu a putut fi inițiată. Încearcă din nou.');
    } catch (error) {
      setStatus(paymentErrorMessage(error));
    }
  }

  if (!cart) {
    return (
      <div className='text-muted-foreground py-20 text-center'>
        Se încarcă coșul…
      </div>
    );
  }

  if (!items.length) {
    return (
      <Card className='mx-auto max-w-xl text-center'>
        <CardHeader>
          <div className='bg-muted mx-auto flex size-14 items-center justify-center rounded-full'>
            <ShoppingCart className='size-6' />
          </div>
          <CardTitle>Coșul tău este gol</CardTitle>
          <CardDescription>
            Adaugă produse în coș înainte de a continua către checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href='/products' />}>
            Vezi produsele
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]'>
      <div className='flex flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Modalitate de primire</CardTitle>
            <CardDescription>
              Alege livrarea la adresă sau ridicarea personală.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-3'>
              <Button
                onClick={() => setFulfillmentMethod('delivery')}
                size='lg'
                variant={
                  fulfillmentMethod === 'delivery' ? 'default' : 'outline'
                }
              >
                Livrare
              </Button>
              <Button
                onClick={() => setFulfillmentMethod('pickup')}
                size='lg'
                variant={fulfillmentMethod === 'pickup' ? 'default' : 'outline'}
              >
                Ridicare personală
              </Button>
            </div>
            <div className='bg-muted/40 rounded-xl border p-4 text-sm'>
              <p className='font-medium'>
                {fulfillmentMethod === 'delivery'
                  ? 'Data livrării'
                  : 'Prima dată disponibilă pentru ridicare'}
              </p>
              <p className='text-muted-foreground mt-1 capitalize'>
                {formatFulfillmentDate(fulfillmentDate)}
              </p>
              {fulfillmentMethod === 'delivery' ? (
                <p className='text-muted-foreground mt-2'>
                  Taxa de livrare este{' '}
                  {formatCurrency(settings.deliveryFee, {
                    locale: 'ro-RO'
                  })}
                  .
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adrese</CardTitle>
            <CardDescription>
              Adresa de facturare poate fi internațională. Livrarea este
              disponibilă numai în România.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <CheckoutAddressSelector
              addresses={addresses}
              description='Adresa asociată plății și comenzii.'
              heading='Adresă de facturare'
              mapboxEnabled={mapboxEnabled}
              onAddressCreated={addAddress}
              onSelect={setBillingAddress}
              selectedAddress={billingAddress}
            />

            {billingAddress && !billingAddressIsValid ? (
              <Alert variant='destructive'>
                <AlertCircle />
                <AlertTitle>Adresa de facturare nu este completă</AlertTitle>
                <AlertDescription>
                  Selectează sau adaugă o adresă cu toate datele obligatorii.
                </AlertDescription>
              </Alert>
            ) : null}

            {fulfillmentMethod === 'delivery' ? (
              <>
                <Separator />
                <div className='flex items-center gap-3'>
                  <Checkbox
                    checked={sameAddress}
                    id='same-address'
                    onCheckedChange={(checked) =>
                      setSameAddress(Boolean(checked))
                    }
                  />
                  <Label htmlFor='same-address'>
                    Adresa de livrare este aceeași cu adresa de facturare
                  </Label>
                </div>

                {!sameAddress ? (
                  <CheckoutAddressSelector
                    addresses={addresses}
                    description='Selectează o adresă din România cu un cod poștal de 6 cifre.'
                    heading='Adresă de livrare'
                    mapboxEnabled={mapboxEnabled}
                    onAddressCreated={addAddress}
                    onSelect={setShippingAddress}
                    requireRomanian
                    selectedAddress={shippingAddress}
                  />
                ) : null}

                {selectedShippingAddress && !deliveryAddressIsValid ? (
                  <Alert variant='destructive'>
                    <AlertCircle />
                    <AlertTitle>Adresa de livrare nu este validă</AlertTitle>
                    <AlertDescription>
                      Livrarea necesită o adresă din România și un cod poștal
                      format din 6 cifre.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>

        {invalidItems.length ? (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertTitle>Coșul conține produse indisponibile</AlertTitle>
            <AlertDescription>
              Cantitatea din coș poate fi mai mare decât stocul disponibil în
              acest moment. Redu cantitatea sau elimină din coș:{' '}
              {invalidItems
                .map((item) =>
                  item.reason === 'inventory'
                    ? `${item.name} (disponibile: ${item.available})`
                    : item.name
                )
                .join(', ')}
              .
            </AlertDescription>
          </Alert>
        ) : null}

        {!totals.deliveryMinimumMet ? (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertTitle>
              Valoarea minimă pentru livrare nu este atinsă
            </AlertTitle>
            <AlertDescription>
              Subtotalul produselor trebuie să fie de cel puțin{' '}
              {formatCurrency(settings.minimumDeliverySubtotal, {
                locale: 'ro-RO'
              })}
              . Ridicarea personală nu are o valoare minimă.
            </AlertDescription>
          </Alert>
        ) : null}

        {status ? (
          <Alert variant='destructive'>
            <AlertCircle />
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}

        <div>
          <Button
            disabled={!canPay || paymentIsLoading}
            onClick={() => void proceedToPayment()}
            size='lg'
          >
            <CreditCard data-icon='inline-start' />
            {paymentIsLoading ? 'Se procesează…' : 'Plătește cu cardul'}
          </Button>
          {!paymentMethod ? (
            <p className='text-muted-foreground mt-2 text-sm'>
              Plata cu cardul va deveni disponibilă după configurarea Netopia.
            </p>
          ) : null}
        </div>
      </div>

      <Card className='lg:sticky lg:top-24'>
        <CardHeader>
          <CardTitle>Comanda ta</CardTitle>
          <CardDescription>Verifică produsele și totalul.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <ul className='flex flex-col gap-3'>
            {items.map((item, index) => {
              const product = getProduct(item);
              const image =
                product && typeof product.gallery?.[0]?.image === 'object'
                  ? (product.gallery[0].image as Media)
                  : null;
              const lineTotal = (product?.priceInRON ?? 0) * item.quantity;

              return (
                <li
                  className='bg-muted/30 flex gap-3 rounded-xl border p-3'
                  key={item.id ?? `${product?.id ?? 'item'}-${index}`}
                >
                  <div className='bg-muted size-14 shrink-0 overflow-hidden rounded-lg'>
                    <RenderMedia
                      alt={product?.name ?? 'Produs'}
                      className='size-full object-cover'
                      src={image}
                    />
                  </div>
                  <div className='flex min-w-0 flex-1 items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='truncate font-medium'>
                        {product?.name ?? 'Produs indisponibil'}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Cantitate: {item.quantity}
                      </p>
                    </div>
                    <p className='shrink-0 font-medium'>
                      {formatCurrency(lineTotal, { locale: 'ro-RO' })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Separator />
          <SummaryRow
            label='Subtotal produse'
            value={formatCurrency(productSubtotal, { locale: 'ro-RO' })}
          />
          <SummaryRow
            label={
              fulfillmentMethod === 'pickup'
                ? 'Ridicare personală'
                : 'Taxă de livrare'
            }
            value={formatCurrency(totals.deliveryFee, { locale: 'ro-RO' })}
          />
          <SummaryRow
            label='Subtotal fără TVA'
            value={formatCurrency(totals.subtotalWithoutVAT, {
              locale: 'ro-RO'
            })}
          />
          <SummaryRow
            label={`TVA produse (${settings.productVATRate}%)`}
            value={formatCurrency(totals.productVAT, { locale: 'ro-RO' })}
          />
          {fulfillmentMethod === 'delivery' ? (
            <SummaryRow
              label={`TVA livrare (${settings.deliveryVATRate}%)`}
              value={formatCurrency(totals.deliveryVAT, { locale: 'ro-RO' })}
            />
          ) : null}
          <p className='text-muted-foreground text-xs'>
            Prețurile includ TVA. TVA-ul este evidențiat, nu adăugat peste
            prețurile afișate.
          </p>
          <Separator />
          <SummaryRow
            emphasized
            label='Total'
            value={formatCurrency(totals.grandTotal, { locale: 'ro-RO' })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  emphasized = false,
  label,
  value
}: {
  emphasized?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        emphasized
          ? 'flex items-center justify-between gap-4 text-lg font-semibold'
          : 'text-muted-foreground flex items-center justify-between gap-4 text-sm'
      }
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
