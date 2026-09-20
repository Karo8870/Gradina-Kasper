'use client';

import { defaultCountries } from '@payloadcms/plugin-ecommerce/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus, Route, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  createAddressAction,
  searchMapboxAddressesAction,
  type AddressDTO
} from '@/actions/addresses';
import {
  addressInputSchema,
  type AddressFormValues,
  type AddressInput
} from '@/commerce/addresses/validation';
import {
  FormField,
  FormStatus,
  FormSubmitButton
} from '@/components/form-components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const emptyAddress: AddressFormValues = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  country: '',
  firstName: '',
  lastName: '',
  phone: '',
  postalCode: '',
  state: '',
  title: ''
};

const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Mx.', 'Other'];
const countryNames = new Intl.DisplayNames(['ro'], { type: 'region' });

export function AddressCreatorModal({
  mapboxEnabled,
  onCreated
}: {
  mapboxEnabled: boolean;
  onCreated?: (address: AddressDTO) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size='lg' />}>
        <Plus data-icon='inline-start' />
        Adaugă adresă
      </DialogTrigger>
      {open ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adresă nouă</DialogTitle>
            <DialogDescription>
              Selectează țara înainte de a căuta o adresă cu Mapbox.
            </DialogDescription>
          </DialogHeader>
          <AddressCreatorForm
            mapboxEnabled={mapboxEnabled}
            onCreated={(address) => {
              onCreated?.(address);
              setOpen(false);
            }}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function AddressCreatorForm({
  mapboxEnabled,
  onCreated
}: {
  mapboxEnabled: boolean;
  onCreated: (address: AddressDTO) => void;
}) {
  const [mapboxQuery, setMapboxQuery] = useState('');
  const [mapboxResults, setMapboxResults] = useState<
    Awaited<ReturnType<typeof searchMapboxAddressesAction>>
  >([]);
  const [addressSelected, setAddressSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [manualEntry, setManualEntry] = useState(!mapboxEnabled);
  const [status, setStatus] = useState<string | null>(null);
  const form = useForm<AddressFormValues, undefined, AddressInput>({
    defaultValues: emptyAddress,
    resolver: zodResolver(addressInputSchema)
  });
  const country = form.watch('country');

  useEffect(() => {
    const query = mapboxQuery.trim();

    if (
      !mapboxEnabled ||
      manualEntry ||
      addressSelected ||
      !country ||
      query.length < 3
    ) {
      setMapboxResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      void searchMapboxAddressesAction({ country, query })
        .then((results) => {
          if (cancelled) return;
          setMapboxResults(results);
          setStatus(
            results.length ? null : 'Nu am găsit adrese pentru această căutare.'
          );
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [addressSelected, country, manualEntry, mapboxEnabled, mapboxQuery]);

  async function onSubmit(values: AddressInput) {
    setStatus(null);
    const result = await createAddressAction(values);

    if (result.success) {
      onCreated(result.address);
      return;
    }

    setStatus(result.message);
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className='flex flex-col gap-3'>
        <h3 className='font-medium'>Date de contact</h3>
        <div className='grid gap-4 sm:grid-cols-[9rem_1fr_1fr]'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='title'>Titlu</Label>
            <Controller
              control={form.control}
              name='title'
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value ?? '')}
                  value={field.value || null}
                >
                  <SelectTrigger className='w-full' id='title'>
                    <SelectValue placeholder='Alege' />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <FormField
            autoComplete='given-name'
            error={form.formState.errors.firstName}
            label='Prenume'
            registration={form.register('firstName')}
          />
          <FormField
            autoComplete='family-name'
            error={form.formState.errors.lastName}
            label='Nume'
            registration={form.register('lastName')}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='phone'>Număr de telefon</Label>
          <Controller
            control={form.control}
            name='phone'
            render={({ field }) => (
              <PhoneInput
                aria-describedby={
                  form.formState.errors.phone ? 'phone-error' : undefined
                }
                aria-invalid={Boolean(form.formState.errors.phone)}
                autoComplete='tel'
                id='phone'
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder='Număr de telefon'
                value={field.value}
              />
            )}
          />
          {form.formState.errors.phone?.message ? (
            <p className='text-destructive text-sm' id='phone-error'>
              {form.formState.errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className='flex flex-col gap-3'>
        <h3 className='font-medium'>Adresă</h3>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='country'>Țară</Label>
          <Controller
            control={form.control}
            name='country'
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value ?? '');
                  setAddressSelected(false);
                  setMapboxQuery('');
                  setMapboxResults([]);
                  setStatus(null);
                }}
                value={field.value || null}
              >
                <SelectTrigger
                  aria-invalid={Boolean(form.formState.errors.country)}
                  className='w-full'
                  id='country'
                >
                  <SelectValue placeholder='Alege țara'>
                    {field.value
                      ? (countryNames.of(field.value) ?? field.value)
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {defaultCountries.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {countryNames.of(item.value) ?? item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.country?.message ? (
            <p className='text-destructive text-sm'>
              {form.formState.errors.country.message}
            </p>
          ) : null}
        </div>
      </div>

      {mapboxEnabled && !manualEntry ? (
        <div className='flex flex-col gap-2'>
          <Label htmlFor='mapbox-search'>Caută adresa</Label>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              className='pl-9'
              disabled={!country}
              id='mapbox-search'
              onChange={(event) => {
                setMapboxQuery(event.target.value);
                setAddressSelected(false);
                setStatus(null);
              }}
              placeholder={
                country
                  ? 'Începe să scrii adresa, de ex. Strada Principală 12'
                  : 'Alege mai întâi țara'
              }
              value={mapboxQuery}
            />
          </div>
          {isSearching ? (
            <p className='text-muted-foreground text-sm'>Se caută...</p>
          ) : null}
          {mapboxResults.length ? (
            <div className='border-border max-h-72 overflow-y-auto rounded-lg border'>
              <div className='flex flex-col p-1'>
                {mapboxResults.map((result) => {
                  const ResultIcon =
                    result.featureType === 'address' ? MapPin : Route;

                  return (
                    <Button
                      className='h-auto w-full justify-start gap-3 px-3 py-2 text-left'
                      key={result.id}
                      onClick={() => {
                        form.setValue('addressLine1', result.addressLine1, {
                          shouldValidate: true
                        });
                        form.setValue('city', result.city, {
                          shouldValidate: true
                        });
                        form.setValue('country', result.country, {
                          shouldValidate: true
                        });
                        form.setValue('postalCode', result.postalCode, {
                          shouldValidate: true
                        });
                        form.setValue('state', result.state, {
                          shouldValidate: true
                        });
                        setMapboxQuery(result.formattedAddress);
                        setMapboxResults([]);
                        setAddressSelected(true);
                        setStatus(null);
                      }}
                      type='button'
                      variant='ghost'
                    >
                      <ResultIcon className='size-5 self-start' />
                      <span className='min-w-0'>
                        <span className='block truncate font-semibold'>
                          {result.addressLine1}
                        </span>
                        <span className='text-muted-foreground block truncate font-normal'>
                          {result.description}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {!addressSelected ? (
            <Button
              className='h-auto self-start p-0'
              onClick={() => {
                setManualEntry(true);
                setMapboxResults([]);
                setStatus(null);
              }}
              type='button'
              variant='link'
            >
              Completează adresa manual
            </Button>
          ) : null}
        </div>
      ) : null}

      {manualEntry || addressSelected ? (
        <div className='flex flex-col gap-4'>
          <FormField
            autoComplete='address-line1'
            error={form.formState.errors.addressLine1}
            label='Adresă, linia 1'
            registration={form.register('addressLine1')}
          />
          <FormField
            autoComplete='address-line2'
            error={form.formState.errors.addressLine2}
            label='Adresă, linia 2'
            registration={form.register('addressLine2')}
          />
          <div className='grid gap-4 sm:grid-cols-3'>
            <FormField
              autoComplete='address-level2'
              error={form.formState.errors.city}
              label='Oraș'
              registration={form.register('city')}
            />
            <FormField
              autoComplete='address-level1'
              error={form.formState.errors.state}
              label='Județ / regiune'
              registration={form.register('state')}
            />
            <FormField
              autoComplete='postal-code'
              error={form.formState.errors.postalCode}
              label='Cod poștal'
              registration={form.register('postalCode')}
            />
          </div>
        </div>
      ) : null}

      {status ? <FormStatus kind='message'>{status}</FormStatus> : null}

      <div className='flex justify-end gap-3'>
        <DialogClose render={<Button type='button' variant='outline' />}>
          Renunță
        </DialogClose>
        <FormSubmitButton
          disabled={!manualEntry && !addressSelected}
          isSubmitting={form.formState.isSubmitting}
          pendingLabel='Se salvează adresa...'
        >
          Salvează adresa
        </FormSubmitButton>
      </div>
    </form>
  );
}
