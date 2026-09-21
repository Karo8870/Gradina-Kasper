import { redirect } from 'next/navigation';

import {
  getNextFulfillmentDate,
  type FulfillmentScheduleDTO
} from '@/commerce/checkout';
import { CheckoutPage } from '@/components/checkout/checkout-page';
import { getCurrentUser } from '@/lib/auth/current-user';
import { withFeedback } from '@/lib/auth/utils';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

import envConfig from '../../../../env.config';

export default async function CheckoutRoute() {
  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);

  if (!user) {
    redirect(
      withFeedback(
        '/login',
        'warning',
        'Autentifică-te pentru a continua comanda.',
        { redirect: '/checkout' }
      )
    );
  }

  const [{ docs: addresses }, checkoutSettings, fulfillmentSchedule] =
    await Promise.all([
      payload.find({
        collection: 'addresses',
        depth: 0,
        overrideAccess: false,
        pagination: false,
        sort: '-updatedAt',
        user
      }),
      payload.findGlobal({
        slug: 'checkout-settings',
        depth: 0,
        overrideAccess: false,
        user
      }),
      payload.findGlobal({
        slug: 'fulfillment-schedule',
        depth: 0,
        overrideAccess: false,
        user
      })
    ]);
  const schedule: FulfillmentScheduleDTO = {
    allowedWeekdays: (fulfillmentSchedule.allowedWeekdays ?? ['2', '5']).map(
      Number
    ),
    weekOverrides: (fulfillmentSchedule.weekOverrides ?? []).map(
      (override) => ({
        allowedWeekdays: (override.allowedWeekdays ?? []).map(Number),
        weekStart: override.weekStart.slice(0, 10)
      })
    )
  };

  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6'>
      <CheckoutPage
        fulfillmentDate={getNextFulfillmentDate(schedule)}
        initialAddresses={addresses}
        mapboxEnabled={envConfig.MAPBOX_ENABLED}
        settings={{
          deliveryFee: checkoutSettings.deliveryFee ?? 5000,
          deliveryVATRate: checkoutSettings.deliveryVATRate ?? 21,
          minimumDeliverySubtotal:
            checkoutSettings.minimumDeliverySubtotal ?? 10000,
          productVATRate: checkoutSettings.productVATRate ?? 11
        }}
      />
    </div>
  );
}

export const metadata = staticMetadata(
  'Checkout',
  'Finalizează comanda și alege modalitatea de primire.',
  '/checkout',
  { noIndex: true }
);
