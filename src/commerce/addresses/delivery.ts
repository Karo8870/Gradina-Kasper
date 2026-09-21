import type { AddressDTO } from '@/actions/addresses';
import { isValidBillingAddress } from '@/commerce/addresses/billing';

export function isRomanianDeliveryAddress(
  address: AddressDTO | null | undefined
) {
  return Boolean(
    isValidBillingAddress(address) &&
    address?.country?.toUpperCase() === 'RO' &&
    /^\d{6}$/.test(address.postalCode ?? '')
  );
}
