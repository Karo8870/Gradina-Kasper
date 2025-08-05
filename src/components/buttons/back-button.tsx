import Link from 'next/link';
import { Button } from '@heroui/button';

export function BackButton({ href }: { href: string }) {
  return (
    <Button
      as={Link}
      href={href}
      className='min-h-12 grow basis-0 rounded-[1.25rem] bg-zinc-200 py-4 text-[1.125rem] font-bold text-black/70 sm:min-h-[3.5625rem]'
      startContent={<i className='fa fa-chevron-left text-[1.125rem]' />}
    >
      Înapoi
    </Button>
  );
}
