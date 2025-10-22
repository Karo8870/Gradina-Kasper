import { Basket } from '@/components/basket/basket';
import { BackButton } from '@/components/buttons/back-button';
import PaymentForm from '@/components/payment-form';
import { getVisibleProducts } from '@/lib/api/products';
import { Suspense } from 'react';

function PaymentError({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const error = searchParams.error as string;
  const orderId = searchParams.orderId as string;

  if (!error) return null;

  let errorMessage = 'A apărut o eroare la procesarea plății.';
  let errorTitle = 'Eroare plată';

  switch (error) {
    case 'payment_failed':
      errorTitle = 'Plata a eșuat';
      errorMessage = 'Plata nu a putut fi procesată. Vă rugăm să încercați din nou sau să alegeți o altă metodă de plată.';
      break;
    case 'payment_cancelled':
      errorTitle = 'Plata anulată';
      errorMessage = 'Ați anulat plata. Puteți încerca din nou când sunteți gata.';
      break;
    case 'unknown_status':
      errorTitle = 'Status necunoscut';
      errorMessage = 'Statusul plății nu a putut fi determinat. Vă rugăm să încercați din nou.';
      break;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <i className="fa fa-exclamation-triangle text-red-600" />
        <div>
          <div className="font-medium text-red-900">{errorTitle}</div>
          <div className="text-sm text-red-700">{errorMessage}</div>
          {orderId && (
            <div className="text-xs text-red-600 mt-1">
              Comandă #{orderId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
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
      
      <Suspense fallback={null}>
        <PaymentError searchParams={await searchParams} />
      </Suspense>
      
      <PaymentForm />
      <BackButton href='/checkout/pickup' />
    </div>
  );
}
