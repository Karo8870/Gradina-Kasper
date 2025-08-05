import AuthCard from '@/components/auth-card';
import RegisterForm from '@/components/forms/register-form';

export default function Login() {
  return (
    <main className='mt-12 flex w-full max-w-[45rem] flex-col items-stretch gap-8 rounded-3xl px-4 py-8 max-sm:gap-6 sm:px-6 md:shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.25)]'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex aspect-square items-center justify-center rounded-full bg-secondary-100 p-6'>
          <i className='fa fa-user-plus text-4xl text-primary-900' />
        </div>
        <h1 className='text-4xl font-bold text-primary-900 max-sm:text-2xl'>
          Înregistrare
        </h1>
      </div>
      <RegisterForm />
      <AuthCard
        text1='Ai deja un cont?'
        text2='Autentifică-te aici.'
        iconClassname='fa-arrow-right-to-bracket'
        href='/login'
      />
    </main>
  );
}
