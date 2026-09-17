import { authEmailDocument, authURL, escapeHTML } from './shared';

export function verificationEmailSubject() {
  return 'Confirmă adresa de email';
}

export function verificationEmailHTML({
  email,
  token
}: {
  email: string;
  token: string;
}) {
  return authEmailDocument({
    actionLabel: 'Verifică emailul',
    body: `<p>Salut,</p><p>Confirmă adresa <strong>${escapeHTML(email)}</strong> pentru a-ți activa contul.</p><p>Dacă nu ai creat acest cont, poți ignora acest email.</p>`,
    heading: 'Confirmă adresa de email',
    url: authURL('/verify-email', token)
  });
}
