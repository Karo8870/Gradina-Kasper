import { Button } from '@heroui/button';

export function Stepper({
  value,
  setValue,
  max
}: {
  value: number;
  setValue: (value: number) => void;
  max: number;
}) {
  return (
    <div className='flex w-min items-center rounded-xl bg-zinc-100'>
      <Button
        onClick={() => {
          setValue(Math.max(0, value - 1));
        }}
        className='rounded-r-none rounded-bl-xl rounded-tl-xl bg-transparent'
        isIconOnly
      >
        <i className='fa fa-minus' />
      </Button>
      <div className='h-4 border-l border-l-black/20' />
      <label className='w-14 text-center text-base font-medium text-black'>
        {value}
      </label>
      {/*<input className='w-14 bg-transparent text-center text-base font-medium text-black outline-none' />*/}
      <div className='h-4 border-l border-l-black/20' />
      <Button
        onClick={() => {
          setValue(Math.min(max, value + 1));
        }}
        className='rounded-l-none rounded-br-xl rounded-tr-xl bg-transparent'
        isIconOnly
      >
        <i className='fa fa-plus' />
      </Button>
    </div>
  );
}
