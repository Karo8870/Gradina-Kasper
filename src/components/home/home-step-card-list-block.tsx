import { CreditCard, ShoppingBasket, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepItem = {
  content?: string | null;
  icon?: 'basket' | 'card' | 'shop' | null;
  textClass?: string | null;
  baseClass?: string | null;
};

type StepCardClassNames = {
  base: string;
  text: string;
};

const iconMap = {
  basket: ShoppingBasket,
  card: CreditCard,
  shop: Store
};

function StepCard({
  content,
  classNames,
  icon
}: {
  content: string;
  classNames: StepCardClassNames;
  icon: 'basket' | 'card' | 'shop';
}) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        'flex h-56 grow basis-0 items-center gap-6 rounded-[3.75rem] px-10',
        classNames.base
      )}
    >
      <div className='flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white p-5'>
        <Icon className={cn('h-8 w-8', classNames.text)} />
      </div>
      <p className={cn('text-2xl font-medium', classNames.text)}>{content}</p>
    </div>
  );
}

export function HomeStepCardListBlock({
  block
}: {
  block: { items?: StepItem[] | null };
}) {
  if (!block.items?.length) {
    return null;
  }

  return (
    <section className='hidden gap-6 lg:flex'>
      {block.items.map((item, index) => (
        <StepCard
          key={index}
          content={item.content ?? ''}
          icon={item.icon ?? 'basket'}
          classNames={{
            text: item.textClass ?? 'text-secondary-700',
            base: item.baseClass ?? 'bg-secondary-50'
          }}
        />
      ))}
    </section>
  );
}
