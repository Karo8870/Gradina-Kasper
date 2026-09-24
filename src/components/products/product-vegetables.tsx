import { RenderMedia } from '@/components/render-media';
import type { Product, Vegetable } from '@/payload-types';

export function ProductVegetables({
  possibleVegetables
}: {
  possibleVegetables: Product['possibleVegetables'];
}) {
  const vegetables = (possibleVegetables ?? []).filter(
    (item): item is Vegetable => typeof item === 'object' && item !== null
  );

  if (!vegetables.length) return null;

  return (
    <section className='space-y-2'>
      <h3 className='text-sm font-semibold'>Conținut posibil</h3>
      <ul className='flex flex-wrap gap-2'>
        {vegetables.map((vegetable) => (
          <li
            className='bg-muted flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm'
            key={vegetable.id}
          >
            {typeof vegetable.image === 'object' ? (
              <RenderMedia
                alt={vegetable.image.alt || vegetable.name}
                className='size-8 rounded-md object-cover'
                src={vegetable.image}
              />
            ) : null}
            <span>{vegetable.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
