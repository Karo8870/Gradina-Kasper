import { Button } from '@heroui/button';
import { CartPopupItem } from '@/components/cart-popup/cart-popup-item';
import { Fragment } from 'react';
import { ContinueButton } from '@/components/buttons/continue-button';
import { useBasketContext } from '@/lib/providers/basket-provider';
import { products } from '@/db/schema/products';

export function CartPopup({
  onClose,
  apiProducts
}: {
  onClose: () => void;
  apiProducts: (typeof products.$inferSelect)[];
}) {
  const { basket } = useBasketContext();

  const items = basket.map((item) => {
    const product = apiProducts.find((el) => el.id === item.id);

    return {
      image: product?.image ?? '',
      name: product?.name ?? '',
      price: product?.priceWithTax ?? 0,
      quantity: item.quantity,
      id: item.id,
      inStock: product?.stock ?? 0
    };
  });

  return (
    <div className='flex h-full w-[28rem] flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-2xl font-bold text-black/80'>Coș de cumpărături</h1>
        <Button
          onClick={onClose}
          isIconOnly
          className='rounded-full bg-zinc-100'
        >
          <i className='fa fa-xmark text-base text-black' />
        </Button>
      </div>
      {items.length > 0 ? (
        <>
          <div className='flex flex-col gap-5 overflow-auto'>
            {items.map((item, index) => (
              <Fragment key={index}>
                {index !== 0 ? (
                  <div className='w-3/5 self-end border-b border-b-black/10' />
                ) : (
                  ''
                )}
                <CartPopupItem item={item} />
              </Fragment>
            ))}
          </div>
          <div className='flex items-center justify-between'>
            <label className='text-xl font-bold text-black'>Total</label>
            <label className='text-xl font-bold text-black'>
              {items.reduce((sum, el) => el.quantity * el.price + sum, 0)} lei
            </label>
          </div>
          <ContinueButton href='/basket' />
        </>
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <label className='text-2xl font-bold'>
            Coșul de cumpărături este gol
          </label>
        </div>
      )}
    </div>
  );
}
