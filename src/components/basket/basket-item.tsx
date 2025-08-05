export function BasketItem({
  item
}: {
  item: {
    image: string;
    name: string;
    price: number;
    quantity: number;
    id: number;
    inStock: number;
  };
}) {
  return (
    <div className='flex items-center gap-4 border-b border-b-black/10 pb-5'>
      {item.image ? (
        <img
          className='h-[6.25rem] w-[6.25rem] rounded-[1.25rem] object-cover'
          src={item.image}
          alt={item.name}
        />
      ) : (
        <div className='flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-[1.25rem] bg-zinc-100'>
          <i className='fa fa-image text-4xl' />
        </div>
      )}
      <div className='flex grow flex-col items-center sm:flex-row'>
        <div className='flex w-full grow basis-0 flex-row justify-between sm:w-auto sm:flex-col'>
          <div className='flex flex-col'>
            <label className='text-xl font-bold text-black'>{item.name}</label>
            <label className='text-[1.125rem] font-bold text-black/70'>
              {item.price} lei/kg
            </label>
          </div>
        </div>
        <div className='flex w-full grow basis-0 items-center justify-between sm:w-auto sm:justify-center'>
          <label className='text-xl font-bold text-black'>
            {item.quantity} kg
          </label>
        </div>
        <div className='flex w-full grow basis-0 items-center justify-between sm:w-auto sm:justify-end'>
          <label className='text-xl font-bold text-black'>
            {item.price * item.quantity} lei
          </label>
        </div>
      </div>
    </div>
  );
}
