import { Input } from '@heroui/input';

export default function ContactDetailsForm() {
  return (
    <form className='flex flex-col gap-4'>
      <Input
        classNames={{
          label:
            'text-black font-medium text-[0.875rem] pl-4 top-[65%] sm:text-base',
          inputWrapper: 'bg-zinc-100 rounded-2xl'
        }}
        placeholder='Nume'
        label='Nume'
        labelPlacement='outside'
      />
      <Input
        classNames={{
          label:
            'text-black font-medium text-[0.875rem] pl-4 top-[65%] sm:text-base',
          inputWrapper: 'bg-zinc-100 rounded-2xl'
        }}
        placeholder='Prenume'
        label='Prenume'
        labelPlacement='outside'
      />
      <Input
        classNames={{
          label:
            'text-black font-medium text-[0.875rem] pl-4 top-[65%] sm:text-base',
          inputWrapper: 'bg-zinc-100 rounded-2xl'
        }}
        placeholder='Email'
        label='Email'
        labelPlacement='outside'
      />
      <Input
        classNames={{
          label:
            'text-black font-medium sm:text-base text-[0.875rem] pl-4 top-[65%]',
          inputWrapper: 'bg-zinc-100 rounded-2xl'
        }}
        placeholder='Număr de telefon'
        label='Număr de telefon'
        labelPlacement='outside'
      />
    </form>
  );
}
