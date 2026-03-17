import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Footer } from '@/globals/Footer';
import { Header } from '@/globals/Header';
import { Team } from '@/globals/Team';
import { AboutUs } from '@/globals/AboutUs';
import { PickupPoint } from '@/globals/PickupPoint';
import { Support } from '@/globals/Support';
import { FAQ } from '@/globals/FAQ';
import { Home } from '@/globals/Home';
import { OurProducts } from '@/globals/OurProducts';
import { Articles } from '@/collections/DidYouKnow';
import { Boxes } from '@/collections/Boxes';
import { LegalPages } from '@/collections/LegalPages';
import { s3Storage } from '@payloadcms/storage-s3'
import envConfig from '../env.config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Media, LegalPages, Articles, Boxes],
  globals: [
    Footer,
    Header,
    Home,
    OurProducts,
    Team,
    AboutUs,
    PickupPoint,
    Support,
    FAQ
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || ''
    }
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true
      },
      bucket: envConfig.R2_BUCKET_NAME,
      config: {
        endpoint: envConfig.R2_BUCKET_PUBLIC_ENDPOINT,
        credentials: {
          accessKeyId: envConfig.R2_ACCESS_KEY_ID,
          secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY
        },
        region: envConfig.R2_REGION
      }
    })
  ]
});
