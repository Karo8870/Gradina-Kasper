import Link from 'next/link';
import { Button } from './ui/button';
import { Price } from '@/components/Price';
import RenderImage from '@/components/RenderImage';
import { cn } from '@/utilities/cn';
import { Product } from '@/payload-types';
import { RichText } from '@/components/RichText';
import { formatDateTime } from '@/utilities/formatDateTime';
import {
  getInventoryBadge,
  getNextDeliveryDate,
  getUnavailableNotice,
  isProductTemporarilyUnavailable
} from '@/lib/boxHelpers';
import { NotifyWhenAvailableButton } from '@/components/box/NotifyWhenAvailableButton';

export default function ({
  product,
  holidayDates
}: {
  product: Product;
  holidayDates: string[];
}) {
  const isTemporarilyUnavailable = isProductTemporarilyUnavailable(product);
  const inventoryBadge = getInventoryBadge(product.inventory);
  const nextDeliveryDate = getNextDeliveryDate(holidayDates);
  const unavailableNotice = getUnavailableNotice(product);

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[2rem] border border-neutral-200 bg-white grid md:grid-cols-2',
        isTemporarilyUnavailable &&
          'border-neutral-300 bg-neutral-50 text-neutral-500'
      )}
    >
      <div className='min-h-56 md:min-h-[22rem]'>
        <RenderImage
          className={cn(
            'h-full w-full object-cover',
            isTemporarilyUnavailable && 'opacity-70 grayscale'
          )}
          src={product.gallery![0].image}
        />
      </div>

      <div className='space-y-4 p-5 md:p-7'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <h2 className='text-primary-900 text-2xl font-semibold md:text-3xl'>
            {product.name}
          </h2>
          {product.hasDiscount ? (
            <div className='flex flex-col items-end'>
              <span className='text-sm text-neutral-500 line-through'>
                <Price amount={+product.price} />
              </span>
              <span className='text-primary-900 text-xl font-bold'>
                <Price amount={+product.discountedPrice!} />
              </span>
            </div>
          ) : (
            <Price
              amount={+product.price}
              className='text-primary-900 text-xl font-bold'
            />
          )}
        </div>

        {isTemporarilyUnavailable ? (
          <span className='inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-700 uppercase'>
            {unavailableNotice}
          </span>
        ) : (
          <span
            className={cn(
              'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase',
              inventoryBadge.className
            )}
          >
            {inventoryBadge.label}
          </span>
        )}

        <p className='text-sm leading-relaxed'>
          <span className='text-primary-900 font-semibold'>
            Livrare / Ridicare:
          </span>{' '}
          <span className='font-medium text-neutral-500'>
            {formatDateTime({ date: nextDeliveryDate })}
          </span>
        </p>

        <RichText
          enableGutter={false}
          data={product.description}
          className='w-full leading-relaxed text-neutral-700 line-clamp-3'
        />

        {/*<div className='space-y-2'>*/}
        {/*  <p className='text-primary-900 text-sm font-semibold'>*/}
        {/*    Conținut posibil*/}
        {/*  </p>*/}
        {/*  <ul className='flex flex-wrap gap-2'>*/}
        {/*    {product.possibleVegetables!.map((item) => (*/}
        {/*      <li*/}
        {/*        key={(item as Vegetable).id}*/}
        {/*        className='bg-secondary-100 text-primary-900 rounded-full px-3 py-1 text-sm'*/}
        {/*      >*/}
        {/*        {(item as Vegetable).name}*/}
        {/*      </li>*/}
        {/*    ))}*/}
        {/*  </ul>*/}
        {/*</div>*/}

        {isTemporarilyUnavailable || !product.slug ? (
          <NotifyWhenAvailableButton boxID={product.id} />
        ) : (
          <Button
            asChild
            className='bg-primary-600 hover:bg-primary-700 h-14 w-full rounded-[20px] text-base font-semibold text-white'
          >
            <Link href={`/products/${product.slug}`}>Vezi boxul</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
