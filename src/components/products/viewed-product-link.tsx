'use client';

import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const storageKey = 'gradina-kasper-viewed-products';

function getViewedProducts() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(stored)
      ? stored.filter((value): value is number => Number.isSafeInteger(value))
      : [];
  } catch {
    return [];
  }
}

export function markProductViewed(productID: number) {
  const viewedProducts = getViewedProducts();
  if (viewedProducts.includes(productID)) return;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([...viewedProducts, productID].slice(-100))
    );
  } catch {
    return;
  }
}

export function ViewedProductLink({
  href,
  productID,
  productName
}: {
  href: string;
  productID: number;
  productName: string;
}) {
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    setViewed(getViewedProducts().includes(productID));
  }, [productID]);

  function markViewed() {
    markProductViewed(productID);
    setViewed(true);
  }

  return (
    <>
      <Link
        aria-label={`Vezi ${productName}`}
        className='absolute inset-0 z-[1] focus-visible:outline-none'
        href={href}
        onClick={markViewed}
      >
        <span className='sr-only'>Vezi detaliile produsului</span>
      </Link>
      {viewed ? (
        <span
          aria-label='Produs vizualizat'
          className='bg-primary-950/90 pointer-events-none absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center rounded-full text-white sm:top-3 sm:right-3'
          role='img'
        >
          <Eye aria-hidden='true' className='size-4' />
        </span>
      ) : null}
    </>
  );
}
