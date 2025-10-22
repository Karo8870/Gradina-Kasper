'use server';

import { getProfile } from '@/lib/api/auth';

export async function getUserProfileAction() {
  'use server';
  
  try {
    const profile = await getProfile();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}