'use client';

import AuthButton from '@/components/buttons/auth-button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  nameValidator,
  phoneNumberValidator
} from '@/lib/validators/profile-validators';
import FormInput from '@/components/forms/form-input';
import { getProfile, updateProfile } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { Select, SelectItem } from '@heroui/select';
import { counties } from '@/lib/data/counties';
import { useState } from 'react';

//     afm: string;
//     countyID: number;
//     district: string;
//     phone1: string;
//     phone2: string;
//     fax: string;
//     email: string;
//     name: string;
//     address: string;
//     zip: string;

const schema = z.object({
  firstName: nameValidator,
  lastName: nameValidator,
  phoneNumber: phoneNumberValidator,
  secondPhoneNumber: phoneNumberValidator.optional(),
  fax: phoneNumberValidator.optional(),
  address: z.string().min(1, 'Adresa este obligatorie'),
  zip: z
    .string()
    .length(6, 'Codul poștal trebuie să aibă 6 cifre')
    .regex(/^\d+$/, 'Codul poștal poate conține numai cifre'),
  sector: z.number(),
  district: z.string(),
  afm: z.string(),
  city: z.string()
});

export default function ProfileForm({
  profile
}: {
  profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>;
}) {
  const [value, setValue] = useState<string | undefined>(profile.county);
  const [value2, setValue2] = useState<string | undefined>(profile.sector);

  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<z.infer<typeof schema>>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    values: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phone,
      address: profile.address,
      fax: profile.fax,
      zip: profile.zip,
      secondPhoneNumber: profile.secondPhone,
      district: '',
      sector: 0,
      afm: profile.afm,
      city: profile.city
    }
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await updateProfile(
      data.firstName,
      data.lastName,
      data.phoneNumber,
      data.afm,
      data.zip,
      data.city,
      value ?? '',
      value2 ?? '',
      data.fax ?? '',
      data.secondPhoneNumber ?? '',
      data.address
    );

    router.push('/');
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label='Nume'
        error={errors.lastName}
        register={register('lastName')}
      />
      <FormInput
        label='Prenume'
        error={errors.firstName}
        register={register('firstName')}
      />
      <FormInput
        label='Număr de telefon'
        error={errors.phoneNumber}
        register={register('phoneNumber')}
      />
      <FormInput
        label='Număr de telefon secundar (opțional)'
        error={errors.secondPhoneNumber}
        register={register('secondPhoneNumber')}
      />
      <FormInput
        label='Fax (opțional)'
        error={errors.fax}
        register={register('fax')}
      />
      <Select
        selectedKeys={value ? [value] : []}
        onSelectionChange={(val) => {
          setValue(val.currentKey);
        }}
        label='Selectează județul'
      >
        {counties.map((county) => (
          <SelectItem key={county.id}>{county.name}</SelectItem>
        ))}
      </Select>
      {value === '10' ? (
        <Select
          value={value2}
          onSelectionChange={(val) => {
            setValue2(val.currentKey);
          }}
          label='Selectează sectorul'
        >
          {[
            'Sectorul 1',
            'Sectorul 2',
            'Sectorul 3',
            'Sectorul 4',
            'Sectorul 5',
            'Sectorul 6'
          ].map((district) => (
            <SelectItem key={district}>{district}</SelectItem>
          ))}
        </Select>
      ) : (
        ''
      )}
      <FormInput label='Oraș' error={errors.city} register={register('city')} />
      <FormInput
        label='Adresă'
        error={errors.address}
        register={register('address')}
      />
      <FormInput
        label='Cod poștal'
        error={errors.zip}
        register={register('zip')}
      />
      <AuthButton>Actualizează profilul</AuthButton>
    </form>
  );
}
