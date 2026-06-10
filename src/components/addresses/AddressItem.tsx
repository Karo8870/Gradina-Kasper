'use client';

import React, { useState } from 'react';
import type { Address } from '@/payload-types';
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string }; // Allow address to be partial and entirely optional as this is entirely for display purposes
  /**
   * Completely override the default actions
   */
  actions?: React.ReactNode;
  /**
   * Insert elements before the actions
   */
  beforeActions?: React.ReactNode;
  /**
   * Insert elements after the actions
   */
  afterActions?: React.ReactNode;
  /**
   * Hide all actions
   */
  hideActions?: boolean;
};

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions
}) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!address || isDeleted) {
    return null;
  }

  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const street = [address.addressLine1, address.addressLine2]
    .filter(Boolean)
    .join(', ');
  const cityLine = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ');

  const deleteAddress = async () => {
    if (
      !address.id ||
      !window.confirm('Sigur vrei să ștergi această adresă?')
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/addresses/${address.id}`, {
        credentials: 'include',
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Adresa nu a putut fi ștearsă.');
      }

      setIsDeleted(true);
      toast.success('Adresa a fost ștearsă.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Adresa nu a putut fi ștearsă.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='flex items-center'>
      <div className='grow'>
        {(address.title || name) && (
          <p className='font-medium'>
            {[address.title, name].filter(Boolean).join(' ')}
          </p>
        )}
        {address.phone && <p>{address.phone}</p>}
        {street && <p>{street}</p>}
        {cityLine && <p>{cityLine}</p>}
        {address.country && <p>{address.country}</p>}
      </div>

      {!hideActions && address.id && (
        <div className='shrink flex flex-col gap-2'>
          {actions ? (
            actions
          ) : (
            <>
              {beforeActions}
              {address.id && (
                <CreateAddressModal
                  addressID={address.id}
                  initialData={address}
                  buttonText={'Editează'}
                  modalTitle={'Editează adresa'}
                  buttonVariant='outline'
                />
              )}
              <Button
                className='h-11 rounded-full border-neutral-200 bg-white px-5 text-primary-900 hover:bg-neutral-50'
                disabled={isDeleting}
                onClick={(event) => {
                  event.preventDefault();
                  void deleteAddress();
                }}
                type='button'
                variant='outline'
              >
                {isDeleting ? 'Se șterge...' : 'Șterge'}
              </Button>
              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  );
};
