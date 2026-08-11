import { getPayload } from 'payload';
import config from '@payload-config';
import HeaderClient from './index.client';

export async function Header() {
  const payload = await getPayload({ config });

  const [header, checkoutSettings] = await Promise.all([
    payload.findGlobal({
      slug: 'header'
    }),
    payload.findGlobal({
      slug: 'checkout-settings'
    })
  ]);

  return (
    <HeaderClient
      header={header}
      minimumDeliveryOrderAmount={checkoutSettings.minimumDeliveryOrderAmount}
    />
  );
}
