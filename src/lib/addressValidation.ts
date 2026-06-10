import type { Address } from '@/payload-types';

export type MapboxAddressFields = {
  mapboxFullAddress?: string | null;
  mapboxLatitude?: number | null;
  mapboxLongitude?: number | null;
  mapboxPlaceID?: string | null;
  mapboxVerified?: boolean | null;
};

const normalizeCity = (value?: string | null) =>
  value
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const isVerifiedBrasovAddress = (
  address?: (Partial<Address> & MapboxAddressFields) | null
) =>
  Boolean(address?.mapboxVerified && normalizeCity(address.city) === 'brasov');
