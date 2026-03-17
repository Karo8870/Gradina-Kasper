import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

type OrderType = 'Abonament' | 'Achiziție unică';

const orders = [
  {
    id: 'GK-1024',
    orderType: 'Abonament' as OrderType,
    boxSummary: 'Cutia Kasper + Cutia Kasper Family',
    orderDate: '12 martie 2026',
    pickupDate: '14 martie 2026',
    status: 'Livrată',
    totalPrice: '129 lei'
  },
  {
    id: 'GK-0991',
    orderType: 'Achiziție unică' as OrderType,
    boxSummary: 'Cutia Kasper',
    orderDate: '4 martie 2026',
    pickupDate: '18 martie 2026',
    status: 'Pregătire ridicare',
    totalPrice: '99 lei'
  },
  {
    id: 'GK-0938',
    orderType: 'Abonament' as OrderType,
    boxSummary: 'Cutia Kasper XL + Cutia Kasper',
    orderDate: '26 februarie 2026',
    pickupDate: '28 februarie 2026',
    status: 'Livrată',
    totalPrice: '149 lei'
  }
];

export default function HistoryPage() {
  return (
    <section className='flex w-full justify-center px-2 sm:px-4'>
      <main className='border-border mt-12 flex w-full max-w-[52rem] flex-col items-stretch gap-8 rounded-3xl border bg-white px-4 py-8 max-sm:gap-6 sm:px-6'>
        <div className='flex flex-col items-center gap-4'>
          <div className='bg-secondary-100 flex aspect-square items-center justify-center rounded-full p-6'>
            <ClipboardList className='text-primary-900 h-10 w-10' />
          </div>
          <h1 className='text-primary-900 text-4xl font-bold max-sm:text-2xl'>
            Istoric comenzi
          </h1>
        </div>

        <div className='flex flex-col gap-4'>
          {orders.map((order) => (
            <article
              key={order.id}
              className='border-border flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex flex-col'>
                <span className='text-primary-700 text-sm font-medium'>
                  Comanda
                </span>
                <span className='text-primary-900 text-xl font-bold'>
                  {order.id}
                </span>
                <span className='text-muted-foreground mt-1 text-xs'>
                  {order.boxSummary}
                </span>
              </div>

              <div className='flex flex-col sm:items-end'>
                <span className='text-muted-foreground text-xs'>
                  Data comandă: {order.orderDate}
                </span>
                <span className='text-muted-foreground text-xs'>
                  Data ridicare: {order.pickupDate}
                </span>
                <span className='mt-1 rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-800'>
                  {order.orderType}
                </span>
                <span className='bg-secondary-50 text-primary-800 mt-1 rounded-full px-2 py-1 text-xs font-semibold'>
                  {order.status}
                </span>
              </div>

              <div className='flex items-center justify-between sm:flex-col sm:items-end'>
                <span className='text-primary-900 text-lg font-bold'>
                  {order.totalPrice}
                </span>
                <Button
                  asChild
                  variant='outline'
                  className='mt-0 sm:mt-2'
                >
                  <Link href={`/history/${order.id}`}>Vezi detalii</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </section>
  );
}
