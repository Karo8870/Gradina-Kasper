import type { Address } from '@/payload-types';

export type MapboxAddressFields = {
  mapboxFullAddress?: string | null;
  mapboxLatitude?: number | null;
  mapboxLongitude?: number | null;
  mapboxPlaceID?: string | null;
  mapboxVerified?: boolean | null;
};

const normalizeCountry = (value?: string | number | null) =>
  value
    ?.toString()
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const isRomanianAddress = (
  address?: (Partial<Address> & MapboxAddressFields) | null
) => {
  const country = normalizeCountry(address?.country);

  return country === 'ro' || country === 'romania' || country === '642';
};
