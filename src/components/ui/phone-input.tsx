'use client';

import PhoneInputPrimitive, {
  getCountries,
  getCountryCallingCode,
  type Country,
  type Value
} from 'react-phone-number-input/input';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

function countryFlag(country: Country) {
  return String.fromCodePoint(
    ...country.split('').map((letter) => 127397 + letter.charCodeAt(0))
  );
}

type PhoneInputProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  autoComplete?: string;
  defaultCountry?: Country;
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function PhoneInput({
  defaultCountry = 'RO',
  disabled,
  onChange,
  value,
  ...props
}: PhoneInputProps) {
  const [country, setCountry] = useState<Country>(defaultCountry);

  return (
    <div className='flex gap-2'>
      <Select
        disabled={disabled}
        onValueChange={(nextCountry) => {
          if (!nextCountry) return;

          setCountry(nextCountry as Country);
          onChange('');
        }}
        value={country}
      >
        <SelectTrigger
          aria-label={`Prefix telefonic ${country}`}
          className='w-16 shrink-0'
        >
          <SelectValue>{countryFlag(country)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {getCountries().map((countryCode) => (
            <SelectItem key={countryCode} value={countryCode}>
              <span aria-hidden='true'>{countryFlag(countryCode)}</span>
              <span>+{getCountryCallingCode(countryCode)}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <PhoneInputPrimitive
        {...props}
        className='flex-1'
        country={country}
        disabled={disabled}
        inputComponent={Input}
        international
        onChange={(nextValue) => onChange(nextValue ?? '')}
        value={value as Value | undefined}
        withCountryCallingCode
      />
    </div>
  );
}
