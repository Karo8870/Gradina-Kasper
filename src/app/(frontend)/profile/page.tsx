'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, UserRound } from 'lucide-react';

type BillingAddress = {
  id: string;
  address: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  cui: string;
};

type BillingAddressForm = Omit<BillingAddress, 'id'>;

const profile = {
  firstName: 'Alexandru',
  lastName: 'Popescu',
  email: 'alexandru.popescu@example.com',
  phone: '+40 712 345 678'
};

const emptyBillingForm: BillingAddressForm = {
  address: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  cui: ''
};

const getCompanyLabel = (address: BillingAddress) => {
  if (!address.company && !address.cui) {
    return null;
  }

  if (address.company && address.cui) {
    return `${address.company} (CUI: ${address.cui})`;
  }

  if (address.company) {
    return address.company;
  }

  return `CUI: ${address.cui}`;
};

export default function ProfilePage() {
  const [billingAddresses, setBillingAddresses] = useState<BillingAddress[]>([]);
  const [billingForm, setBillingForm] = useState<BillingAddressForm>({
    ...emptyBillingForm,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone
  });
  const [billingError, setBillingError] = useState('');

  const handleBillingInputChange = (field: keyof BillingAddressForm, value: string) => {
    setBillingForm((previousForm) => ({
      ...previousForm,
      [field]: value
    }));
  };

  const handleAddBillingAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<keyof BillingAddressForm> = ['address', 'firstName', 'lastName', 'phone'];
    const hasMissingRequiredField = requiredFields.some((field) => !billingForm[field].trim());

    if (hasMissingRequiredField) {
      setBillingError('Completează adresa, numele, prenumele și telefonul.');
      return;
    }

    setBillingAddresses((previousAddresses) => [
      ...previousAddresses,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        address: billingForm.address.trim(),
        firstName: billingForm.firstName.trim(),
        lastName: billingForm.lastName.trim(),
        phone: billingForm.phone.trim(),
        company: billingForm.company.trim(),
        cui: billingForm.cui.trim()
      }
    ]);

    setBillingError('');
    setBillingForm((previousForm) => ({
      ...previousForm,
      address: '',
      company: '',
      cui: ''
    }));
  };

  const handleRemoveBillingAddress = (billingAddressId: string) => {
    setBillingAddresses((previousAddresses) =>
      previousAddresses.filter((address) => address.id !== billingAddressId)
    );
  };

  return (
    <section className='flex w-full justify-center px-2 sm:px-4'>
      <main className='mt-12 flex w-full max-w-[45rem] flex-col items-stretch gap-8 rounded-3xl border border-border bg-white px-4 py-8 max-sm:gap-6 sm:px-6'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex aspect-square items-center justify-center rounded-full bg-secondary-100 p-6'>
            <UserRound className='h-10 w-10 text-primary-900' />
          </div>
          <h1 className='text-4xl font-bold text-primary-900 max-sm:text-2xl'>
            Profilul meu
          </h1>
          <p className='text-muted-foreground text-center text-sm'>
            Date afișate demo, fără conectare la backend.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='profile-last-name' className='text-sm font-medium text-primary-900'>
              Nume
            </label>
            <Input id='profile-last-name' value={profile.lastName} readOnly className='bg-zinc-50' />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='profile-first-name' className='text-sm font-medium text-primary-900'>
              Prenume
            </label>
            <Input id='profile-first-name' value={profile.firstName} readOnly className='bg-zinc-50' />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='profile-email' className='text-sm font-medium text-primary-900'>
              Email
            </label>
            <Input id='profile-email' value={profile.email} readOnly className='bg-zinc-50' />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='profile-phone' className='text-sm font-medium text-primary-900'>
              Număr de telefon
            </label>
            <Input id='profile-phone' value={profile.phone} readOnly className='bg-zinc-50' />
          </div>
        </div>

        <section className='flex flex-col gap-4 rounded-2xl border border-border bg-zinc-50 p-4 sm:p-6'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold text-primary-900'>Adrese de facturare</h2>
            <p className='text-muted-foreground text-sm'>
              Poți adăuga mai multe adrese de facturare. Compania și CUI sunt opționale.
            </p>
          </div>

          <form className='grid gap-4 sm:grid-cols-2' onSubmit={handleAddBillingAddress}>
            <div className='flex flex-col gap-2'>
              <label htmlFor='billing-last-name' className='text-sm font-medium text-primary-900'>
                Nume
              </label>
              <Input
                id='billing-last-name'
                value={billingForm.lastName}
                onChange={(event) => handleBillingInputChange('lastName', event.target.value)}
                placeholder='Popescu'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='billing-first-name' className='text-sm font-medium text-primary-900'>
                Prenume
              </label>
              <Input
                id='billing-first-name'
                value={billingForm.firstName}
                onChange={(event) => handleBillingInputChange('firstName', event.target.value)}
                placeholder='Alexandru'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='billing-phone' className='text-sm font-medium text-primary-900'>
                Număr de telefon
              </label>
              <Input
                id='billing-phone'
                value={billingForm.phone}
                onChange={(event) => handleBillingInputChange('phone', event.target.value)}
                placeholder='+40 712 345 678'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='billing-company' className='text-sm font-medium text-primary-900'>
                Companie (opțional)
              </label>
              <Input
                id='billing-company'
                value={billingForm.company}
                onChange={(event) => handleBillingInputChange('company', event.target.value)}
                placeholder='SC Exemplu SRL'
              />
            </div>

            <div className='flex flex-col gap-2 sm:col-span-2'>
              <label htmlFor='billing-address' className='text-sm font-medium text-primary-900'>
                Adresă de facturare
              </label>
              <Input
                id='billing-address'
                value={billingForm.address}
                onChange={(event) => handleBillingInputChange('address', event.target.value)}
                placeholder='Str. Florilor 12, Brașov, România'
              />
            </div>

            <div className='flex flex-col gap-2 sm:col-span-2'>
              <label htmlFor='billing-cui' className='text-sm font-medium text-primary-900'>
                CUI (opțional)
              </label>
              <Input
                id='billing-cui'
                value={billingForm.cui}
                onChange={(event) => handleBillingInputChange('cui', event.target.value)}
                placeholder='RO12345678'
              />
            </div>

            {billingError ? <p className='text-xs text-red-700 sm:col-span-2'>{billingError}</p> : null}

            <Button
              type='submit'
              className='h-11 rounded-2xl bg-primary-900 text-base font-semibold text-white hover:bg-primary-800 sm:col-span-2'
            >
              Adaugă adresă de facturare
            </Button>
          </form>

          <div className='flex flex-col gap-3'>
            {billingAddresses.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                Nu ai adăugat încă adrese de facturare.
              </p>
            ) : (
              billingAddresses.map((billingAddress) => {
                const companyLabel = getCompanyLabel(billingAddress);

                return (
                  <article
                    key={billingAddress.id}
                    className='flex flex-col gap-3 rounded-2xl border border-border bg-white p-4'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <p className='text-sm font-semibold text-primary-900'>
                          {billingAddress.lastName} {billingAddress.firstName}
                        </p>
                        <p className='text-muted-foreground text-sm'>{billingAddress.phone}</p>
                      </div>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='rounded-xl'
                        onClick={() => handleRemoveBillingAddress(billingAddress.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                        Șterge
                      </Button>
                    </div>

                    <p className='text-sm text-primary-900'>{billingAddress.address}</p>
                    {companyLabel ? (
                      <p className='text-muted-foreground text-sm'>{companyLabel}</p>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <Button
          type='button'
          disabled
          className='h-11 rounded-2xl bg-primary-900 text-base font-semibold text-white disabled:opacity-70'
        >
          Salvează modificările
        </Button>
      </main>
    </section>
  );
}