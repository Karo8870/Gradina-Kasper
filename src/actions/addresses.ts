'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  addressInputSchema,
  type AddressFormValues,
  type AddressInput
} from '@/commerce/addresses/validation';
import type { Address } from '@/payload-types';
import {
  searchMapboxAddresses,
  type MapboxAddressSuggestion
} from '@/lib/mapbox';
import { getBetterAuthRequest } from '@/lib/auth/server';

const addressIDSchema = z.number().int().positive();
const mapboxSearchSchema = z.object({
  country: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  query: z.string().trim().min(3).max(256)
});

export type AddressDTO = Pick<
  Address,
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'country'
  | 'firstName'
  | 'id'
  | 'lastName'
  | 'phone'
  | 'postalCode'
  | 'state'
  | 'title'
>;

type AddressActionResult =
  { address: AddressDTO; success: true } | { message: string; success: false };
type AddressActionInput = AddressFormValues | AddressInput;

async function getAuthenticatedPayload() {
  const { payload, requestHeaders } = await getBetterAuthRequest();
  const { user } = await payload.auth({ headers: requestHeaders });

  return user ? { payload, user } : undefined;
}

function toAddressDTO(address: Address): AddressDTO {
  return {
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    country: address.country,
    firstName: address.firstName,
    id: address.id,
    lastName: address.lastName,
    phone: address.phone,
    postalCode: address.postalCode,
    state: address.state,
    title: address.title
  };
}

export async function createAddressAction(
  input: AddressActionInput
): Promise<AddressActionResult> {
  const parsed = addressInputSchema.safeParse(input);
  if (!parsed.success) {
    return { message: 'Datele adresei nu sunt valide.', success: false };
  }

  try {
    const authenticated = await getAuthenticatedPayload();
    if (!authenticated)
      return { message: 'Autentificare necesară.', success: false };

    const address = await authenticated.payload.create({
      collection: 'addresses',
      data: parsed.data,
      depth: 0,
      overrideAccess: false,
      user: authenticated.user
    });
    revalidatePath('/account/addresses');

    return { address: toAddressDTO(address), success: true };
  } catch {
    return { message: 'Adresa nu a putut fi salvată.', success: false };
  }
}

export async function deleteAddressAction(input: {
  id: number;
}): Promise<{ success: boolean }> {
  const parsed = addressIDSchema.safeParse(input.id);
  if (!parsed.success) return { success: false };

  try {
    const authenticated = await getAuthenticatedPayload();
    if (!authenticated) return { success: false };

    await authenticated.payload.delete({
      collection: 'addresses',
      id: parsed.data,
      overrideAccess: false,
      user: authenticated.user
    });
    revalidatePath('/account/addresses');

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function searchMapboxAddressesAction(input: {
  country: string;
  query: string;
}): Promise<MapboxAddressSuggestion[]> {
  const parsed = mapboxSearchSchema.safeParse(input);
  if (!parsed.success) return [];

  const authenticated = await getAuthenticatedPayload();
  if (!authenticated) return [];

  return searchMapboxAddresses(parsed.data).catch(() => []);
}
