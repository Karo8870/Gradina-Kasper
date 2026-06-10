import type { Field, GlobalConfig } from 'payload';

import { adminOnly } from '@/access/adminOnly';

const availableParams = [
  '{{orderID}}',
  '{{orderDate}}',
  '{{deliveryDate}}',
  '{{status}}',
  '{{total}}',
  '{{currency}}',
  '{{customerEmail}}',
  '{{orderURL}}',
  '{{fulfillmentMethod}}',
  '{{fulfillmentLabel}}',
  '{{billingAddress}}',
  '{{shippingAddress}}',
  '{{itemsText}}',
  '{{itemsHTML}}',
  '{{itemsTable}}',
  '{{boxName}}',
  '{{boxURL}}',
  '{{availableFrom}}'
].join(', ');

const templateDescription = `Use HTML in the body. Inject order values using double curly braces. Available params: ${availableParams}`;

const templateFields = ({
  defaultBody,
  defaultSubject,
  name
}: {
  defaultBody: string;
  defaultSubject: string;
  name: string;
}): Field[] => [
  {
    name,
    type: 'group',
    fields: [
      {
        name: 'subject',
        type: 'text',
        required: true,
        defaultValue: defaultSubject,
        admin: {
          description: templateDescription
        }
      },
      {
        name: 'body',
        type: 'textarea',
        required: true,
        defaultValue: defaultBody,
        admin: {
          description: templateDescription,
          rows: 18
        }
      }
    ]
  }
];

export const MailSettings: GlobalConfig = {
  slug: 'mail-settings',
  access: {
    read: adminOnly,
    update: adminOnly
  },
  admin: {
    description: `Configure transactional order emails. Templates support HTML bodies and {{param}} placeholders. Available params: ${availableParams}`,
    group: 'Settings'
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Order placed',
          fields: templateFields({
            name: 'orderPlaced',
            defaultSubject: 'Comanda #{{orderID}} a fost plasată',
            defaultBody: `
<p>Bună,</p>
<p>Am primit comanda ta #{{orderID}}.</p>
<p><strong>{{fulfillmentLabel}}:</strong> {{deliveryDate}}</p>
<p><strong>Total:</strong> {{total}} {{currency}}</p>
{{itemsTable}}
<p>Poți vedea comanda aici: <a href="{{orderURL}}">{{orderURL}}</a></p>
`.trim()
          })
        },
        {
          label: 'Order cancelled',
          fields: templateFields({
            name: 'orderCancelled',
            defaultSubject: 'Comanda #{{orderID}} a fost anulată',
            defaultBody: `
<p>Bună,</p>
<p>Comanda ta #{{orderID}} a fost anulată.</p>
<p><strong>Total:</strong> {{total}} {{currency}}</p>
{{itemsTable}}
<p>Poți vedea comanda aici: <a href="{{orderURL}}">{{orderURL}}</a></p>
`.trim()
          })
        },
        {
          label: 'Order delivered',
          fields: templateFields({
            name: 'orderDelivered',
            defaultSubject: 'Comanda #{{orderID}} a fost livrată',
            defaultBody: `
<p>Bună,</p>
<p>Comanda ta #{{orderID}} a fost livrată.</p>
<p><strong>Adresa de livrare:</strong><br />{{shippingAddress}}</p>
<p><strong>Total:</strong> {{total}} {{currency}}</p>
{{itemsTable}}
<p>Îți mulțumim!</p>
`.trim()
          })
        },
        {
          label: 'Order picked up',
          fields: templateFields({
            name: 'orderPickedUp',
            defaultSubject: 'Comanda #{{orderID}} a fost ridicată',
            defaultBody: `
<p>Bună,</p>
<p>Comanda ta #{{orderID}} a fost ridicată.</p>
<p><strong>Total:</strong> {{total}} {{currency}}</p>
{{itemsTable}}
<p>Îți mulțumim!</p>
`.trim()
          })
        },
        {
          label: 'Box available',
          fields: templateFields({
            name: 'boxAvailable',
            defaultSubject: '{{boxName}} este disponibil',
            defaultBody: `
<p>Bună,</p>
<p>Boxul <strong>{{boxName}}</strong> este acum disponibil.</p>
<p>Îl poți vedea aici: <a href="{{boxURL}}">{{boxURL}}</a></p>
`.trim()
          })
        }
      ]
    }
  ]
};
