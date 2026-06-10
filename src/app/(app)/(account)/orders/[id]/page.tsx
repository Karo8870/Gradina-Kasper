import type { Order } from '@/payload-types';
import type { Metadata } from 'next';

import { Price } from '@/components/Price';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utilities/formatDateTime';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { headers as getHeaders } from 'next/headers.js';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { OrderStatus } from '@/components/OrderStatus';
import { AddressItem } from '@/components/addresses/AddressItem';
import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import { CancelOrderDialog } from './CancelOrderDialog';
import { RenderParams } from '@/components/RenderParams';
import { sendOrderEmail } from '@/lib/orderEmails';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    accessToken?: string;
    email?: string;
  }>;
};

const getID = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === 'object' && 'id' in value) {
    return value.id as string | number;
  }
  return value as string | number;
};

const hasAddressContent = (address: Order['shippingAddress']) => {
  if (!address) return false;

  return [
    address.title,
    address.firstName,
    address.lastName,
    address.phone,
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].some(Boolean);
};

const getBucharestDateKey = (date: string | Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Bucharest',
    year: 'numeric'
  }).formatToParts(new Date(date));

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || '';

  return Number(`${getPart('year')}${getPart('month')}${getPart('day')}`);
};

const canCancelOrder = (
  order: Pick<Order, 'shouldBeDeliveredOn' | 'status'>
) => {
  if (order.status !== 'processing' || !order.shouldBeDeliveredOn) return false;

  return (
    getBucharestDateKey(new Date()) <
    getBucharestDateKey(order.shouldBeDeliveredOn)
  );
};

const getOrderRedirectPath = ({
  accessToken,
  email,
  orderID,
  status
}: {
  accessToken?: string;
  email?: string;
  orderID: string;
  status?: {
    key: 'error' | 'success';
    value: string;
  };
}) => {
  const params = new URLSearchParams();

  if (email) params.set('email', email);
  if (accessToken) params.set('accessToken', accessToken);
  if (status) params.set(status.key, status.value);

  const queryString = params.toString();

  return `/orders/${orderID}${queryString ? `?${queryString}` : ''}`;
};

const restockOrderItems = async ({
  items,
  payload
}: {
  items: Order['items'];
  payload: Awaited<ReturnType<typeof getPayload>>;
}) => {
  if (!Array.isArray(items)) return;

  for (const item of items) {
    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) continue;

    const variantID = getID((item as any).variant);

    if (variantID) {
      await payload.db.updateOne({
        id: variantID,
        collection: 'variants' as any,
        data: {
          inventory: {
            $inc: quantity
          }
        }
      });

      continue;
    }

    const productID = getID(item.product);

    if (!productID) continue;

    await payload.db.updateOne({
      id: productID,
      collection: 'products' as any,
      data: {
        inventory: {
          $inc: quantity
        }
      }
    });
  }
};

