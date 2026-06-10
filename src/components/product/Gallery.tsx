'use client';

import type { Product } from '@/payload-types';
import { GridTileImage } from '@/components/Grid/tile';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel';
import RenderImage from '@/components/RenderImage';

type Props = {
  gallery: NonNullable<Product['gallery']>;
};

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams();
  const [current, setCurrent] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }
  }, [api]);

  return (
    <div>
      <div className='relative w-full overflow-hidden mb-8'>
        <RenderImage
          className='w-full rounded-lg'
          src={gallery[current].image}
        />
      </div>

      <Carousel
        setApi={setApi}
        className='w-full'
        opts={{ align: 'start', loop: false }}
      >
        <CarouselContent>
          {gallery.map((item, i) => {
            if (typeof item.image !== 'object') return null;

            return (
              <CarouselItem
                className='basis-1/5'
                key={`${item.image.id}-${i}`}
                onClick={() => setCurrent(i)}
              >
                <GridTileImage active={i === current} media={item.image} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
