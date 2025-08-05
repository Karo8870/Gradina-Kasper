import ProductCard from '@/components/product-card/product-card';
import { getVisibleProducts } from '@/lib/api/products';

export async function Products() {
  const products = await getVisibleProducts();

  return (
    <section
      id='produse'
      className='flex w-full flex-col items-center gap-10 max-sm:gap-5'
    >
      <h1 className='text-4xl font-bold text-black/80 max-sm:text-2xl'>
        Produse
      </h1>
      <div className='grid w-full grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-8 max-md:gap-3 max-sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]'>
        {products.map((product, index) => (
          <ProductCard
            key={index}
            title={product.name}
            price={product.priceWithTax}
            unit={product.unit}
            image={product.image}
            quantityInCart={0}
            inStock={product.stock}
            id={product.id}
          />
        ))}
      </div>
    </section>
  );
}
