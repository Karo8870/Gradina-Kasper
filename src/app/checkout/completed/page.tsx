import { ContinueButton } from '@/components/buttons/continue-button';
import { Suspense } from 'react';

function CompletedContent({ searchParams }: { searchParams: any }) {
  const orderId = searchParams.orderId as string;
  const ntpID = searchParams.ntpID as string;

  return (
    <>
      <i className='fa fa-circle-check text-[7.5rem] text-primary-500' />
      <h1 className='text-center text-2xl font-bold text-black sm:text-4xl'>
        Felicitări, comanda ta a fost plasată și plătită!
      </h1>
      <p className='text-center text-base font-medium text-black/80 sm:text-xl'>
        Plata a fost procesată cu succes prin Netopia Payments. 
        V-am trimis un e-mail de confirmare și o factură.
      </p>
      {orderId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-sm text-green-800">
            <div className="font-medium">Numărul comenzii: #{orderId}</div>
            {ntpID && (
              <div className="text-xs mt-1">ID Tranzacție: {ntpID}</div>
            )}
          </div>
        </div>
      )}
      <p className='text-center text-base font-medium text-black/80 sm:text-xl'>
        Vă mulțumim pentru că ați comandat de la Grădina Kasper!
      </p>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: any }) {
  return (
    <main className='flex w-full max-w-[45rem] flex-col items-stretch gap-16 px-4 sm:px-6'>
      <Suspense fallback={
        <>
          <i className='fa fa-circle-check text-[7.5rem] text-primary-500' />
          <h1 className='text-center text-2xl font-bold text-black sm:text-4xl'>
            Se încarcă...
          </h1>
        </>
      }>
        <CompletedContent searchParams={searchParams} />
      </Suspense>
      <ContinueButton href='/' />
    </main>
  );
}
