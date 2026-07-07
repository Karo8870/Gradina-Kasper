import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { Plugin } from 'payload';
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types';
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical';
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce';
import crypto from 'crypto';

import { Page, Product } from '@/payload-types';
import { getServerSideURL } from '@/utilities/getURL';
import { ProductsCollection } from '@/collections/Products';
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus';
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess';
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess';
import { isAdmin } from '@/access/isAdmin';
import { isDocumentOwner } from '@/access/isDocumentOwner';
import { netopiaPaymentAdapter } from '@/payment/netopia/NetopiaPaymentAdapter';
import { s3Storage } from '@payloadcms/storage-s3';

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return (doc as Product).name ?? (doc as Page).title ?? 'Grădina Kasper';
};

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL
  }),
  // formBuilderPlugin({
  //   fields: {
  //     payment: false
  //   },
  //   formSubmissionOverrides: {
  //     access: {
  //       delete: isAdmin,
  //       read: isAdmin,
  //       update: isAdmin
  //     },
  //     admin: {
  //       group: 'Content'
  //     }
  //   },
  //   formOverrides: {
  //     access: {
  //       delete: isAdmin,
  //       read: isAdmin,
  //       update: isAdmin,
  //       create: isAdmin
  //     },
  //     admin: {
  //       group: 'Content'
  //     },
  //     fields: ({ defaultFields }) => {
  //       return defaultFields.map((field) => {
  //         if ('name' in field && field.name === 'confirmationMessage') {
  //           return {
  //             ...field,
  //             editor: lexicalEditor({
  //               features: ({ rootFeatures }) => {
  //                 return [
  //                   ...rootFeatures,
  //                   FixedToolbarFeature(),
  //                   HeadingFeature({
  //                     enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4']
  //                   })
  //                 ];
  //               }
  //             })
  //           };
  //         }
  //         return field;
  //       });
  //     }
  //   }
  // }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner
    },
    customers: {
      slug: 'users'
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: 'mapboxVerified',
            type: 'checkbox',
            defaultValue: false,
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'mapboxPlaceID',
            type: 'text',
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'mapboxFullAddress',
            type: 'text',
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'mapboxLatitude',
            type: 'number',
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'mapboxLongitude',
            type: 'number',
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          }
        ]
      })
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID();
                  }
                  return value;
                }
              ]
            }
          },
          {
            name: 'shouldBeDeliveredOn',
            type: 'date',
            label: 'Should be delivered on',
            admin: {
              date: {
                pickerAppearance: 'dayOnly'
              },
              position: 'sidebar'
            }
          }
        ]
      })
    },
    payments: {
      paymentMethods: [netopiaPaymentAdapter]
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      validation: ({ product, quantity }) => {
        if (
          product.inventory === 0 ||
          (product.inventory && product.inventory < quantity)
        ) {
          throw new Error(
            `Product is out of stock or does not have enough inventory.`,
            {
              cause: {
                code: 'OutOfStock',
                codes: [product.id]
              }
            }
          );
        }
      },
      variants: false
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            async ({ data, operation, req }) => {
              if (operation === 'create' && !data.customer && !data.secret) {
                data.secret = crypto.randomBytes(20).toString('hex');

                if (!req.context) {
                  req.context = {};
                }

                req.context.newCartSecret = data.secret;
              }

              if (!Array.isArray(data.items)) {
                data.subtotal = 0;
                return data;
              }

              let subtotal = 0;

              for (const item of data.items) {
                const quantity = Number(item.quantity) || 0;

                const productID =
                  typeof item.product === 'object'
                    ? item.product.id
                    : item.product;

                const product = await req.payload.findByID({
                  id: productID,
                  collection: 'products',
                  depth: 0,
                  select: {
                    discountedPrice: true,
                    hasDiscount: true,
                    price: true
                  }
                });

                const productPrice =
                  product.hasDiscount && product.discountedPrice
                    ? product.discountedPrice
                    : product.price;

                subtotal += (Number(productPrice) || 0) * quantity;
              }

              data.subtotal = subtotal;
              return data;
            }
          ]
        }
      })
    },
    currencies: {
      defaultCurrency: 'RON',
      supportedCurrencies: [
        {
          code: 'RON',
          decimals: 2,
          label: 'LEU Românesc',
          symbol: 'RON',
          symbolDisplay: 'code'
        }
      ]
    }
  }),
  s3Storage({
    collections: {
      media: true
    },
    bucket: process.env.S3_BUCKET!,
    config: {
      endpoint: process.env.S3_BUCKET_PUBLIC_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
      },
      region: process.env.S3_REGION!
    },
    clientUploads: true
  })
];
