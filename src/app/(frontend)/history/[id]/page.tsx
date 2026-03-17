import Link from 'next/link';
import { Button } from '@/components/ui/button';

type OrderType = 'Abonament' | 'Achiziție unică';

type OrderProduct = {
  name: string;
  quantity: number;
  unitPrice: string;
  category: 'box' | 'extra';
};

type Order = {
  id: string;
  orderDate: string;
  pickupDate: string;
  status: string;
  orderType: OrderType;
  interval?: string;
  totalPrice: string;
  products: OrderProduct[];
};

const ordersById: Record<string, Order> = {
  'GK-1024': {
    id: 'GK-1024',
    orderDate: '12 martie 2026',
    pickupDate: '14 martie 2026',
    status: 'Livrată',
    orderType: 'Abonament',
    interval: 'Săptămânal',
    totalPrice: '129 lei',
    products: [
      {
        name: 'Cutia Kasper',
        quantity: 1,
        unitPrice: '99 lei',
        category: 'box'
      },
      {
        name: 'Cutia Kasper Family',
        quantity: 1,
        unitPrice: '30 lei',
        category: 'box'
      }
    ]
  },
  'GK-0991': {
    id: 'GK-0991',
    orderDate: '4 martie 2026',
    pickupDate: '18 martie 2026',
    status: 'Pregătire ridicare',
    orderType: 'Achiziție unică',
    totalPrice: '99 lei',
    products: [
      {
        name: 'Cutia Kasper',
        quantity: 1,
        unitPrice: '99 lei',
        category: 'box'
      },
      {
        name: 'Pătrunjel verde',
        quantity: 1,
        unitPrice: '0 lei',
        category: 'extra'
      }
    ]
  },
  'GK-0938': {
    id: 'GK-0938',
    orderDate: '26 februarie 2026',
    pickupDate: '28 februarie 2026',
    status: 'Livrată',
    orderType: 'Abonament',
    interval: 'La două săptămâni',
    totalPrice: '149 lei',
    products: [
      {
        name: 'Cutia Kasper XL',
        quantity: 1,
        unitPrice: '119 lei',
        category: 'box'
      },
      {
        name: 'Cutia Kasper',
        quantity: 1,
        unitPrice: '30 lei',
        category: 'box'
      }
    ]
  }
};

export default async function HistoryDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = ordersById[id];

  if (!order) {
    return (
      <section className='flex w-full justify-center px-2 sm:px-4'>
        <main className='border-border mt-12 flex w-full max-w-[45rem] flex-col gap-6 rounded-3xl border bg-white px-4 py-8 sm:px-6'>
          <h1 className='text-primary-900 text-3xl font-bold'>
            Comanda {id} nu a fost găsită
          </h1>

          <Button asChild variant='outline' className='w-fit'>
            <Link href='/history'>Înapoi la istoric</Link>
          </Button>
        </main>
      </section>
    );
  }

  return (
    <section className='flex w-full justify-center px-2 sm:px-4'>
      <main className='border-border mt-12 flex w-full max-w-[45rem] flex-col gap-6 rounded-3xl border bg-white px-4 py-8 sm:px-6'>
        <h1 className='text-primary-900 text-3xl font-bold'>
          Detalii comandă {order.id}
        </h1>

        <div className='grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2'>
          <p className='text-sm'>
            <span className='text-muted-foreground'>Data comandă:</span>{' '}
            <span className='font-semibold text-primary-900'>
              {order.orderDate}
            </span>
          </p>
          <p className='text-sm'>
            <span className='text-muted-foreground'>Data ridicare:</span>{' '}
            <span className='font-semibold text-primary-900'>
              {order.pickupDate}
            </span>
          </p>
          <p className='text-sm'>
            <span className='text-muted-foreground'>Tip comandă:</span>{' '}
            <span className='font-semibold text-primary-900'>
              {order.orderType}
              {order.interval ? ` (${order.interval})` : ''}
            </span>
          </p>
          <p className='text-sm'>
            <span className='text-muted-foreground'>Status:</span>{' '}
            <span className='font-semibold text-primary-900'>{order.status}</span>
          </p>
          <p className='text-sm sm:col-span-2'>
            <span className='text-muted-foreground'>Total:</span>{' '}
            <span className='text-lg font-bold text-primary-900'>
              {order.totalPrice}
            </span>
          </p>
        </div>

        <div className='rounded-2xl border border-border p-4'>
          <h2 className='text-primary-900 text-lg font-semibold'>
            Produse comandate
          </h2>

          <div className='mt-3 flex flex-col gap-3'>
            {order.products.map((product, index) => (
              <article
                key={`${product.name}-${index}`}
                className='bg-secondary-50 border-border flex items-center justify-between rounded-xl border px-3 py-2'
              >
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-primary-900'>
                    {product.name}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {product.category === 'box' ? 'Box' : 'Produs extra'} x{' '}
                    {product.quantity}
                  </span>
                </div>

                <span className='text-sm font-semibold text-primary-900'>
                  {product.unitPrice}
                </span>
              </article>
            ))}
          </div>
        </div>

        <Button asChild variant='outline' className='w-fit'>
          <Link href='/history'>Înapoi la istoric</Link>
        </Button>
      </main>
    </section>
  );
}