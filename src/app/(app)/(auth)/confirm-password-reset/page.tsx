'use client';

import { Input } from '@/components/ui/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

interface SearchParams {
  token?: string;
}

interface PasswordResetForm {
  password: string;
  repeatPassword: string;
}

export default function ({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { register, handleSubmit } = useForm<PasswordResetForm>();
  const onSubmit: SubmitHandler<PasswordResetForm> = (data) => {
    console.log(data);
  };

  return (
    <div className='w-full flex items-center flex-col'>
      <label>Reset your password</label>
      <form
        className='flex flex-col gap-4 items-center w-80'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          {...register('password')}
          type='password'
          placeholder='New Password'
        />
        <Input
          {...register('repeatPassword')}
          type='password'
          placeholder='Repeat Password'
        />
        <Button type='submit'>Reset Password</Button>
      </form>
    </div>
  );
}
