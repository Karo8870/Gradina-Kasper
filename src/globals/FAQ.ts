import { GlobalConfig } from 'payload';

export const FAQ: GlobalConfig = {
	slug: 'faq',
	label: 'FAQ',
	fields: [
		{
			name: 'title',
			type: 'text',
			required: true
		},
		{
			name: 'items',
			label: 'FAQs',
			type: 'array',
			minRows: 1,
			fields: [
				{
					name: 'question',
					type: 'text',
					required: true
				},
				{
					name: 'answer',
					type: 'richText',
					required: true
				}
			]
		}
	]
};
