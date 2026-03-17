import { GlobalConfig } from 'payload';

export const Support: GlobalConfig = {
	slug: 'support',
	label: 'Support',
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
			name: 'channels',
			label: 'Support channels',
			type: 'array',
			minRows: 1,
			fields: [
				{
					name: 'label',
					type: 'text',
					required: true
				},
				{
					name: 'value',
					type: 'text',
					required: true
				},
				{
					name: 'url',
					label: 'Optional link URL',
					type: 'text'
				},
				{
					name: 'details',
					type: 'textarea'
				}
			]
		},
		{
			name: 'supportHours',
			label: 'Support hours',
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
		}
	]
};
