import type { AddressDTO } from '@/actions/addresses';
import { addressInputSchema } from '@/commerce/addresses/validation';

export function isValidBillingAddress(address: AddressDTO | null | undefined) {
  return addressInputSchema.safeParse(address).success;
}
