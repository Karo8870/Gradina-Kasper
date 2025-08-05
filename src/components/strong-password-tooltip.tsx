import { cn } from '@heroui/react';

export default function StrongPasswordTooltip({ value }: { value: string }) {
  const checks: Record<
    string,
    {
      label: string;
      isValid: boolean;
    }
  > = {
    minLength: {
      label: 'Cel puțin 8 caractere',
      isValid: value.length >= 8
    },
    lowercase: {
      label: 'Cel puțin o literă mică',
      isValid: /[a-z]/.test(value)
    },
    uppercase: {
      label: 'Cel puțin o literă mare',
      isValid: /[A-Z]/.test(value)
    },
    number: {
      label: 'Cel puțin un număr',
      isValid: /\d/.test(value)
    },
    specialChar: {
      label: 'Cel puțin un caracter special',
      isValid: /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ]/.test(value)
    }
  };

  const validChecksCount = Object.values(checks).filter(
    (check) => check.isValid
  ).length;

  return (
    <div className='flex flex-col gap-2 p-3'>
      <div className='flex gap-2'>
        {Object.entries(checks).map(([key, { label, isValid }], index) => (
          <div
            className={cn(
              'h-2 w-10 rounded-full',
              !(index < validChecksCount) && 'bg-zinc-100',
              index < validChecksCount &&
                validChecksCount === 1 &&
                'bg-red-500',
              index < validChecksCount &&
                validChecksCount === 2 &&
                'bg-red-500',
              index < validChecksCount &&
                validChecksCount === 3 &&
                'bg-yellow-400',
              index < validChecksCount &&
                validChecksCount === 4 &&
                'bg-yellow-400',
              index < validChecksCount &&
                validChecksCount === 5 &&
                'bg-green-500'
            )}
            key={key}
          />
        ))}
      </div>
      <div className='flex flex-col gap-2'>
        <label className='text-base font-bold text-black/80'>
          Parola trebuie să conțină:
        </label>
        {Object.entries(checks).map(([key, { label, isValid }]) => (
          <div
            key={key}
            className={cn(
              'flex products-center gap-2',
              isValid ? 'text-green-500' : 'text-red-500'
            )}
          >
            <i
              className={cn(
                'fa',
                isValid ? 'fa-check-circle' : 'fa-times-circle'
              )}
            />
            <p className='text-sm'>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
