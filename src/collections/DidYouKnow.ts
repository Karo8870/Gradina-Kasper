import type { CollectionConfig } from 'payload';

export const Articles: CollectionConfig = {
	slug: 'articles',
	labels: {
		singular: 'Articol',
		plural: 'Articole'
	},
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'slug', 'updatedAt']
	},
	access: {
		read: () => true
	},
	fields: [
		{
			name: 'title',
			label: 'Titlu',
			type: 'text',
			required: true
		},
		{
			name: 'description',
			label: 'Descriere',
			type: 'textarea',
			required: true
		},
		{
			name: 'slug',
			label: 'Slug',
			type: 'text',
			required: true,
			unique: true,
			index: true,
			admin: {
				description: 'Segmentul URL după /did-you-know/'
			}
		},
		{
			name: 'image',
			label: 'Imagine',
			type: 'upload',
			relationTo: 'media',
			required: true
		},
		{
			name: 'content',
			label: 'Conținut',
			type: 'richText',
			required: true
		},
		{
			name: 'alsoCheckOut',
			label: 'Vezi și',
			type: 'relationship',
			relationTo: 'articles',
			hasMany: true,
			maxRows: 4,
			admin: {
				description: 'Articole opționale afișate în carusel la finalul paginii.'
			}
		}
	]
};
