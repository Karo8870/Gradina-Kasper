'use client';

import { AddressItem } from '@/components/addresses/AddressItem';
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { isRomanianAddress } from '@/lib/addressValidation';
import { Address } from '@/payload-types';
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react';
import { useState } from 'react';

type Props = {
  selectedAddress?: Address;
  setAddress: React.Dispatch<
    React.SetStateAction<Partial<Address> | undefined>
  >;
  heading?: string;
  description?: string;
  requireRomanian?: boolean;
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>;
};

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading = 'Adrese',
  description = 'Selectează sau adaugă adresa de facturare ori livrare.',
  requireRomanian = false
}) => {
  const { addresses } = useAddresses();

  if (!addresses || addresses.length === 0) {
    return (
      <div className='flex flex-col gap-4 mb-4'>
        <p className='text-sm text-neutral-600'>
          Nu există adrese salvate. Adaugă una pentru a continua.
        </p>

        <CreateAddressModal />
      </div>
    );
  }

  return (
    <div className='flex flex-col mb-4'>
      <h3 className='text-primary-900 mb-2 text-xl font-semibold'>{heading}</h3>
      <div className='border rounded-2xl p-5'>
        <p className='text-sm leading-relaxed text-neutral-600 pb-4'>
          {description}
        </p>
        <AddressesModal
          requireRomanian={requireRomanian}
          setAddress={setAddress}
        />
      </div>
    </div>
  );
};

const AddressesModal: React.FC<Props> = ({
  requireRomanian = false,
  setAddress
}) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (state: boolean) => {
    setOpen(state);
  };

  const closeModal = () => {
    setOpen(false);
  };
  const { addresses } = useAddresses();

  if (!addresses || addresses.length === 0) {
    return (
      <p className='text-sm text-neutral-600'>Nu există adrese salvate.</p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='default'
          className='bg-primary-900 hover:bg-primary-950 h-11 w-full rounded-full text-sm font-semibold text-white'
        >
          Selectează o adresă
        </Button>
      </DialogTrigger>
      <DialogContent className='border-neutral-200 bg-white'>
        <DialogHeader>
          <DialogTitle className='text-primary-900'>
            Selectează o adresă
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-12'>
          <ul className='flex flex-col gap-8'>
            {addresses.map((address) => (
              <li
                key={address.id}
                className='border-b border-neutral-200 pb-8 last:border-none'
              >
                <AddressItem
                  address={address}
                  beforeActions={
                    <>
                      <Button
                        className='bg-primary-900 hover:bg-primary-950 h-10 rounded-full px-4 text-white disabled:cursor-not-allowed disabled:opacity-50'
                        disabled={
                          requireRomanian && !isRomanianAddress(address)
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setAddress(address);
                          closeModal();
                        }}
                        variant='default'
                      >
                        Selectează
                      </Button>
                      {requireRomanian && !isRomanianAddress(address) && (
                        <p className='max-w-48 text-xs text-neutral-600'>
                          Pentru livrare, adresa trebuie să fie în România.
                        </p>
                      )}
                    </>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal
            buttonText='Adaugă o adresă nouă'
            buttonVariant='outline'
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
