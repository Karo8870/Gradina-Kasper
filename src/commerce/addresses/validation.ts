import { isValidPhoneNumber } from 'libphonenumber-js/min';
import { z } from 'zod';

import type { Address } from '@/payload-types';

const optionalText = z.string().trim().max(120).optional().or(z.literal(''));

export const addressInputSchema = z.object({
  title: optionalText,
  firstName: z.string().trim().min(1, 'First name is required.').max(80),
  lastName: z.string().trim().min(1, 'Last name is required.').max(80),
  phone: z
    .string()
    .trim()
    .min(6, 'Phone number is required.')
    .max(30)
    .refine(isValidPhoneNumber, 'Phone number is invalid.'),
  addressLine1: z
    .string()
    .trim()
    .min(3, 'Address line 1 is required.')
    .max(160),
  addressLine2: optionalText,
  city: z.string().trim().min(1, 'City is required.').max(100),
  state: z.string().trim().min(1, 'State or region is required.').max(100),
  postalCode: z.string().trim().min(2, 'Postal code is required.').max(20),
  country: z
    .string()
    .trim()
    .length(2, 'Select a country.')
    .transform((value) => value.toUpperCase() as Address['country'])
});

export type AddressInput = z.infer<typeof addressInputSchema>;
export type AddressFormValues = z.input<typeof addressInputSchema>;