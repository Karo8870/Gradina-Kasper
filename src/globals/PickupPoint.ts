import { GlobalConfig } from 'payload';

export const PickupPoint: GlobalConfig = {
	slug: 'pickup-point',
	label: 'Pick-up point',
	fields: [
		{
			name: 'title',
			type: 'text',
			required: true
		},
		{
			name: 'description',
			label: 'Description',
			type: 'richText',
			required: true
		},
		{
			name: 'topImage',
			label: 'Top image',
			type: 'upload',
			relationTo: 'media'
		},
		{
			name: 'location',
			type: 'group',
			fields: [
				{
					name: 'addressLine',
					label: 'Address line',
					type: 'text',
					required: true
				},
				{
					name: 'city',
					type: 'text',
					required: true
				},
				{
					name: 'mapUrl',
					label: 'Map URL',
					type: 'text'
				}
			]
		},
		{
			name: 'openingHours',
			label: 'Opening hours',
			type: 'array',
			fields: [
				{
					name: 'day',
					type: 'text',
					required: true
				},
				{
					name: 'hours',
					type: 'text',
					required: true
				}
			]
		},
		{
			name: 'notes',
			type: 'textarea'
		}
	]
};
