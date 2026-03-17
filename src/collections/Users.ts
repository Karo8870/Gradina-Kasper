import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'billingAddresses',
      label: 'Billing addresses',
      type: 'array',
      labels: {
        singular: 'Billing address',
        plural: 'Billing addresses',
      },
      fields: [
        {
          name: 'address',
          label: 'Address',
          type: 'text',
          required: true,
        },
        {
          name: 'firstName',
          label: 'First name',
          type: 'text',
          required: true,
        },
        {
          name: 'lastName',
          label: 'Last name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'text',
          required: true,
        },
        {
          name: 'company',
          label: 'Company',
          type: 'text',
        },
        {
          name: 'cui',
          label: 'CUI',
          type: 'text',
        },
      ],
    },
  ],
}
