import { Input } from '@/components/ui/input';

type FormInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
};

export default function FormInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  error
}: FormInputProps) {
  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className='text-sm font-medium text-primary-900'>
        {label}
      </label>

      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='bg-zinc-50'
        placeholder={label}
      />

      {error ? <p className='text-xs text-red-700'>{error}</p> : null}
    </div>
  );
}