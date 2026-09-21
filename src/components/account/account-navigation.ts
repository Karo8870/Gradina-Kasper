import {
  LogOut,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound
} from 'lucide-react';

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
  },
  {
    href: '/account/orders',
    icon: ReceiptText,
    label: 'Comenzi'
  }
] as const;

export const logoutNavigationItem = {
  href: '/logout',
  icon: LogOut,
  label: 'Deconectare'
} as const;
