import { getPayload } from 'payload';
import config from '@payload-config';
import HeaderClient from './index.client';

export async function Header() {
  const payload = await getPayload({ config });

  const header = await payload.findGlobal({
    slug: 'header'
  });

  return <HeaderClient header={header} />;
}
