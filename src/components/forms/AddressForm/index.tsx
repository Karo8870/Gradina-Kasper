'use client';

import { AuthSubmitButton } from '@/components/forms/auth/shared/AuthSubmitButton';
import { FormError } from '@/components/forms/FormError';
import { FormItem } from '@/components/forms/FormItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MapboxAddressFields } from '@/lib/addressValidation';
import { Address, Config } from '@/payload-types';
import { deepMergeSimple } from 'payload/shared';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput, {
  Country,
  getCountries,
  getCountryCallingCode
} from 'react-phone-number-input';
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react';

import { titles } from './constants';

type AddressFormValues = {
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
} & MapboxAddressFields;

type MapboxSuggestion = {
  addressLine1?: string | null;
  city?: string | null;
  country?: string | null;
  fullAddress?: string | null;
  id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  state?: string | null;
};

type Props = {
  addressID?: Config['db']['defaultIDType'];
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & {
    country?: string;
  } & MapboxAddressFields;
  callback?: (data: Partial<Address>) => void;
  skipSubmission?: boolean;
};

const countryNames = new Intl.DisplayNames(['ro'], { type: 'region' });

const labels = getCountries().reduce<Record<string, string>>(
  (acc, country) => {
    acc[country] =
      `${countryNames.of(country) || country} +${getCountryCallingCode(country)}`;
    return acc;
  },
  {
    ZZ: 'Alege o țară',
    country: 'Țară',
    ext: 'ext.',
    phone: 'Telefon'
  }
);

