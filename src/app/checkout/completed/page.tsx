import { ContinueButton } from '@/components/buttons/continue-button';

export default function Page() {
  return (
    <main className='flex w-full max-w-[45rem] flex-col items-stretch gap-16 px-4 sm:px-6'>
      <i className='fa fa-circle-check text-[7.5rem] text-primary-500' />
      <h1 className='text-center text-2xl font-bold text-black sm:text-4xl'>
        Felicitări, comanda ta a fost plasată!
      </h1>
      <p className='text-center text-base font-medium text-black/80 sm:text-xl'>
        V-am trimis un e-mail de confirmare si o factura. Găsiți acolo toate
        informațiile relevante.
      </p>
      <p className='text-center text-base font-medium text-black/80 sm:text-xl'>
        Vă mulțumim pentru că ați comandat de la Grădina Kasper!
      </p>
      <ContinueButton href='/' />
    </main>
  );
}
