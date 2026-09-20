'use client';

import { MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { deleteAddressAction, type AddressDTO } from '@/actions/addresses';
import { AddressCreatorModal } from '@/components/addresses/address-creator-modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export function AccountAddresses({
  initialAddresses,
  mapboxEnabled
}: {
  initialAddresses: AddressDTO[];
  mapboxEnabled: boolean;
}) {
  const [addresses, setAddresses] = useState(initialAddresses);

  async function removeAddress(id: AddressDTO['id']) {
    if (!window.confirm('Sigur vrei să ștergi această adresă?')) return;

    const result = await deleteAddressAction({ id });
    if (result.success) {
      setAddresses((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <div className='flex max-w-3xl flex-col gap-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-semibold'>Adrese</h1>
          <p className='text-muted-foreground text-sm'>
            Gestionează adresele salvate pentru comenzile viitoare.
          </p>
        </div>
        <AddressCreatorModal
          mapboxEnabled={mapboxEnabled}
          onCreated={(address) =>
            setAddresses((current) => [address, ...current])
          }
        />
      </header>

      {addresses.length ? (
        <div className='grid gap-4'>
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex gap-3'>
                  <MapPin
                    aria-hidden='true'
                    className='text-muted-foreground mt-0.5 size-4 shrink-0'
                  />
                  <div className='text-sm'>
                    <p className='font-medium'>
                      {[address.title, address.firstName, address.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                    <p className='text-muted-foreground'>
                      {address.addressLine1}
                    </p>
                    {address.addressLine2 ? (
                      <p className='text-muted-foreground'>
                        {address.addressLine2}
                      </p>
                    ) : null}
                    <p className='text-muted-foreground'>
                      {address.postalCode} {address.city}, {address.state}
                    </p>
                    <p className='text-muted-foreground'>{address.country}</p>
                    <p className='text-muted-foreground mt-2'>
                      {address.phone}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label='Șterge adresa'
                  onClick={() => void removeAddress(address.id)}
                  size='icon-sm'
                  variant='destructive'
                >
                  <Trash2 />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nicio adresă salvată</CardTitle>
            <CardDescription>
              Adaugă prima adresă pentru a o putea folosi mai târziu la
              checkout.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
