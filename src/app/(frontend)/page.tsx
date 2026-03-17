import { payload } from '@/lib/payload';
import { HomeHeroBlock } from '@/components/home/home-hero-block';
import { HomeArticlesCarousel } from '@/components/home/home-articles-carousel';
import { HomeBox } from '@/components/home/home-box';
import { Media } from '@/payload-types';

type HomeLayoutBlock =
  | {
      blockType: 'hero';
      title?: string | null;
      description?: string | null;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
      desktopImage?: unknown;
      mobileImage?: unknown;
    }
  | {
      blockType: 'step-card-list';
      items?:
        | {
            content?: string | null;
            icon?: 'basket' | 'card' | 'shop' | null;
            textClass?: string | null;
            baseClass?: string | null;
            id?: string | null;
          }[]
        | null;
    }
  | {
      blockType?: string;
      [k: string]: unknown;
    };

type HomeHeroLayoutBlock = Extract<HomeLayoutBlock, { blockType: 'hero' }>;
type HomeStepCardListLayoutBlock = Extract<
  HomeLayoutBlock,
  { blockType: 'step-card-list' }
>;

function toMedia(value: unknown): Media | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Media;
}

export default async function HomePage() {
  const [home, articlesResult, featuredBoxResult] = await Promise.all([
    payload.findGlobal({
      slug: 'home',
      depth: 1
    }),
    payload.find({
      collection: 'articles',
      sort: '-createdAt',
      limit: 10,
      depth: 1
    }),
    payload.find({
      collection: 'boxes',
      where: {
        showOnHome: {
          equals: true
        }
      },
      sort: '-updatedAt',
      limit: 1,
      depth: 1
    })
  ]);

  const blocks = (home.layout ?? []) as HomeLayoutBlock[];
  const articles = articlesResult.docs;
  const featuredBox =
    featuredBoxResult.docs[0] ??
    (
      await payload.find({
        collection: 'boxes',
        sort: '-createdAt',
        limit: 1,
        depth: 1
      })
    ).docs[0];
  const boxImage = toMedia(featuredBox?.image);

  return (
    <main className='flex flex-col gap-16 px-24 max-md:px-4 sm:gap-24'>
      {blocks.map((block, index) => {
        if (block.blockType === 'hero') {
          return (
            <HomeHeroBlock key={index} block={block as HomeHeroLayoutBlock} />
          );
        }

        return null;
      })}

      <HomeBox
        title={featuredBox?.title ?? undefined}
        description={featuredBox?.description ?? undefined}
        price={featuredBox?.price ?? undefined}
        imageSrc={boxImage?.url ?? null}
        imageAlt={boxImage?.alt ?? 'Cutie cu legume proaspete'}
      />

      <HomeArticlesCarousel articles={articles} />
    </main>
  );
}
