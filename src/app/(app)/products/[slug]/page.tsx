import { Gallery } from '@/components/product/Gallery';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import { Metadata } from 'next';
import { generateMeta } from '@/utilities/generateMeta';
import {
  getInventoryBadge,
  getNextDeliveryDate,
  getUnavailableNotice,
  isProductTemporarilyUnavailable
} from '@/lib/boxHelpers';
import { Price } from '@/components/Price';
import { formatDateTime } from '@/utilities/formatDateTime';
import { RichText } from '@/components/RichText';
import RenderImage from '@/components/RenderImage';
import { Vegetable } from '@/payload-types';
import { ProductBasketControls } from '@/components/product/ProductBasketControls';
import { NotifyWhenAvailableButton } from '@/components/box/NotifyWhenAvailableButton';

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;

  const article = await queryProductBySlug({
    slug
  });

  return generateMeta({ doc: article as any });
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params;
  const result = await queryProductBySlug({ slug });

  if (!result.product) return notFound();

  const isTemporarilyUnavailable = isProductTemporarilyUnavailable(
    result.product
  );
  const inventoryBadge = getInventoryBadge(result.product.inventory);
  const nextDeliveryDate = getNextDeliveryDate(result.deliveryPickupConfig);
  const unavailableNotice = getUnavailableNotice(result.product);

  return (
    <div className='container pt-24'>
      <Button asChild variant='ghost' className='mb-5'>
        <Link href='/products'>
          <ChevronLeftIcon />
          Toate produsele
        </Link>
      </Button>

      <div className='overflow-hidden rounded-[2rem] border border-neutral-200 bg-white md:grid md:grid-cols-2'>
        <section className='min-h-56 md:min-h-[22rem]'>
          <Suspense
            fallback={
              <div className='bg-secondary-100 relative aspect-square h-full max-h-[550px] w-full overflow-hidden' />
            }
          >
            {Boolean(result.product.gallery?.length) ? (
              <Gallery gallery={result.product.gallery!} />
            ) : (
              <div className='bg-secondary-100 relative aspect-square h-full max-h-[550px] w-full overflow-hidden' />
            )}
          </Suspense>
        </section>

        <section className='space-y-4 p-5 md:space-y-6 md:p-7'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <h1 className='text-primary-900 text-2xl font-semibold md:text-3xl'>
              {result.product.name}
            </h1>

            {result.product.hasDiscount ? (
              <div className='flex flex-col items-end'>
                <span className='text-sm text-neutral-500 line-through'>
                  <Price amount={+result.product.price} />
                </span>
                <span className='text-primary-900 text-xl font-bold'>
                  <Price amount={+(result.product.discountedPrice ?? 0)} />
                </span>
              </div>
            ) : (
              <Price
                amount={+result.product.price}
                className='text-primary-900 text-xl font-bold'
              />
            )}
          </div>

          {isTemporarilyUnavailable ? (
            <span className='inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700'>
              {unavailableNotice}
            </span>
          ) : (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${inventoryBadge.className}`}
            >
              {inventoryBadge.label}
            </span>
          )}

          <p className='text-sm text-neutral-600'>
            Prețul include TVA. Costurile de livrare nu sunt incluse.
          </p>

          <p className='text-sm leading-relaxed'>
            <span className='text-primary-900 font-semibold'>
              Livrare / Ridicare:
            </span>{' '}
            <span className='font-medium text-neutral-500'>
              {formatDateTime({
                date: nextDeliveryDate
              })}
            </span>
          </p>

          <RichText
            data={result.product.description}
            enableGutter={false}
            enableProse={false}
            className='w-full leading-relaxed text-neutral-700'
          />

          <div className='space-y-2'>
            <p className='text-primary-900 text-sm font-semibold'>
              Conținut posibil
            </p>
            <ul className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {(result.product.possibleVegetables as Vegetable[]).map(
                (item) => {
                  return (
                    <li
                      key={item.id}
                      className='bg-secondary-100 flex items-center gap-2 rounded-xl px-2 py-2'
                    >
                      <RenderImage
                        className='h-10 w-10 rounded-lg object-cover'
                        src={item.image}
                      />
                      <span className='text-primary-900 text-sm font-medium'>
                        {item.name}
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          </div>

          <div className='pt-2'>
            {isTemporarilyUnavailable ? (
              <NotifyWhenAvailableButton boxID={result.product.id} />
            ) : (
              <ProductBasketControls product={result.product} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug
          }
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }])
      ]
    }
  });

  const deliveryPickupConfig = await payload.findGlobal({
    slug: 'delivery-pickup-configuration' as any,
    depth: 0
  });

  return {
    product: result.docs?.[0] || null,
    deliveryPickupConfig
  };
};
