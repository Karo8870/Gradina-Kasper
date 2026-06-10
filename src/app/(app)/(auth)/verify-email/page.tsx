import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import payloadConfig from '@payload-config';

interface SearchParams {
  token?: string;
}

export default async function ({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;

  const payload = await getPayload({ config: payloadConfig });

  if (!token) {
    redirect(
      `/login?error=${encodeURIComponent('Token de autentificare invalid')}`
    );
  }

  const result = await payload.verifyEmail({
    collection: 'users',
    token
  });

  if (result) {
    redirect(
      `/login?success=${encodeURIComponent('Email verificat cu succes, vă rugăm să vă autentificați.')}`
    );
  }

  redirect(
    `/login?error=${encodeURIComponent('Token de autentificare invalid.')}`
  );
}
