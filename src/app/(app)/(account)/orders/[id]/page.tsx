import type { Order } from '@/payload-types';
import type { Metadata } from 'next';

import { Price } from '@/components/Price';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utilities/formatDateTime';
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { headers as getHeaders } from 'next/headers.js';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { OrderStatus } from '@/components/OrderStatus';
import { AddressItem } from '@/components/addresses/AddressItem';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    accessToken?: string;
    email?: string;
  }>;
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