export const AddressForm: React.FC<Props> = ({
  addressID,
  initialData,
  callback,
  skipSubmission
}) => {
  const [mapboxQuery, setMapboxQuery] = useState('');
  const [mapboxSuggestions, setMapboxSuggestions] = useState<
    MapboxSuggestion[]
  >([]);
  const [mapboxMessage, setMapboxMessage] = useState<null | string>(null);
  const [isSearchingMapbox, setIsSearchingMapbox] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<AddressFormValues>({
    defaultValues: {
      ...initialData,
      country: initialData?.country || 'RO',
      phone: initialData?.phone || '',
      mapboxVerified: initialData?.mapboxVerified || false,
      mapboxPlaceID: initialData?.mapboxPlaceID || '',
      mapboxFullAddress: initialData?.mapboxFullAddress || '',
      mapboxLatitude: initialData?.mapboxLatitude || null,
      mapboxLongitude: initialData?.mapboxLongitude || null
    }
  });

  const { createAddress, updateAddress } = useAddresses();
  const defaultCountry = useMemo(
    () => (initialData?.country || 'RO') as Country,
    [initialData?.country]
  );

  const clearMapboxDetails = useCallback(() => {
    setValue('mapboxVerified', false);
    setValue('mapboxPlaceID', '');
    setValue('mapboxFullAddress', '');
    setValue('mapboxLatitude', null);
    setValue('mapboxLongitude', null);
    setMapboxMessage('Adresa a fost modificată manual.');
  }, [setValue]);

  const searchMapbox = useCallback(async () => {
    const query = mapboxQuery.trim();

    if (!query) {
      setMapboxSuggestions([]);
      setMapboxMessage('Scrie o adresă pentru căutare.');
      return;
    }

    setIsSearchingMapbox(true);
    setMapboxMessage(null);

    try {
      const response = await fetch(
        `/api/mapbox/search?q=${encodeURIComponent(query)}`
      );
      const data = (await response.json()) as {
        error?: string;
        suggestions?: MapboxSuggestion[];
      };

      if (!response.ok) {
        throw new Error(data.error || 'Nu am putut căuta adresa.');
      }

      setMapboxSuggestions(data.suggestions || []);
      if (!data.suggestions?.length) {
        setMapboxMessage('Nu am găsit adrese pentru căutarea introdusă.');
      }
    } catch (error) {
      setMapboxMessage(
        error instanceof Error ? error.message : 'Nu am putut căuta adresa.'
      );
    } finally {
      setIsSearchingMapbox(false);
    }
  }, [mapboxQuery]);

  const selectMapboxSuggestion = useCallback(
    (suggestion: MapboxSuggestion) => {
      setValue('addressLine1', suggestion.addressLine1 || '', {
        shouldValidate: true
      });
      setValue('city', suggestion.city || '', { shouldValidate: true });
      setValue('state', suggestion.state || '', { shouldValidate: true });
      setValue('postalCode', suggestion.postalCode || '', {
        shouldValidate: true
      });
      setValue('country', suggestion.country || 'RO', {
        shouldValidate: true
      });
      setValue('mapboxVerified', true);
      setValue('mapboxPlaceID', suggestion.id || '');
      setValue('mapboxFullAddress', suggestion.fullAddress || '');
      setValue('mapboxLatitude', suggestion.latitude || null);
      setValue('mapboxLongitude', suggestion.longitude || null);
      setMapboxQuery(suggestion.fullAddress || suggestion.addressLine1 || '');
      setMapboxSuggestions([]);
      setMapboxMessage('Adresa a fost completată cu ajutorul Mapbox.');
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: AddressFormValues) => {
      const newData = deepMergeSimple(initialData || {}, data);

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, newData);
        } else {
          await createAddress(newData);
        }
      }

      if (callback) {
        callback(newData);
      }
    },
    [
      initialData,
      skipSubmission,
      callback,
      addressID,
      updateAddress,
      createAddress
    ]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='mb-5 flex flex-col gap-3'>
        <FormItem>
          <Label
            htmlFor='mapboxSearch'
            className='mb-1 text-sm text-neutral-700'
          >
            Caută adresa cu Mapbox
          </Label>
          <div className='flex gap-2'>
            <Input
              id='mapboxSearch'
              className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
              onChange={(event) => setMapboxQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void searchMapbox();
                }
              }}
              placeholder='Strada, număr, oraș'
              value={mapboxQuery}
            />
            <button
              className='bg-primary-900 hover:bg-primary-950 h-11 rounded-full px-5 text-sm font-semibold text-white disabled:opacity-60'
              disabled={isSearchingMapbox}
              onClick={(event) => {
                event.preventDefault();
                void searchMapbox();
              }}
              type='button'
            >
              {isSearchingMapbox ? 'Caut...' : 'Caută'}
            </button>
          </div>
          <p className='mt-1 text-xs text-neutral-600'>
            Poți completa manual adresa sau selecta o sugestie Mapbox.
          </p>
          {mapboxMessage && (
            <p className='mt-2 text-xs font-medium text-primary-900'>
              {mapboxMessage}
            </p>
          )}
          {mapboxSuggestions.length > 0 && (
            <ul className='mt-2 rounded-xl border border-neutral-200 bg-white'>
              {mapboxSuggestions.map((suggestion) => (
                <li key={suggestion.id || suggestion.fullAddress}>
                  <button
                    className='block w-full border-b border-neutral-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-neutral-50'
                    onClick={(event) => {
                      event.preventDefault();
                      selectMapboxSuggestion(suggestion);
                    }}
                    type='button'
                  >
                    <span className='block font-medium text-primary-900'>
                      {suggestion.fullAddress || suggestion.addressLine1}
                    </span>
                    <span className='text-xs text-neutral-600'>
                      Adresă din România
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FormItem>

        <div className='flex flex-col gap-3 md:flex-row'>
          <FormItem className='shrink md:w-40'>
            <Label htmlFor='title' className='mb-1 text-sm text-neutral-700'>
              Titlu
            </Label>
            <select
              {...register('title')}
              defaultValue={initialData?.title || ''}
              onChange={(event) =>
                setValue('title', event.target.value, { shouldValidate: true })
              }
              className='h-11 w-full rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none'
            >
              <option value=''>Alege</option>
              {titles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            {errors.title && <FormError message={errors.title.message} />}
          </FormItem>

          <FormItem className='grow'>
            <Label
              htmlFor='firstName'
              className='mb-1 text-sm text-neutral-700'
            >
              Prenume*
            </Label>
            <Input
              id='firstName'
              autoComplete='given-name'
              className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
              {...register('firstName', {
                required: 'Prenumele este obligatoriu.'
              })}
            />
            {errors.firstName && (
              <FormError message={errors.firstName.message} />
            )}
          </FormItem>

          <FormItem className='grow'>
            <Label htmlFor='lastName' className='mb-1 text-sm text-neutral-700'>
              Nume*
            </Label>
            <Input
              autoComplete='family-name'
              id='lastName'
              className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
              {...register('lastName', {
                required: 'Numele este obligatoriu.'
              })}
            />
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <Label htmlFor='phone' className='mb-1 text-sm text-neutral-700'>
            Număr de telefon*
          </Label>
          <Controller
            rules={{
              required: 'Numărul de telefon este obligatoriu.'
            }}
            control={control}
            name='phone'
            render={({ field }) => (
              <PhoneInput
                labels={labels}
                defaultCountry={defaultCountry}
                international
                countryCallingCodeEditable={false}
                value={field.value || ''}
                onChange={(value) => field.onChange(value || '')}
                onCountryChange={(country) => {
                  if (country) {
                    setValue('country', country, { shouldValidate: true });
                  }
                }}
                countrySelectProps={{
                  unicodeFlags: true
                }}
                numberInputProps={{
                  className:
                    'h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
                }}
                className='flex items-stretch'
                autoComplete='tel'
                placeholder='Număr de telefon'
              />
            )}
          />
          {errors.phone && <FormError message={errors.phone.message} />}
        </FormItem>

        <FormItem>
          <Label
            htmlFor='addressLine1'
            className='mb-1 text-sm text-neutral-700'
          >
            Adresă, linia 1*
          </Label>
          <Input
            id='addressLine1'
            autoComplete='address-line1'
            className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
            {...register('addressLine1', {
              onChange: clearMapboxDetails,
              required: 'Prima linie a adresei este obligatorie.'
            })}
          />
          {errors.addressLine1 && (
            <FormError message={errors.addressLine1.message} />
          )}
        </FormItem>

        <FormItem>
          <Label
            htmlFor='addressLine2'
            className='mb-1 text-sm text-neutral-700'
          >
            Adresă, linia 2
          </Label>
          <Input
            id='addressLine2'
            autoComplete='address-line2'
            className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
            {...register('addressLine2', {
              onChange: clearMapboxDetails
            })}
          />
          {errors.addressLine2 && (
            <FormError message={errors.addressLine2.message} />
          )}
        </FormItem>

        <FormItem>
          <Label htmlFor='city' className='mb-1 text-sm text-neutral-700'>
            Oraș*
          </Label>
          <Input
            id='city'
            autoComplete='address-level2'
            className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
            {...register('city', {
              onChange: clearMapboxDetails,
              required: 'Orașul este obligatoriu.'
            })}
          />
          {errors.city && <FormError message={errors.city.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor='state' className='mb-1 text-sm text-neutral-700'>
            Județ / Regiune
          </Label>
          <Input
            id='state'
            autoComplete='address-level1'
            className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
            {...register('state', {
              onChange: clearMapboxDetails
            })}
          />
          {errors.state && <FormError message={errors.state.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor='postalCode' className='mb-1 text-sm text-neutral-700'>
            Cod poștal*
          </Label>
          <Input
            id='postalCode'
            className='h-11 rounded-xl border-0 bg-neutral-100 px-3 text-sm text-primary-900 shadow-none placeholder:text-neutral-700'
            {...register('postalCode', {
              onChange: clearMapboxDetails,
              required: 'Codul poștal este obligatoriu.'
            })}
          />
          {errors.postalCode && (
            <FormError message={errors.postalCode.message} />
          )}
        </FormItem>

        <input type='hidden' {...register('mapboxPlaceID')} />
        <input type='hidden' {...register('mapboxFullAddress')} />
        <input
          className='hidden'
          type='checkbox'
          {...register('mapboxVerified')}
        />
      </div>

      <AuthSubmitButton loading={false}>Salvează adresa</AuthSubmitButton>
    </form>
  );
};
