'use server';

import { initAdmin } from '../../../firebase-admin.config';
import { db } from '@/db/db';
import { users } from '@/db/schema/users';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
) {
  await initAdmin();

  const user = await db
    .insert(users)
    .values({
      email,
      firstName,
      lastName,
      phone1: phone,
      afm: '',
      address: '',
      city: '',
      fax: '',
      phone2: '',
      county: '',
      sector: '',
      zip: ''
    })
    .returning({
      id: users.id
    });

  await getAuth().createUser({
    email,
    password,
    uid: user[0].id.toString()
  });
}

export async function login(token: string) {
  await initAdmin();

  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  const sessionCookie = await getAuth().createSessionCookie(token, {
    expiresIn
  });
  
  (await cookies()).set('session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true
  });
}

export async function logout() {
  (await cookies()).delete('session');
}

export async function getSession() {
  await initAdmin();

  try {
    return await getAuth().verifySessionCookie(
      (await cookies()).get('session')?.value!,
      true
    );
  } catch {
    return null;
  }
}

export async function getProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone1,
        address: users.address,
        afm: users.afm,
        secondPhone: users.phone2,
        fax: users.fax,
        zip: users.zip,
        county: users.county,
        sector: users.sector,
        city: users.city
      })
      .from(users)
      .where(eq(users.id, +session?.uid!))
      .limit(1)
  )[0];
}

export async function updateProfile(
  firstName: string,
  lastName: string,
  phone: string,
  afm: string,
  zip: string,
  city: string,
  county: string,
  sector: string,
  fax: string,
  phone2: string,
  address: string
) {
  const session = await getSession();

  await db
    .update(users)
    .set({
      firstName,
      lastName,
      phone1: phone,
      afm,
      zip,
      city,
      county,
      sector,
      fax,
      phone2,
      address
    })
    .where(eq(users.id, +session?.uid!));
}

export async function isAdmin() {
  const session = await getSession();

  return session?.admin ? session : null;
}
