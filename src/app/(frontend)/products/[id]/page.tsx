import Link from 'next/link';
import { payload } from '@/lib/payload';
import { Button } from '@/components/ui/button';
import { Media } from '@/payload-types';

function toMedia(value: unknown): Media | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Media;
}

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boxId = Number(id);

  if (!Number.isFinite(boxId)) {
    return (
      <section className='flex w-full justify-center px-4'>
        <main className='border-border mt-12 w-full max-w-[56rem] rounded-3xl border bg-white p-6'>
          <h1 className='text-primary-900 text-2xl font-bold'>
            Box-ul nu a fost găsit.
          </h1>
          <Button asChild variant='outline' className='mt-6'>
            <Link href='/products'>Înapoi la produse</Link>
          </Button>
        </main>
      </section>
    );
  }

  const boxesResult = await payload.find({
    collection: 'boxes',
    where: {
      id: {
        equals: boxId
      }
    },
    depth: 1,
    limit: 1
  });

  const box = boxesResult.docs[0];

  if (!box) {
    return (
      <section className='flex w-full justify-center px-4'>
        <main className='border-border mt-12 w-full max-w-[56rem] rounded-3xl border bg-white p-6'>
          <h1 className='text-primary-900 text-2xl font-bold'>
            Box-ul nu a fost găsit.
          </h1>
          <Button asChild variant='outline' className='mt-6'>
            <Link href='/products'>Înapoi la produse</Link>
          </Button>
        </main>
      </section>
    );
  }

  const image = toMedia(box.image);
  const contents = box.contents ?? [];
  const seasonFrom = box.seasonInterval?.from ?? 'nespecificat';
  const seasonTo = box.seasonInterval?.to ?? 'nespecificat';

  return (
    <section className='flex w-full justify-center px-4'>
      <main className='mt-12 flex w-full max-w-[72rem] flex-col gap-8 rounded-3xl border border-border bg-white p-4 sm:p-6 lg:p-8'>
        <Button asChild variant='outline' className='w-fit'>
          <Link href='/products'>Înapoi la produse</Link>
        </Button>

        <div className='grid gap-8 lg:grid-cols-2'>
          <div className='bg-secondary-50 overflow-hidden rounded-3xl'>
            {image?.url ? (
              <img
                src={image.url}
                alt={image.alt ?? box.title}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='text-muted-foreground flex h-[26rem] items-center justify-center text-sm font-medium'>
                Imagine indisponibilă
              </div>
            )}
          </div>

          <div className='flex flex-col gap-5'>
            <h1 className='text-primary-900 text-3xl font-bold tracking-tight sm:text-4xl'>
              {box.title}
            </h1>

            <p className='text-muted-foreground text-base leading-relaxed'>
              {box.description}
            </p>

            <p className='text-primary-900 text-3xl font-bold'>{box.price}</p>

            <div className='rounded-2xl border border-border bg-secondary-50 p-4'>
              <h2 className='text-primary-900 text-lg font-semibold'>
                Interval sezonier
              </h2>
              <p className='text-primary-800 mt-1 text-sm'>
                Disponibil doar din {seasonFrom} până în {seasonTo}.
              </p>
            </div>

            <div className='rounded-2xl border border-border p-4'>
              <h2 className='text-primary-900 text-lg font-semibold'>Conținut</h2>
              {contents.length ? (
                <ul className='mt-3 grid gap-2 sm:grid-cols-2'>
                  {contents.map((entry) => (
                    <li
                      key={entry.id}
                      className='bg-secondary-50 rounded-xl px-3 py-2 text-sm text-primary-900'
                    >
                      {entry.item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-muted-foreground mt-2 text-sm'>
                  Conținutul nu este configurat încă.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}