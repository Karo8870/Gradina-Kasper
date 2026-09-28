import type { Field, GlobalConfig } from 'payload';

import { adminOnly } from '@/access/users';

export const orderEmailPlaceholders = [
  '{{orderID}}',
  '{{orderDate}}',
  '{{fulfillmentDate}}',
  '{{fulfillmentMethod}}',
  '{{status}}',
  '{{total}}',
  '{{currency}}',
  '{{customerEmail}}',
  '{{orderURL}}',
  '{{itemsText}}',
  '{{itemsHTML}}',
  '{{itemsTable}}',
  '{{shippingAddress}}'
].join(', ');

const description = `Use HTML in the body and double curly braces for values. Available placeholders: ${orderEmailPlaceholders}`;

function templateFields(name: string, subject: string, body: string): Field[] {
  return [
    {
      name,
      type: 'group',
      fields: [
        {
          name: 'subject',
          type: 'text',
          required: true,
          defaultValue: subject,
          admin: { description }
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          defaultValue: body,
          admin: { description, rows: 16 }
        }
      ]
    }
  ];
}

export const MailSettings: GlobalConfig = {
  slug: 'mail-settings',
  label: 'Order Emails',
  access: { read: adminOnly, update: adminOnly },
  admin: { group: 'Commerce', description },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Order placed',
          fields: templateFields(
            'orderPlaced',
            'Comanda #{{orderID}} a fost plasată',
            '<p>Am primit comanda ta #{{orderID}}.</p><p>Total: {{total}} {{currency}}</p>{{itemsTable}}<p><a href="{{orderURL}}">Vezi comanda</a></p>'
          )
        },
        {
          label: 'In processing',
          fields: templateFields(
            'orderProcessing',
            'Comanda #{{orderID}} este în procesare',
            '<p>Comanda ta #{{orderID}} este în procesare.</p><p>Data livrării sau ridicării: {{fulfillmentDate}}</p>'
          )
        },
        {
          label: 'Order cancelled',
          fields: templateFields(
            'orderCancelled',
            'Comanda #{{orderID}} a fost anulată',
            '<p>Comanda ta #{{orderID}} a fost anulată.</p>{{itemsTable}}'
          )
        },
        {
          label: 'Order delivered',
          fields: templateFields(
            'orderDelivered',
            'Comanda #{{orderID}} a fost livrată',
            '<p>Comanda ta #{{orderID}} a fost livrată.</p><p>{{shippingAddress}}</p>{{itemsTable}}<p>Îți mulțumim!</p>'
          )
        },
        {
          label: 'Order picked up',
          fields: templateFields(
            'orderPickedUp',
            'Comanda #{{orderID}} a fost ridicată',
            '<p>Comanda ta #{{orderID}} a fost ridicată.</p>{{itemsTable}}<p>Îți mulțumim!</p>'
          )
        },
        {
          label: 'Order refunded',
          fields: templateFields(
            'orderRefunded',
            'Comanda #{{orderID}} a fost rambursată',
            '<p>Comanda ta #{{orderID}} a fost rambursată.</p><p>Total: {{total}} {{currency}}</p>'
          )
        }
      ]
    }
  ]
};
