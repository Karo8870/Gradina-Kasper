import { Landing } from '@/app/_sections/landing';
import { Products } from '@/app/_sections/products';

export default function Home() {
  return (
    <main className='flex flex-col gap-16 px-24 max-md:px-4 sm:gap-24'>
      <Landing />
      <Products />
    </main>
  );
}
