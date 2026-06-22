import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'bio'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture for the author',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short biography of the author',
      },
    },
    {
      name: 'twitter',
      type: 'text',
      label: 'Twitter URL',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
  ],
}
