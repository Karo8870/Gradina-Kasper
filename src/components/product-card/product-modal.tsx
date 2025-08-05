import { Stepper } from '@/components/stepper';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  UseDisclosureProps
} from '@heroui/react';
import Image from 'next/image';
import image from '../../../public/images/castraveti.png';
import { useBasketContext } from '@/lib/providers/basket-provider';

export default function ProductModal({
  isOpen,
  onOpenChange,
  title,
  price,
  unit,
  id,
  inStock
}: {
  isOpen: UseDisclosureProps['isOpen'];
  onOpenChange: UseDisclosureProps['onChange'];
  title: string;
  price: number;
  unit: string;
  id: number;
  inStock: number;
}) {
  const { basket, setProduct } = useBasketContext();

  const quantity = basket.find((el) => el.id === id)?.quantity;

  return (
    <Modal
      className='m-0 rounded-b-none rounded-t-3xl'
      isOpen={isOpen}
      placement={'bottom'}
      onOpenChange={onOpenChange}
      classNames={{
        closeButton: 'z-10 top-7 right-7 bg-white text-black'
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className='gap-2.5 px-4 pt-4'>
              <div className='relative aspect-video w-full'>
                <Image
                  src={image}
                  alt={'Product Image'}
                  className='rounded-2xl object-fill'
                  fill
                />
              </div>
              <div>
                <h1 className='text-xl font-bold leading-tight text-black/90'>
                  {title}
                </h1>
                <label className='text-sm font-bold leading-tight text-black/70'>
                  {price} lei/{unit}
                </label>
              </div>
              <div className='flex items-center justify-between'>
                <label className='text-base font-bold text-black/80'>
                  Cantitate
                </label>
                <Stepper
                  max={inStock}
                  value={quantity ?? 0}
                  setValue={(value) => {
                    setProduct(id, value);
                  }}
                />
              </div>
              <div className='flex items-center justify-between'>
                <label className='text-base font-bold text-black/80'>
                  Preț total
                </label>
                <label className='text-base font-bold text-black/80'>
                  {price * (quantity ?? 0)} lei
                </label>
              </div>
            </ModalBody>
            <ModalFooter className='px-4'>
              <Button
                className='h-auto w-full rounded-[1.25rem] bg-primary-600 py-4 text-sm font-bold text-white'
                startContent={<i className='fa fa-shopping-basket text-lg' />}
              >
                Adaugă în coș
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
