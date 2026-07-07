import configPromise from '@payload-config';
import { CarIcon, RotateCcw, ShoppingBasket } from 'lucide-react';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import { generateGlobalMetadata } from '@/lib/metadataHelper';
import Section from '@/components/Section';
import BoxComponent from '@/components/BoxComponent';
import RenderImage from '@/components/RenderImage';

export async function generateMetadata() {
  return generateGlobalMetadata('products-page');
}

const howItWorksCardStyles = [
  {
    icon: ShoppingBasket,
    textClass: 'text-secondary-700',
    baseClass: 'bg-secondary-50'
  },
  {
    icon: CarIcon,
    textClass: 'text-[#3F6A2B]',
    baseClass: 'bg-[#DDF7D1]'
  },
  {
    icon: RotateCcw,
    textClass: 'text-primary-700',
    baseClass: 'bg-primary-100'
  }
] as const;

export default async function ProductsPage() {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: configPromise });

  const [
    productsResult,
    vegetablesResult,
    productsPageGlobal,
    deliveryPickupConfig
  ] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 2,
      draft,
      limit: 1000,
      overrideAccess: draft,
      pagination: false,
      sort: 'title',
      where: {
        hideProduct: {
          equals: false
        }
      }
    }),
    payload.find({
      collection: 'vegetables',
      depth: 1,
      draft,
      limit: 1000,
      overrideAccess: draft,
      pagination: false
    }),
    payload.findGlobal({
      slug: 'products-page',
      depth: 2
    }),
    payload.findGlobal({
      slug: 'delivery-pickup-configuration' as any,
      depth: 0
    })
  ]);

  return (
    <main className='flex flex-col gap-14 px-4 pb-14 md:px-6 lg:px-24 pt-24'>
      <Section
        title={productsPageGlobal.boxesSectionTitle}
        description={productsPageGlobal.boxesSectionContent}
      >
        {productsResult.docs.map((box) => (
          <BoxComponent
            product={box}
            deliveryPickupConfig={deliveryPickupConfig}
          />
        ))}
      </Section>

      <Section
        title={productsPageGlobal.howItWorksTitle}
        description={productsPageGlobal.howItWorksContent}
      >
        <div className='grid gap-4 lg:grid-cols-3'>
          {howItWorksCardStyles.map((style, index) => {
            const content = [
              productsPageGlobal.step1,
              productsPageGlobal.step2,
              productsPageGlobal.step3
            ][index];

            return (
              <article
                key={`${content.title}-${index}`}
                className={`flex items-center gap-6 rounded-[3.75rem] px-8 py-6 md:h-56 md:px-10 ${style.baseClass}`}
              >
                <div className='flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full bg-white p-5'>
                  <style.icon className={`h-8 w-8 ${style.textClass}`} />
                </div>

                <div className='flex flex-col'>
                  <h3 className={`text-xl font-bold ${style.textClass}`}>
                    {content.title}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${style.textClass}`}
                  >
                    {content.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        title={productsPageGlobal.whatsInYourBoxTitle}
        description={productsPageGlobal.whatsInYourBoxContent}
      >
        <div className='flex flex-wrap gap-4'>
          {vegetablesResult.docs.map((vegetable) => {
            return (
              <article
                key={vegetable.id}
                className='h-28 w-28 overflow-hidden rounded-2xl sm:h-32 sm:w-32 md:h-36 md:w-36'
              >
                <RenderImage
                  className='h-full w-full object-cover'
                  src={vegetable.image}
                />
              </article>
            );
          })}
        </div>
      </Section>
    </main>
  );
}
