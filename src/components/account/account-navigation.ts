import { LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react';

export const accountNavigationItems = [
  {
    href: '/account',
    icon: UserRound,
    label: 'Contul meu'
  },
  {
    href: '/account/security',
    icon: ShieldCheck,
    label: 'Securitate'
  },
  {
    href: '/account/addresses',
    icon: MapPin,
    label: 'Adrese'
  }
] as const;

export const logoutNavigationItem = {
  href: '/logout',
  icon: LogOut,
  label: 'Deconectare'
} as const;
