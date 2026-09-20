import { authEmailDocument, escapeHTML } from './shared';

export function twoFactorOTPEmailSubject() {
  return 'Codul tău de autentificare';
}

export function twoFactorOTPEmailHTML({ otp }: { otp: string }) {
  const code = escapeHTML(otp);

  return authEmailDocument({
    body: `<p>Folosește codul de mai jos pentru a finaliza autentificarea:</p><p style="margin:24px 0;font-size:30px;font-weight:700">${code}</p><p>Codul expiră în 5 minute. Dacă nu ai încercat să te autentifici, îți recomandăm să schimbi parola contului.</p>`,
    heading: 'Confirmă autentificarea'
  });
}
