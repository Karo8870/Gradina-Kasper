import { Input } from '@heroui/input';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export default function FormInput({
  error,
  label,
  register
}: {
  error: FieldError | undefined;
  label: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <Input
      classNames={{
        label:
          'text-black font-medium text-[0.875rem] pl-3 top-[65%] sm:text-base',
        inputWrapper: 'bg-zinc-100 rounded-2xl'
      }}
      placeholder={label}
      label={label}
      labelPlacement='outside'
      {...register}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
