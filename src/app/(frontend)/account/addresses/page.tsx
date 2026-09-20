import { AccountAddresses } from '@/components/account/addresses';
import envConfig from '../../../../../env.config';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getCMS } from '@/lib/cms';
import { staticMetadata } from '@/lib/static-metadata';

export default async function AccountAddressesPage() {
  const [payload, user] = await Promise.all([getCMS(), getCurrentUser()]);

  if (!user) return null;

  const { docs } = await payload.find({
    collection: 'addresses',
    depth: 0,
    overrideAccess: false,
    sort: '-updatedAt',
    user
  });
  return (
    <AccountAddresses
      initialAddresses={docs}
      mapboxEnabled={envConfig.MAPBOX_ENABLED}
    />
  );
}

export const metadata = staticMetadata(
  'Adrese',
  'Gestionează adresele salvate ale contului tău.',
  '/account/addresses',
  { noIndex: true }
);
