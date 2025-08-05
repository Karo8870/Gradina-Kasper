import { Basket } from '@/components/basket/basket';
import { BackButton } from '@/components/buttons/back-button';
import PaymentMethods from '@/components/payment-methods';
import { getVisibleProducts } from '@/lib/api/products';

export default async function Page() {
  const products = await getVisibleProducts();

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <h1 className='text-left text-2xl font-bold text-black sm:text-center sm:text-4xl sm:text-black/80'>
        Comanda ta
      </h1>
      <Basket apiProducts={products} />
      <h1 className='text-left text-2xl font-bold text-black sm:text-center sm:text-4xl sm:text-black/80'>
        Metodă de plată
      </h1>
      <PaymentMethods />
      <BackButton href='/checkout/pickup' />
    </div>
  );
}
