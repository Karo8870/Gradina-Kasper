import { Button } from '@heroui/button';

export default function AuthButton({ children }: { children: string }) {
  return (
    <Button
      type='submit'
      // href={href}
      className='min-h-12 grow basis-0 rounded-[1.25rem] bg-primary-600 py-4 text-[1.125rem] font-bold text-white max-sm:text-base sm:min-h-[3.5625rem]'
    >
      {children}
    </Button>
  );
}
