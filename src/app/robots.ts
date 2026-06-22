import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*'], // Block indexing of Payload CMS administration interface
    },
    sitemap: 'https://blog.portsai.in/sitemap.xml',
  }
}
