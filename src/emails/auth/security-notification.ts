import { authEmailDocument } from './shared';

export type SecurityNotification =
  'backup-codes-regenerated' | 'two-factor-disabled' | 'two-factor-enabled';

const content = {
  'backup-codes-regenerated': {
    body: '<p>Codurile de rezervă pentru autentificarea în doi pași au fost regenerate.</p><p>Dacă nu ai făcut această modificare, schimbă parola și deconectează celelalte sesiuni din pagina de securitate a contului.</p>',
    heading: 'Coduri de rezervă regenerate',
    subject: 'Codurile de rezervă au fost regenerate'
  },
  'two-factor-disabled': {
    body: '<p>Autentificarea în doi pași a fost dezactivată pentru contul tău.</p><p>Dacă nu ai făcut această modificare, schimbă parola imediat și verifică sesiunile active.</p>',
    heading: 'Autentificare în doi pași dezactivată',
    subject: 'Autentificarea în doi pași a fost dezactivată'
  },
  'two-factor-enabled': {
    body: '<p>Autentificarea în doi pași a fost activată pentru contul tău.</p><p>De acum, conectările noi vor necesita și metoda suplimentară de verificare configurată.</p>',
    heading: 'Autentificare în doi pași activată',
    subject: 'Autentificarea în doi pași a fost activată'
  }
} satisfies Record<
  SecurityNotification,
  { body: string; heading: string; subject: string }
>;

export function securityNotificationEmailSubject(
  notification: SecurityNotification
) {
  return content[notification].subject;
}

export function securityNotificationEmailHTML(
  notification: SecurityNotification
) {
  return authEmailDocument(content[notification]);
}
