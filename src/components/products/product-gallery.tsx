'use client';

import { useState } from 'react';

import { RenderMedia } from '@/components/render-media';
import { Button } from '@/components/ui/button';
import type { Media } from '@/payload-types';

export function ProductGallery({
  images,
  productName
}: {
  images: Media[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? null;

  return (
    <div className='flex flex-col gap-3'>
      <div className='bg-muted aspect-square overflow-hidden rounded-2xl'>
        <RenderMedia
          alt={selectedImage?.alt || productName}
          className='size-full object-cover'
          src={selectedImage}
        />
      </div>
      {images.length > 1 ? (
        <div className='grid grid-cols-5 gap-2'>
          {images.map((image, index) => (
            <Button
              aria-label={`Afișează imaginea ${index + 1}`}
              className='aspect-square h-auto overflow-hidden p-0'
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              variant={selectedIndex === index ? 'secondary' : 'outline'}
            >
              <RenderMedia
                alt={image.alt || `${productName}, imaginea ${index + 1}`}
                className='size-full object-cover'
                src={image}
              />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
