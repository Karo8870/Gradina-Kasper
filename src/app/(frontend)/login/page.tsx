import AuthCard from '@/components/auth/auth-card';
import LoginForm from '@/components/forms/login-form';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <section className='flex w-full justify-center px-2 sm:px-4'>
      <main className='mt-12 flex w-full max-w-[45rem] flex-col items-stretch gap-8 rounded-3xl px-4 py-8 max-sm:gap-6 sm:px-6 md:shadow-[0px_0px_30px_-5px_rgba(0,0,0,0.25)]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex aspect-square items-center justify-center rounded-full bg-secondary-100 p-6'>
            <LogIn className='h-10 w-10 text-primary-900' />
          </div>
          <h1 className='text-4xl font-bold text-primary-900 max-sm:text-2xl'>
            Autentificare
          </h1>
        </div>

        <LoginForm />

        <AuthCard
          text1='Nu ai cont?'
          text2='Poți crea unul aici.'
          href='/register'
        />
      </main>
    </section>
  );
}