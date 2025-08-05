import Link from 'next/link';
import { Button } from '@heroui/button';

export function ContinueButton({ href }: { href: string }) {
  return (
    <Button
      as={Link}
      href={href}
      className='max-h-[59px] min-h-12 grow basis-0 rounded-[1.25rem] bg-primary-600 py-4 text-[1.125rem] font-bold text-white sm:min-h-[3.5625rem]'
      startContent={
        <i className='fa fa-chevron-double-right text-[1.125rem]' />
      }
    >
      Continuă
    </Button>
  );
}
