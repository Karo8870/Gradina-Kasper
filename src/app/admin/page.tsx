import { getProducts } from '@/lib/api/products';
import ReloadButton from '@/components/buttons/reload-button';
import AdminProductForm from '@/components/forms/admin-product-form';

export default async function Page() {
  const products = await getProducts();

  return (
    <main className='flex flex-col gap-8'>
      <div className='self-start'>
        <ReloadButton />
      </div>
      <AdminProductForm apiProducts={products} />
    </main>
  );
}
