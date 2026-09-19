import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import {
  betterAuthCollections,
  createBetterAuthPlugin,
  payloadAdapter
} from '@delmaredigital/payload-better-auth';
import { betterAuth } from 'better-auth';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import envConfig from '../env.config';
import { Users } from './collections/Users';
import { Media } from './collections/Media';
import {
  passwordResetEmailHTML,
  passwordResetEmailSubject
} from './emails/auth/password-reset';
import {
  verificationEmailHTML,
  verificationEmailSubject
} from './emails/auth/verification';
import { betterAuthOptions } from './lib/auth/options';
import { socialProviderConfig } from './lib/auth/social-providers.server';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  cors: {
    origins: ['http://localhost:3000', 'http://192.168.1.19:3000']
  },
  graphQL: {
    disable: true
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Media],
  email: nodemailerAdapter({
    defaultFromAddress: envConfig.SMTP_FROM_ADDRESS,
    defaultFromName: envConfig.SMTP_FROM_NAME,
    transportOptions: {
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: envConfig.SMTP_PORT === 465,
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS
      }
    }
  }),
  editor: lexicalEditor(),
  secret: envConfig.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {
      connectionString: envConfig.DATABASE_URL
    }
  }),
  sharp,
  plugins: [
    betterAuthCollections({
      betterAuthOptions,
      firstUserAdmin: {
        defaultRole: 'customer'
      },
      skipCollections: ['user']
    }),
    createBetterAuthPlugin({
      admin: {
        login: {
          enableSignUp: false
        }
      },
      createAuth: (payload) =>
        betterAuth({
          ...betterAuthOptions,
          advanced: {
            database: {
              generateId: 'serial'
            }
          },
          baseURL: envConfig.NEXT_PUBLIC_SERVER_URL,
          database: payloadAdapter({ payloadClient: payload }),
          emailAndPassword: {
            ...betterAuthOptions.emailAndPassword,
            sendResetPassword: async ({ token, user }) => {
              await payload.sendEmail({
                html: passwordResetEmailHTML({ token }),
                subject: passwordResetEmailSubject(),
                to: user.email
              });
            }
          },
          emailVerification: {
            ...betterAuthOptions.emailVerification,
            sendVerificationEmail: async ({ token, user }) => {
              await payload.sendEmail({
                html: verificationEmailHTML({
                  email: user.email,
                  token
                }),
                subject: verificationEmailSubject(),
                to: user.email
              });
            }
          },
          socialProviders: socialProviderConfig,
          secret: envConfig.BETTER_AUTH_SECRET,
          trustedOrigins: [envConfig.NEXT_PUBLIC_SERVER_URL]
        })
    }),
    seoPlugin({
      collections: []
    }),
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL({ filename, prefix }) {
            const key = prefix ? `${prefix}/${filename}` : filename;

            return `${envConfig.S3_BUCKET_PUBLIC_ENDPOINT}/${key}`;
          }
        }
      },
      bucket: envConfig.S3_BUCKET,
      config: {
        endpoint: envConfig.S3_BUCKET_PUBLIC_ENDPOINT,
        credentials: {
          accessKeyId: envConfig.S3_ACCESS_KEY_ID,
          secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY
        },
        region: envConfig.S3_REGION
      },
      clientUploads: true
    })
  ]
});
