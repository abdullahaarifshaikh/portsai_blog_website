import type { CollectionConfig } from 'payload'
import { lexicalEditor, BlocksFeature, CodeBlock, UploadFeature } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedDate', 'featured'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Settings & Metadata',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'Used in the URL (e.g. "my-first-blog-post")',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              admin: {
                description: 'A short summary shown in post lists (under 160 characters recommended)',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Main cover image for the blog post',
              },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              required: true,
            },
            {
              name: 'status',
              type: 'select',
              defaultValue: 'draft',
              options: [
                {
                  label: 'Draft',
                  value: 'draft',
                },
                {
                  label: 'Published',
                  value: 'published',
                },
              ],
              required: true,
            },
            {
              name: 'publishedDate',
              type: 'date',
              required: true,
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Featured Post',
              defaultValue: false,
            },
            // SEO Fields grouped together
            {
              name: 'seo',
              type: 'group',
              label: 'SEO Metadata',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'SEO Meta Title',
                  admin: {
                    description: 'Falls back to post title if left empty',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'SEO Meta Description',
                  admin: {
                    description: 'Falls back to excerpt if left empty (recommended 150-160 characters)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Article Body',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => {
                  // Remove standard upload feature to replace it with a sizing custom field configured version
                  const filtered = defaultFeatures.filter((f) => f.key !== 'upload')
                  
                  return [
                    ...filtered,
                    BlocksFeature({
                      blocks: [CodeBlock()],
                    }),
                    UploadFeature({
                      collections: {
                        media: {
                          fields: [
                            {
                              name: 'size',
                              type: 'select',
                              label: 'Image Display Size',
                              defaultValue: 'full',
                              options: [
                                { label: 'Full Width (Responsive)', value: 'full' },
                                { label: 'Medium (Centred)', value: 'medium' },
                                { label: 'Small (Centred)', value: 'small' },
                              ],
                            },
                          ],
                        },
                      },
                    }),
                  ]
                },
              }),
              admin: {
                description: 'Write your main post body here. Supports formatting, headers, links, images, and code blocks.',
              },
            },
          ],
        },
      ],
    },
  ],
}