async function cancelOrderAction(formData: FormData) {
  'use server';

  const orderID = String(formData.get('orderID') || '');
  const email = String(formData.get('email') || '');
  const accessToken = String(formData.get('accessToken') || '');

  if (!orderID) {
    redirect('/orders');
  }

  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });
  const redirectPath = (status: { key: 'error' | 'success'; value: string }) =>
    getOrderRedirectPath({
      accessToken,
      email,
      orderID,
      status
    });

  let order: Order | null = null;

  try {
    order = (await payload.findByID({
      id: orderID,
      collection: 'orders',
      depth: 0,
      overrideAccess: true,
      select: {
        accessToken: true,
        customer: true,
        customerEmail: true,
        items: true,
        shouldBeDeliveredOn: true,
        status: true
      }
    })) as Order;
  } catch (error) {
    redirect(
      redirectPath({
        key: 'error',
        value: 'Comanda nu a putut fi găsită.'
      })
    );
  }

  const customerID =
    order.customer && typeof order.customer === 'object'
      ? order.customer.id
      : order.customer;
  const canAccessAsUser = Boolean(user && customerID === user.id);
  const canAccessAsGuest = Boolean(
    !user &&
    accessToken &&
    email &&
    order.accessToken === accessToken &&
    order.customerEmail === email
  );

  if ((!canAccessAsUser && !canAccessAsGuest) || !canCancelOrder(order)) {
    redirect(
      redirectPath({
        key: 'error',
        value: 'Comanda nu mai poate fi anulată.'
      })
    );
  }

  try {
    await payload.update({
      id: orderID,
      collection: 'orders',
      data: {
        status: 'cancelled'
      },
      overrideAccess: true
    });

    await restockOrderItems({
      items: order.items,
      payload
    });

    await sendOrderEmail({
      orderID,
      payload,
      type: 'orderCancelled'
    });
  } catch (error) {
    redirect(
      redirectPath({
        key: 'error',
        value: 'Comanda nu a putut fi anulată.'
      })
    );
  }

  revalidatePath(`/orders/${orderID}`);
  redirect(
    redirectPath({
      key: 'success',
      value: 'Comanda a fost anulată.'
    })
  );
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  const { id } = await params;
  const { accessToken = '', email = '' } = await searchParams;

  let order: Order | null = null;

  try {
    const {
      docs: [orderResult]
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id
            }
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id
                  }
                }
              ]
            : [
                {
                  accessToken: {
                    equals: accessToken
                  }
                },
                ...(email
                  ? [
                      {
                        customerEmail: {
                          equals: email
                        }
                      }
                    ]
                  : [])
              ])
        ]
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        shouldBeDeliveredOn: true,
        updatedAt: true,
        accessToken: true,
        shippingAddress: true
      }
    });

    const canAccessAsGuest =
      !user &&
      email &&
      accessToken &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email;
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id;

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult;
    }
  } catch (error) {
    console.error(error);
  }

  if (!order) {
    notFound();
  }

  const canCancel = canCancelOrder(order);
  const isDeliveryOrder = hasAddressContent(order.shippingAddress);

  return (
    <>
      <section className='rounded-[2rem] bg-white p-6 shadow-[0_0_35px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-8'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          {user ? (
            <Button asChild variant='ghost'>
              <Link href='/orders'>
                <ChevronLeftIcon />
                Toate comenzile
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <div className='flex flex-wrap items-center justify-end gap-3'>
            {canCancel && (
              <CancelOrderDialog
                accessToken={accessToken}
                action={cancelOrderAction}
                email={email}
                orderID={String(order.id)}
              />
            )}

            <h1 className='rounded-full bg-secondary-100 px-3 py-1 text-sm font-mono uppercase tracking-[0.07em] text-primary-800'>
              {`Comanda #${order.id}`}
            </h1>
          </div>
        </div>

        <div className='flex flex-col gap-12 rounded-[1.5rem] bg-secondary-100 p-5 md:p-6'>
          <div className='flex flex-col gap-6 lg:flex-row lg:justify-between'>
            <div>
              <p className='mb-1 text-sm font-mono uppercase text-primary/50'>
                Data comenzii
              </p>
              <p className='text-lg'>
                <time dateTime={order.createdAt}>
                  {formatDateTime({
                    date: order.createdAt,
                    format: 'MMMM dd, yyyy'
                  })}
                </time>
              </p>
            </div>

            {order.shouldBeDeliveredOn && (
              <div>
                <p className='mb-1 text-sm font-mono uppercase text-primary/50'>
                  {isDeliveryOrder
                    ? 'Comanda ar trebui livrată în data de'
                    : 'Comanda poate fi ridicată în data de'}
                </p>
                <p className='text-lg'>
                  <time dateTime={order.shouldBeDeliveredOn}>
                    {formatDateTime({
                      date: order.shouldBeDeliveredOn,
                      format: 'MMMM dd, yyyy'
                    })}
                  </time>
                </p>
              </div>
            )}

            <div>
              <p className='mb-1 text-sm font-mono uppercase text-primary/50'>
                Total
              </p>
              {order.amount && (
                <Price className='text-lg' amount={order.amount} />
              )}
            </div>

            {order.status && (
              <div className='grow max-w-1/3'>
                <p className='mb-1 text-sm font-mono uppercase text-primary/50'>
                  Stare
                </p>
                <OrderStatus className='text-sm' status={order.status} />
              </div>
            )}
          </div>

          {order.items && (
            <div>
              <h2 className='mb-4 text-sm font-mono uppercase text-primary/50'>
                Produse
              </h2>
              <ul className='flex flex-col gap-6'>
                {order.items?.map((item, index) => {
                  if (typeof item.product === 'string') {
                    return null;
                  }

                  if (!item.product || typeof item.product !== 'object') {
                    return (
                      <div key={index}>
                        Acest produs nu mai este disponibil.
                      </div>
                    );
                  }

                  const product = item.product;
                  const metaImage =
                    product.meta?.image &&
                    typeof product.meta?.image === 'object'
                      ? product.meta.image
                      : undefined;
                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined;
                  const image = firstGalleryImage || metaImage;

                  return (
                    <li
                      className='rounded-2xl border border-neutral-200 bg-white/70 p-3'
                      key={item.id || index}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='bg-secondary-100 relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200'>
                          {image?.url ? (
                            <Image
                              alt={image?.alt || product.name || ''}
                              className='h-full w-full object-cover'
                              height={96}
                              src={image.url}
                              width={96}
                            />
                          ) : null}
                        </div>

                        <div className='min-w-0 flex-1'>
                          <p className='text-primary-900 truncate text-sm font-semibold'>
                            {product.name}
                          </p>
                          <p className='mt-1 text-xs text-neutral-600'>
                            Cantitate: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {hasAddressContent(order.shippingAddress) && (
            <div>
              <h2 className='mb-4 text-sm font-mono uppercase text-primary/50'>
                Adresă de livrare
              </h2>

              {/* @ts-expect-error - some kind of type hell */}
              <AddressItem address={order.shippingAddress} hideActions />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    description: `Detalii pentru comanda ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Comanda ${id}`,
      url: `/orders/${id}`
    }),
    title: `Comanda ${id}`
  };
}
