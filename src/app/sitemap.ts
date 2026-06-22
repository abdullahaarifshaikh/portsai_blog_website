import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Query all published posts
    const postsData = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 1000,
      depth: 0, // no relationships needed for just links
    })

    const postUrls = postsData.docs.map((post: any) => ({
      url: `https://blog.portsai.in/blog/${post.slug}`,
      lastModified: new Date(post.publishedDate || post.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [
      {
        url: 'https://blog.portsai.in',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: 'https://blog.portsai.in/blog',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      ...postUrls,
    ]
  } catch (error) {
    // Return basic fallback if database is not reachable during build
    return [
      {
        url: 'https://blog.portsai.in',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: 'https://blog.portsai.in/blog',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]
  }
}
