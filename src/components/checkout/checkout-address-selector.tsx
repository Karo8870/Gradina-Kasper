'use client';

import { MapPin } from 'lucide-react';
import { useState } from 'react';

import type { AddressDTO } from '@/actions/addresses';
import { isRomanianDeliveryAddress } from '@/commerce/addresses/delivery';
import { AddressCreatorModal } from '@/components/addresses/address-creator-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const countryNames = new Intl.DisplayNames(['ro'], { type: 'region' });

function AddressDetails({ address }: { address: AddressDTO }) {
  return (
    <div className='flex min-w-0 gap-3'>
      <MapPin className='text-muted-foreground mt-0.5 size-4 shrink-0' />
      <div className='min-w-0 text-sm'>
        <p className='font-medium'>
          {[address.title, address.firstName, address.lastName]
            .filter(Boolean)
            .join(' ')}
        </p>
        <p className='text-muted-foreground'>{address.addressLine1}</p>
        {address.addressLine2 ? (
          <p className='text-muted-foreground'>{address.addressLine2}</p>
        ) : null}
        <p className='text-muted-foreground'>
          {address.postalCode} {address.city}, {address.state}
        </p>
        <p className='text-muted-foreground'>
          {countryNames.of(address.country) ?? address.country}
        </p>
        <p className='text-muted-foreground mt-2'>{address.phone}</p>
      </div>
    </div>
  );
}

export function CheckoutAddressSelector({
  addresses,
  description,
  heading,
  mapboxEnabled,
  onAddressCreated,
  onSelect,
  requireRomanian = false,
  selectedAddress
}: {
  addresses: AddressDTO[];
  description: string;
  heading: string;
  mapboxEnabled: boolean;
  onAddressCreated: (address: AddressDTO) => void;
  onSelect: (address: AddressDTO) => void;
  requireRomanian?: boolean;
  selectedAddress?: AddressDTO;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className='flex flex-col gap-3'>
      <div>
        <h3 className='font-semibold'>{heading}</h3>
        <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
      </div>

      {selectedAddress ? (
        <div className='bg-muted/30 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between'>
          <AddressDetails address={selectedAddress} />
          <div className='flex shrink-0 flex-wrap gap-2'>
            <Dialog onOpenChange={setOpen} open={open}>
              <DialogTrigger render={<Button variant='outline' />}>
                Schimbă
              </DialogTrigger>
              <AddressPickerDialog
                addresses={addresses}
                onSelect={(address) => {
                  onSelect(address);
                  setOpen(false);
                }}
                requireRomanian={requireRomanian}
              />
            </Dialog>
            <AddressCreatorModal
              mapboxEnabled={mapboxEnabled}
              onCreated={(address) => {
                onAddressCreated(address);
                onSelect(address);
              }}
            />
          </div>
        </div>
      ) : (
        <div className='flex flex-wrap gap-3 rounded-xl border border-dashed p-4'>
          {addresses.length ? (
            <Dialog onOpenChange={setOpen} open={open}>
              <DialogTrigger render={<Button />}>
                Selectează o adresă
              </DialogTrigger>
              <AddressPickerDialog
                addresses={addresses}
                onSelect={(address) => {
                  onSelect(address);
                  setOpen(false);
                }}
                requireRomanian={requireRomanian}
              />
            </Dialog>
          ) : (
            <p className='text-muted-foreground w-full text-sm'>
              Nu ai încă nicio adresă salvată.
            </p>
          )}
          <AddressCreatorModal
            mapboxEnabled={mapboxEnabled}
            onCreated={(address) => {
              onAddressCreated(address);
              onSelect(address);
            }}
          />
        </div>
      )}
    </section>
  );
}

function AddressPickerDialog({
  addresses,
  onSelect,
  requireRomanian
}: {
  addresses: AddressDTO[];
  onSelect: (address: AddressDTO) => void;
  requireRomanian: boolean;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Selectează o adresă</DialogTitle>
        <DialogDescription>
          {requireRomanian
            ? 'Pentru livrare poți selecta doar o adresă validă din România.'
            : 'Selectează una dintre adresele salvate în cont.'}
        </DialogDescription>
      </DialogHeader>
      <ul className='flex flex-col gap-3'>
        {addresses.map((address) => {
          const selectable =
            !requireRomanian || isRomanianDeliveryAddress(address);

          return (
            <li
              className='flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between'
              key={address.id}
            >
              <AddressDetails address={address} />
              <div className='flex shrink-0 flex-col items-start gap-2'>
                <Button
                  disabled={!selectable}
                  onClick={() => onSelect(address)}
                >
                  Selectează
                </Button>
                {!selectable ? (
                  <p className='text-destructive max-w-48 text-xs'>
                    Este necesară o adresă din România cu un cod poștal de 6
                    cifre.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </DialogContent>
  );
}
