import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  defaultEditorFeatures,
  lexicalEditor
} from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Media } from '@/collections/Media';
import { Pages } from '@/collections/Pages';
import { Users } from '@/collections/Users';
import { Footer } from '@/globals/layout/Footer';
import { Header } from '@/globals/layout/Header';
import { plugins } from './plugins';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { FAQPage } from '@/globals/pages/FAQPage';
import { HomePage } from '@/globals/pages/HomePage';
import { Articles } from '@/collections/Articles';
import { AboutPage } from '@/globals/pages/AboutPage';
import { ProductsPage } from '@/globals/pages/ProductsPage';
import { Vegetables } from '@/collections/Vegetables';
import { Categories } from '@/collections/Categories';
import { DidYouKnowPage } from '@/globals/pages/DidYouKnowPage';
import { PickupPointPage } from '@/globals/pages/PickupPointPage';
import { ContactPage } from '@/globals/pages/ContactPage';
import { SupportPage } from '@/globals/pages/SupportPage';
import { CheckoutSettings } from '@/globals/CheckoutSettings';
import { MailSettings } from '@/globals/MailSettings';
import { BoxNotifications } from '@/collections/BoxNotifications';
import { DeliveryPickupConfiguration } from '@/globals/DeliveryPickupConfiguration';
import { Invoices } from '@/collections/Invoices';

import sharp from 'sharp';

import 'dotenv/config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  graphQL: {
    disable: true
  },
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard']
    },
    user: Users.slug
  },
  collections: [
    Users,
    Pages,
    Categories,
    Media,
    Articles,
    Vegetables,
    BoxNotifications,
    Invoices
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || ''
    }
  }),
  editor: lexicalEditor({
    features: () => {
      return [...defaultEditorFeatures];
    }
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.DEFAULT_FROM_ADDRESS || '',
    defaultFromName: process.env.DEFAULT_FROM_NAME || '',
    transportOptions: {
      host: process.env.SMTP_HOST || '',
      port: +(process.env.SMTP_PORT || 465),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      }
    }
  }),
  endpoints: [],
  globals: [
    Header,
    Footer,
    FAQPage,
    HomePage,
    AboutPage,
    ProductsPage,
    DidYouKnowPage,
    PickupPointPage,
    ContactPage,
    SupportPage,
    CheckoutSettings,
    DeliveryPickupConfiguration,
    MailSettings
  ],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  sharp
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
});
