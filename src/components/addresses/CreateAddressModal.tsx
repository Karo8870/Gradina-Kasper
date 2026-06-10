'use client';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { AddressForm } from '@/components/forms/AddressForm';
import { Address } from '@/payload-types';
import { DefaultDocumentIDType } from 'payload';

type Props = {
  addressID?: DefaultDocumentIDType;
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string };
  buttonText?: string;
  modalTitle?: string;
  buttonVariant?: 'default' | 'outline';
  callback?: (address: Partial<Address>) => void;
  skipSubmission?: boolean;
  disabled?: boolean;
};

export const CreateAddressModal: React.FC<Props> = ({
  addressID,
  initialData,
  buttonText = 'Adaugă o adresă',
  modalTitle = 'Adaugă o adresă',
  buttonVariant = 'default',
  callback,
  skipSubmission,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (state: boolean) => {
    setOpen(state);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const handleCallback = (data: Partial<Address>) => {
    closeModal();

    if (callback) {
      callback(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <Button
          className={
            buttonVariant === 'default'
              ? 'bg-primary-900 hover:bg-primary-950 h-11 rounded-full px-5 text-sm font-semibold text-white'
              : 'border-neutral-200 bg-white hover:bg-neutral-50 h-11 rounded-full px-5 text-sm font-semibold text-primary-900'
          }
          variant={buttonVariant === 'default' ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className='border-neutral-200 bg-white'>
        <DialogHeader>
          <DialogTitle className='text-primary-900'>{modalTitle}</DialogTitle>
        </DialogHeader>

        <AddressForm
          addressID={addressID}
          initialData={initialData}
          callback={handleCallback}
          skipSubmission={skipSubmission}
        />
      </DialogContent>
    </Dialog>
  );
};
