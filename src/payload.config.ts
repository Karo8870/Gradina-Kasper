import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce';
import { mcpPlugin } from '@payloadcms/plugin-mcp';
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
import {
  adminOnly,
  adminOnlyField,
  adminOrPublishedProduct,
  isAuthenticated,
  isCustomer,
  isDocumentOwner,
  publicAccess
} from './access/users';
import { Articles } from './collections/Articles';
import { Invoices } from './collections/Invoices';
import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { ordersCollectionOverride } from './collections/Orders';
import { cartsCollectionOverride } from './collections/Carts';
import { productsCollectionOverride } from './collections/Products';
import { transactionsCollectionOverride } from './collections/Transactions';
import { Vegetables } from './collections/Vegetables';
import { commerceCurrencies } from './commerce/currencies';
import { validateCartProduct } from './commerce/product-validation';
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
import { getRuntimeTwoFactorPlugins } from './lib/auth/two-factor/runtime';
import { AboutPage } from './globals/AboutPage';
import { CheckoutSettings } from './globals/CheckoutSettings';
import { DidYouKnowPage } from './globals/DidYouKnowPage';
import { FAQPage } from './globals/FAQPage';
import { Footer } from './globals/Footer';
import { FulfillmentSchedule } from './globals/FulfillmentSchedule';
import { Header } from './globals/Header';
import { HomePage } from './globals/HomePage';
import { MailSettings } from './globals/MailSettings';
import { PickupPointPage } from './globals/PickupPointPage';
import { ProductsPage } from './globals/ProductsPage';
import { SupportPage } from './globals/SupportPage';
import { netopiaPaymentAdapter } from './payments/netopia/adapter';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  cors: {
    origins: [envConfig.NEXT_PUBLIC_SERVER_URL]
  },
  graphQL: {
    disable: true
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    },
    components: {
      afterNavLinks: [
        '/components/admin/order-dashboard-nav-link#OrderDashboardNavLink'
      ],
      beforeDashboard: [
        '/components/admin/order-dashboard-button#OrderDashboardButton'
      ],
      views: {
        login: {
          Component:
            '/components/admin/admin-login-redirect#AdminLoginRedirect',
          path: '/login'
        }
      }
    }
  },
  collections: [Users, Media, Pages, Articles, Vegetables, Invoices],
  globals: [
    Header,
    Footer,
    HomePage,
    ProductsPage,
    AboutPage,
    FAQPage,
    DidYouKnowPage,
    PickupPointPage,
    SupportPage,
    CheckoutSettings,
    FulfillmentSchedule,
    MailSettings
  ],
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
        betterAuthOptions,
        disableBeforeLogin: true,
        disableLoginView: true,
        enableManagementUI: false
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
          plugins: getRuntimeTwoFactorPlugins(payload),
          socialProviders: socialProviderConfig,
          secret: envConfig.BETTER_AUTH_SECRET,
          trustedOrigins: [envConfig.NEXT_PUBLIC_SERVER_URL]
        })
    }),
    ecommercePlugin({
      access: {
        adminOnlyFieldAccess: adminOnlyField,
        adminOrPublishedStatus: adminOrPublishedProduct,
        isAdmin: adminOnly,
        isAuthenticated,
        isCustomer,
        isDocumentOwner,
        publicAccess
      },
      addresses: true,
      carts: {
        allowGuestCarts: true,
        cartsCollectionOverride
      },
      currencies: commerceCurrencies,
      customers: {
        slug: Users.slug
      },
      inventory: true,
      orders: {
        ordersCollectionOverride
      },
      payments: {
        paymentMethods: [netopiaPaymentAdapter]
      },
      products: {
        productsCollectionOverride,
        validation: validateCartProduct,
        variants: false
      },
      transactions: {
        transactionsCollectionOverride
      }
    }),
    mcpPlugin({
      collections: {
        articles: {
          description:
            'Editorial articles with draft and published versions, thumbnails, related articles, and rich-text content.',
          enabled: true
        },
        media: {
          description:
            'The public media library. Use it to inspect or update media metadata; upload files through Payload Admin.',
          enabled: {
            delete: true,
            find: true,
            update: true
          }
        },
        pages: {
          description:
            'Reusable CMS pages with draft and published versions and rich-text content.',
          enabled: true
        },
        products: {
          description:
            'Store products, including pricing, inventory, visibility, images, and vegetable relationships.',
          enabled: true
        },
        vegetables: {
          description:
            'Vegetable catalog entries referenced by products and displayed on the storefront.',
          enabled: true
        }
      },
      globals: {
        'about-page': {
          description: 'Content and SEO settings for the About page.',
          enabled: true
        },
        'checkout-settings': {
          description: 'Checkout behavior and order settings.',
          enabled: true
        },
        'did-you-know-page': {
          description: 'Content and SEO settings for the Did You Know page.',
          enabled: true
        },
        'faq-page': {
          description: 'Content and SEO settings for the FAQ page.',
          enabled: true
        },
        footer: {
          description: 'Storefront footer content and navigation.',
          enabled: true
        },
        'fulfillment-schedule': {
          description: 'Store fulfillment schedule and availability.',
          enabled: true
        },
        header: {
          description: 'Storefront header content and navigation.',
          enabled: true
        },
        'home-page': {
          description:
            'Homepage content, featured products, articles, and SEO settings.',
          enabled: true
        },
        'pickup-point-page': {
          description: 'Content and SEO settings for the pickup-point page.',
          enabled: true
        },
        'products-page': {
          description: 'Content and SEO settings for the product listing page.',
          enabled: true
        },
        'support-page': {
          description: 'Content and SEO settings for the support page.',
          enabled: true
        }
      },
      mcp: {
        serverOptions: {
          instructions:
            'Manage storefront content and catalog data. Inspect existing documents before mutating them, preserve unrelated fields, use drafts for editorial work, and never assume access to customer or transactional data.',
          serverInfo: {
            name: 'Storefront Payload CMS',
            version: '1.0.0'
          }
        }
      },
      overrideApiKeyCollection: (collection) => ({
        ...collection,
        access: {
          ...collection.access,
          admin: adminOnly,
          create: adminOnly,
          delete: adminOnly,
          read: adminOnly,
          unlock: adminOnly,
          update: adminOnly
        }
      }),
      userCollection: 'users'
    }),
    seoPlugin({
      collections: ['pages', 'articles', 'products'],
      globals: [
        'home-page',
        'products-page',
        'about-page',
        'faq-page',
        'did-you-know-page',
        'pickup-point-page',
        'support-page'
      ],
      tabbedUI: true,
      uploadsCollection: 'media'
    }),
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL({ filename, prefix }) {
            const key = prefix ? `${prefix}/${filename}` : filename;

            return `${envConfig.R2_PUBLIC_ENDPOINT}/${key}`;
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
