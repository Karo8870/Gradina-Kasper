import { authEmailDocument, authURL } from './shared';

export function passwordResetEmailSubject() {
  return 'Resetează parola';
}

export function passwordResetEmailHTML({ token }: { token: string }) {
  return authEmailDocument({
    actionLabel: 'Resetează parola',
    body: '<p>Am primit o cerere de resetare a parolei.</p><p>Linkul expiră în 15 minute. Dacă nu ai solicitat schimbarea, poți ignora acest email.</p>',
    heading: 'Resetează parola',
    url: authURL('/confirm-password-reset', token)
  });
}
