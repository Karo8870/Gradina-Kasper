import type { ComponentType, SVGProps } from 'react';

import { GoogleLogo } from '@/components/icons/google-logo';

export const socialProviders = [
  {
    icon: GoogleLogo,
    id: 'google',
    loginLabel: 'Continuă cu Google',
    name: 'Google'
  }
] as const satisfies ReadonlyArray<{
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  id: string;
  loginLabel: string;
  name: string;
}>;

export type SocialProvider = (typeof socialProviders)[number];
export type SocialProviderId = SocialProvider['id'];

export function getSocialProvider(id: string): SocialProvider | undefined {
  return socialProviders.find((provider) => provider.id === id);
}
