import { isProductExpired } from '@/commerce/products';
import { ProductCard } from '@/components/products/product-card';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export default async function ProductsPage() {
  const payload = await getCMS();
  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'name'
  });
  const visibleProducts = products.filter(
    (product) => !isProductExpired(product)
  );

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6'>
      <header className='max-w-2xl'>
        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          Produse
        </h1>
        <p className='text-muted-foreground mt-3'>
          Descoperă produsele disponibile și adaugă-le direct în coș.
        </p>
      </header>
      {visibleProducts.length ? (
        <div className='flex flex-col gap-6'>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className='bg-muted/40 rounded-2xl border border-dashed p-10 text-center'>
          <p className='font-medium'>Nu există produse disponibile momentan.</p>
        </div>
      )}
    </div>
  );
}

export const metadata = staticMetadata(
  'Produse',
  'Descoperă produsele disponibile în magazin.',
  '/products'
);
