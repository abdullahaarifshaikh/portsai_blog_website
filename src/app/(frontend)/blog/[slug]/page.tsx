import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Calendar, User, Clock, ArrowLeft, Twitter, Linkedin, Facebook, Link2 } from 'lucide-react'
import { RichText } from '../../components/RichText'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Calculate reading time by traversing Lexical JSON structure
function calculateReadingTime(content: any): number {
  let wordCount = 0

  function countWords(nodes: any[]) {
    if (!nodes || !Array.isArray(nodes)) return
    for (const node of nodes) {
      if (node.type === 'text' && node.text) {
        wordCount += node.text.trim().split(/\s+/).length
      }
      if (node.children) {
        countWords(node.children)
      }
    }
  }

  if (content && content.root && content.root.children) {
    countWords(content.root.children)
  }

  return Math.max(1, Math.ceil(wordCount / 200)) // Assuming 200 WPM
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const postsData = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      depth: 2,
    })

    const post = postsData.docs[0]
    if (!post) {
      return {
        title: 'Article Not Found',
      }
    }

    const title = post.seo?.title || post.title
    const description = post.seo?.description || post.excerpt
    const imageUrl = post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url ? post.coverImage.url : ''

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        publishedTime: post.publishedDate,
        authors: [post.author?.name || ''],
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    return {
      title: 'PortsAI Blog Insights',
    }
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const payloadConfig = await config
  let post: any = null
  let relatedPosts: any[] = []
  let readingTime = 1
  let coverImageUrl = ''
  let postUrl = ''
  let dbConnectionError = false

  try {
    const payload = await getPayload({ config: payloadConfig })

    // Find the requested post
    const postsData = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      depth: 2,
    })

    post = postsData.docs[0]

    if (post) {
      readingTime = calculateReadingTime(post.content)
      coverImageUrl = post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url ? post.coverImage.url : ''
      postUrl = `https://blog.portsai.in/blog/${post.slug}`

      // Fetch up to 3 related articles (same category, excluding this post)
      const relatedPostsData = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              id: {
                not_equals: post.id,
              },
            },
            {
              'category.slug': {
                equals: post.category?.slug || '',
              },
            },
            {
              status: {
                equals: 'published',
              },
            },
          ],
        },
        limit: 3,
        sort: '-publishedDate',
        depth: 2,
      })
      relatedPosts = relatedPostsData.docs
    }
  } catch (error: any) {
    console.error('Database connection error in BlogPostPage:', error.message || error)
    dbConnectionError = true
  }

  if (dbConnectionError) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 border border-neutral-900 bg-neutral-950/40 rounded-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-950/30 flex items-center justify-center mx-auto border border-red-800/40">
          <span className="text-red-500 font-extrabold text-2xl font-mono">!</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">PostgreSQL Connection Required</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            The blog platform is ready, but Next.js couldn't establish a connection to your PostgreSQL database.
          </p>
        </div>
        
        <div className="text-left bg-neutral-950 border border-neutral-900 p-5 rounded-xl space-y-3">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">How to Fix This:</span>
          <ol className="list-decimal pl-4 text-xs text-neutral-400 space-y-2">
            <li>Create a free PostgreSQL instance on <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold hover:text-amber-300">Neon.tech</a> or run local Postgres.</li>
            <li>Copy your **PostgreSQL connection string**.</li>
            <li>Open the [`.env`](file:///C:/Users/abdul/OneDrive/Desktop/Abdullah%20Aarif/blogwebsite/.env) file in the root of your project.</li>
            <li>Replace the placeholder connection string in `DATABASE_URI` with your connection string.</li>
            <li>Restart your development server.</li>
          </ol>
        </div>
        
        <div className="pt-2">
          <a href="/admin" className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 border border-neutral-800 rounded-lg transition-colors">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  // JSON-LD Structured Data for Google Rich Search Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': coverImageUrl,
    'datePublished': post.publishedDate,
    'author': {
      '@type': 'Person',
      'name': post.author?.name,
      'description': post.author?.bio || '',
      'image': post.author?.avatar && typeof post.author.avatar === 'object' && post.author.avatar.url ? post.author.avatar.url : undefined,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'PortsAI',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  }

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to all articles
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Post Metadata Card (Author, Date, Reading Time) */}
        <div className="flex items-center justify-between border-y border-neutral-900 py-5 my-8">
          <div className="flex items-center gap-3">
            {post.author?.avatar && typeof post.author.avatar === 'object' && post.author.avatar.url ? (
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-neutral-850">
                <Image
                  src={post.author.avatar.url}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-neutral-200">{post.author?.name}</div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.publishedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social share icons */}
          <div className="flex items-center gap-2.5">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 flex items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors"
              title="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 flex items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 flex items-center justify-center text-neutral-400 hover:text-amber-400 transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Cover Image */}
        {coverImageUrl && (
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950 mb-10">
            <Image
              src={coverImageUrl}
              alt={post.coverImage?.alt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
        )}

        {/* Content Render */}
        <RichText content={post.content} className="mb-16" />

        {/* Author Bio Card */}
        {post.author && (
          <div className="border border-neutral-900 bg-neutral-950/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start mt-12 mb-16">
            {post.author.avatar && typeof post.author.avatar === 'object' && post.author.avatar.url ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-neutral-850 flex-shrink-0">
                <Image
                  src={post.author.avatar.url}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-neutral-500" />
              </div>
            )}
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Written by {post.author.name}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {post.author.bio || 'Author bio has not been provided yet. Visit the author profile to learn more.'}
              </p>
              <div className="flex gap-4 pt-2">
                {post.author.twitter && (
                  <a href={post.author.twitter} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors">
                    Twitter
                  </a>
                )}
                {post.author.website && (
                  <a href={post.author.website} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-neutral-500 hover:text-amber-400 transition-colors">
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-neutral-900 pt-12 mt-12 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-wider">Related Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost: any) => (
                <Link key={rPost.id} href={`/blog/${rPost.slug}`} className="group space-y-3">
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-neutral-900 bg-neutral-950">
                    {rPost.coverImage && typeof rPost.coverImage === 'object' && rPost.coverImage.url ? (
                      <Image
                        src={rPost.coverImage.url}
                        alt={rPost.coverImage.alt || rPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-102"
                        sizes="250px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-900 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{rPost.category?.name}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                      {rPost.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
