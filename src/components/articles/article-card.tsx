import Link from 'next/link';

import { RenderMedia } from '@/components/render-media';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import type { Article, Media } from '@/payload-types';

export function ArticleCard({ article }: { article: Article }) {
  const thumbnail =
    typeof article.thumbnail === 'object' ? (article.thumbnail as Media) : null;

  return (
    <Link className='block h-full' href={`/did-you-know/${article.slug}`}>
      <Card className='hover:bg-muted/40 h-full transition-colors'>
        <div className='bg-muted aspect-[16/10] overflow-hidden'>
          <RenderMedia
            alt={thumbnail?.alt || article.title}
            className='size-full object-cover'
            src={thumbnail}
          />
        </div>
        <CardHeader>
          <CardTitle>{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{article.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
