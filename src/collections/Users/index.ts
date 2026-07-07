import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess';
import { publicAccess } from '@/access/publicAccess';
import { adminOrSelf } from '@/access/adminOrSelf';
import { checkRole } from '@/access/utilities';

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf
  },
  admin: {
    group: 'Users',
    defaultColumns: ['email', 'roles'],
    useAsTitle: 'email'
  },
  auth: {
    forgotPassword: {
      expiration: 1000 * 60 * 15,
      generateEmailSubject(params) {
        const { req, user } = params!;

        return `Resetare parolă`;
      },

      generateEmailHTML(params) {
        const { req, user, token } = params!;

        const url = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/confirm-password-reset?token=${token}`;

        return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Resetare parolă</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
                    <tr>
                        <td>
                            <h2 style="margin:0 0 16px;color:#111;">
                                Resetare parolă
                            </h2>
                            <p style="margin:0 0 24px;color:#555;line-height:1.6;">
                                Salut,
                                <br><br>
                                Am primit o cerere pentru resetarea parolei contului tău.
                            </p>
                            <div style="text-align:center;margin:32px 0;">
                                <a
                                    href="${url}"
                                    style="
                                        display:inline-block;
                                        background:#000;
                                        color:#fff;
                                        text-decoration:none;
                                        padding:12px 24px;
                                        border-radius:6px;
                                        font-weight:600;
                                    "
                                >
                                    Resetează parola
                                </a>
                            </div>
                            <p style="margin:24px 0 0;color:#777;font-size:14px;line-height:1.6;">
                                Dacă nu ai solicitat această resetare, poți ignora acest email.
                            </p>
                            <p style="margin:12px 0 0;color:#999;font-size:12px;">
                                Linkul expiră în ${15} minute.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
      }
    },
    tokenExpiration: 1209600,
    verify: {
      generateEmailSubject({ req, user }) {
        return `Confirmare adresă email`;
      },
      generateEmailHTML({ req, user, token }) {
        const url = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/verify-email?token=${token}`;

        return `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Verifică adresa de email</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
                    <tr>
                        <td>
                            <h2 style="margin:0 0 16px;color:#111;">
                                Confirmă adresa de email ${user.email}
                            </h2>

                            <p style="margin:0 0 24px;color:#555;line-height:1.6;">
                                Salut ${user.email},
                                <br><br>
                                Îți mulțumim pentru crearea contului. Pentru a activa contul și a confirma că această adresă de email îți aparține, apasă pe butonul de mai jos.
                            </p>

                            <div style="text-align:center;margin:32px 0;">
                                <a
                                    href="${url}"
                                    style="
                                        display:inline-block;
                                        background:#000;
                                        color:#fff;
                                        text-decoration:none;
                                        padding:12px 24px;
                                        border-radius:6px;
                                        font-weight:600;
                                    "
                                >
                                    Verifică emailul
                                </a>
                            </div>

                            <p style="margin:24px 0 0;color:#777;font-size:14px;line-height:1.6;">
                                Dacă nu ai creat acest cont, poți ignora acest email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
      }
    }
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin]
      },
      options: [
        {
          label: 'admin',
          value: 'admin'
        },
        {
          label: 'customer',
          value: 'customer'
        }
      ]
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items']
      }
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items']
      }
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id']
      }
    }
  ]
};
