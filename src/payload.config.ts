import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import envConfig from '../env.config';
import { Users } from './collections/Users';
import { Media } from './collections/Media';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
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
    skipVerify: true,
    transportOptions: {
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: envConfig.SMTP_SECURE,
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
