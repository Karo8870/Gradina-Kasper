import { useState } from 'react';
import StrongPasswordTooltip from '@/components/strong-password-tooltip';
import { Input } from '@heroui/input';
import { cn, Tooltip } from '@heroui/react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export default function FormPasswordInput({
  showStrength = false,
  error,
  label,
  register,
  watch
}: {
  showStrength?: boolean;
  error: FieldError | undefined;
  label: string;
  register: UseFormRegisterReturn;
  watch?: string;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (showStrength) {
    const [popover, setPopover] = useState(false);

    return (
      <Tooltip
        isOpen={popover}
        content={<StrongPasswordTooltip value={watch!} />}
        placement='top-start'
        offset={16}
      >
        <Input
          classNames={{
            label:
              'text-black font-medium sm:text-base text-[0.875rem] pl-3 top-[65%]',
            inputWrapper: 'bg-zinc-100 rounded-2xl'
          }}
          placeholder={label}
          label={label}
          labelPlacement='outside'
          endContent={
            <i
              className={cn(
                'fa cursor-pointer',
                isPasswordVisible ? 'fa-eye' : 'fa-eye-slash'
              )}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          }
          type={isPasswordVisible ? 'text' : 'password'}
          {...register}
          isInvalid={!!error}
          errorMessage={error?.message}
          onFocus={() => setPopover(true)}
          onBlur={() => setPopover(false)}
        />
      </Tooltip>
    );
  }

  return (
    <Input
      classNames={{
        label:
          'text-black font-medium sm:text-base text-[0.875rem] pl-3 top-[65%]',
        inputWrapper: 'bg-zinc-100 rounded-2xl'
      }}
      placeholder={label}
      label={label}
      labelPlacement='outside'
      endContent={
        <i
          className={cn(
            'fa cursor-pointer',
            isPasswordVisible ? 'fa-eye' : 'fa-eye-slash'
          )}
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
        />
      }
      type={isPasswordVisible ? 'text' : 'password'}
      {...register}
      isInvalid={!!error}
      errorMessage={error?.message}
    />
  );
}
