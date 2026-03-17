import { HomeBox } from '@/components/home/home-box';
import { RichTextRenderer } from '@/components/rich-text/rich-text-renderer';
import { payload } from '@/lib/payload';
import { Media } from '@/payload-types';
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { CreditCard, ShoppingBasket, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultHowItWorksCards = [
  {
    title: 'Abonează boxul',
    text:
      'Flexibil, fără obligații - pauză sau anulare oricând. Legume locale și speciale, livrate direct la tine acasă.',
  },
  {
    title: 'Noi recoltăm',
    text:
      'Recoltăm legumele în funcție de sezon și le pregătim proaspăt pentru tine.',
  },
  {
    title: 'Livrăm sau ridici',
    text:
      'Livrare direct la tine acasă sau ridicare de la Come Back în Coresi Mall.',
  }
];

const howItWorksCardStyles = [
  {
    icon: ShoppingBasket,
    textClass: 'text-secondary-700',
    baseClass: 'bg-secondary-50'
  },
  {
    icon: CreditCard,
    textClass: 'text-[#3F6A2B]',
    baseClass: 'bg-[#DDF7D1]'
  },
  {
    icon: Store,
    textClass: 'text-primary-700',
    baseClass: 'bg-primary-100'
  }
];

type ProductsPageSections = {
  boxesSectionTitle?: string | null;
  boxesSectionContent?: SerializedEditorState | null;
  howItWorksSectionTitle?: string | null;
  howItWorksSectionContent?: SerializedEditorState | null;
  vegetablesSectionTitle?: string | null;
  vegetablesSectionDescription?: string | null;
  vegetablesSectionContent?: SerializedEditorState | null;
};

function toMedia(value: unknown): Media | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Media;
}

function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  return !!value && typeof value === 'object' && 'root' in value;
}

export default async function OurProductsPage() {
  const [boxesResult, productsGlobal] = await Promise.all([
    payload.find({
      collection: 'boxes',
      sort: '-createdAt',
      depth: 1,
      limit: 100
    }),
    payload.findGlobal({
      slug: 'our-products',
      depth: 1
    })
  ]);

  const editableHowItWorksCards =
    productsGlobal.howItWorksCards?.length === 3
      ? productsGlobal.howItWorksCards
      : defaultHowItWorksCards;

  const pageSections = productsGlobal as typeof productsGlobal & ProductsPageSections;
  const vegetables = productsGlobal.vegetables ?? [];

  return (
    <main className='flex flex-col gap-14 px-4 pb-14 md:px-6 lg:px-24'>
      <section className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-primary-900 text-3xl font-bold tracking-tight sm:text-4xl mt-10'>
            {pageSections.boxesSectionTitle ?? 'Boxurile noastre'}
          </h1>

          {isSerializedEditorState(pageSections.boxesSectionContent) ? (
            <RichTextRenderer data={pageSections.boxesSectionContent} className='max-w-4xl' />
          ) : null}
        </div>

        {boxesResult.docs.length ? (
          <div className='flex flex-col gap-8'>
            {boxesResult.docs.map((box) => {
              const image = toMedia(box.image);

              return (
                <HomeBox
                  key={box.id}
                  title={box.title}
                  description={box.description}
                  price={box.price}
                  imageSrc={image?.url ?? null}
                  imageAlt={image?.alt ?? box.title}
                  detailsHref={`/products/${box.id}`}
                />
              );
            })}
          </div>
        ) : (
          <p className='text-muted-foreground'>
            Nu există încă box-uri disponibile pentru această pagină.
          </p>
        )}
      </section>

      <section className='flex flex-col gap-6'>
        <h2 className='text-primary-900 text-3xl font-bold tracking-tight sm:text-4xl'>
          {pageSections.howItWorksSectionTitle ?? 'Cum funcționează'}
        </h2>

        {isSerializedEditorState(pageSections.howItWorksSectionContent) ? (
          <RichTextRenderer data={pageSections.howItWorksSectionContent} className='max-w-4xl' />
        ) : null}

        <div className='grid gap-4 lg:grid-cols-3'>
          {howItWorksCardStyles.map((style, index) => {
            const content = editableHowItWorksCards[index] ?? defaultHowItWorksCards[index];

            return (
              <article
                key={`${content.title}-${index}`}
                className={cn(
                  'flex items-center gap-6 rounded-[3.75rem] px-8 py-6 md:h-56 md:px-10',
                  style.baseClass
                )}
              >
                <div className='flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full bg-white p-5'>
                  <style.icon className={cn('h-8 w-8', style.textClass)} />
                </div>

                <div className='flex flex-col'>
                  <h3 className={cn('text-xl font-bold', style.textClass)}>
                    {content.title}
                  </h3>
                  <p
                    className={cn('mt-2 text-sm leading-relaxed', style.textClass)}
                  >
                    {content.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className='flex flex-col gap-6'>
        <h2 className='text-primary-900 text-3xl font-bold tracking-tight sm:text-4xl'>
          {pageSections.vegetablesSectionTitle ?? 'Ce poate ajunge în boxul tău'}
        </h2>

        {isSerializedEditorState(pageSections.vegetablesSectionContent) ? (
          <RichTextRenderer data={pageSections.vegetablesSectionContent} className='max-w-4xl' />
        ) : pageSections.vegetablesSectionDescription ? (
          <p className='text-muted-foreground max-w-4xl text-base leading-relaxed'>
            {pageSections.vegetablesSectionDescription}
          </p>
        ) : null}

        <div className='flex flex-wrap gap-4'>
          {vegetables.map((vegetable, index) => {
            const vegetableImage = toMedia(vegetable.image);
            const vegetableName = vegetable.name || `leguma-${index + 1}`;

            return (
              <article
                key={vegetable.id}
                className='h-28 w-28 overflow-hidden rounded-2xl sm:h-32 sm:w-32 md:h-36 md:w-36'
              >
                {vegetableImage?.url ? (
                  <img
                    src={vegetableImage.url}
                    alt={vegetableImage.alt ?? vegetableName}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='bg-secondary-50 h-full w-full' />
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
