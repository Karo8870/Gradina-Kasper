import { getPayload } from 'payload';
import config from '@payload-config';
import RenderImage from '@/components/RenderImage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Section from '@/components/Section';
import BoxComponent from '@/components/BoxComponent';
import { Article, Product } from '@/payload-types';
import { ArticleCard } from '@/components/ArticleBox';
import { generateGlobalMetadata } from '@/lib/metadataHelper';

export async function generateMetadata() {
  return generateGlobalMetadata('home-page');
}

export default async function () {
  const payload = await getPayload({ config });

  const home = await payload.findGlobal({
    slug: 'home-page',
    depth: 3
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const holidayDates = await payload.find({
    collection: 'holiday-dates',
    where: {
      date: {
        greater_than_equal: today.toISOString()
      }
    }
  });

  return (
    <>
      <section className='flex flex-col gap-7 px-4 pb-0 h-[100dvh] sm:pb-7 md:px-0 lg:px-0 mb-10'>
        <div className='h-[100dvh] flex flex-col justify-center px-8 md:px-36'>
          <div className='absolute top-0 left-0 w-full h-full from-white/70 to-transparent -z-10 bg-gradient-to-r' />
          <RenderImage
            className='absolute top-0 left-0 w-full h-full object-cover -z-20'
            src={home.heroBackgroundImage}
          />
          <div className='flex flex-col w-full md:w-1/2 items-start'>
            <h1 className='text-primary-950 pb-8 text-3xl md:text-[4rem] leading-tight font-bold'>
              {home.heroTitle}
            </h1>
            <h2 className='text-primary-800 pb-10 text-xl font-medium'>
              {home.subtitle}
            </h2>
            <Button
              asChild
              className='bg-primary-900 hover:bg-primary-950 h-auto rounded-full px-5 py-3 md:px-10 md:py-6 text-base md:text-[1.125rem] font-bold text-white'
            >
              <Link href='/shop'>{home.callToActionText}</Link>
            </Button>
          </div>
        </div>
      </section>
      <Section
        title={home.highlightBoxTitle}
        description={home.highlightBoxContent}
      >
        <BoxComponent
          product={home.featuredProduct as Product}
          holidayDates={holidayDates.docs.map((el) => el.date)}
        />
      </Section>
      <Section
        title={home.highlightArticlesTitle}
        description={home.highlightArticlesContent}
      >
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {(home.highlightedArticles as Article[]).map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </Section>
    </>
  );
}
