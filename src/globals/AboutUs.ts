import { GlobalConfig } from 'payload';

export const AboutUs: GlobalConfig = {
	slug: 'about-us',
	label: 'About us',
	fields: [
		{
			name: 'title',
			type: 'text',
			required: true
		},
		{
			name: 'content',
			label: 'Content',
			type: 'richText',
			required: true
		}
	],
	hooks: {
		afterChange: []
	}
};
