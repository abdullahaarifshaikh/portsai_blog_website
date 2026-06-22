import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Search, Calendar, User, ArrowRight, ChevronRight, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    page?: string
  }>
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.search || ''
  const categorySlug = params.category || ''
  const pageNum = parseInt(params.page || '1', 10)
  const limit = 8

  const payloadConfig = await config
  let categories: any[] = []
  let posts: any[] = []
  let totalPages = 0
  let hasPrevPage = false
  let hasNextPage = false
  let dbConnectionError = false

  try {
    const payload = await getPayload({ config: payloadConfig })

    // Fetch categories for filter
    const categoriesData = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
    })
    categories = categoriesData.docs

    // Query posts
    const whereQuery: any = {
      status: {
        equals: 'published',
      },
    }

    if (categorySlug) {
      whereQuery['category.slug'] = {
        equals: categorySlug,
      }
    }

    if (search) {
      whereQuery.or = [
        { title: { like: search } },
        { excerpt: { like: search } },
      ]
    }

    const postsData = await payload.find({
      collection: 'posts',
      where: whereQuery,
      sort: '-publishedDate',
      limit: limit,
      page: pageNum,
      depth: 2,
    })
    posts = postsData.docs
    totalPages = postsData.totalPages
    hasPrevPage = postsData.hasPrevPage
    hasNextPage = postsData.hasNextPage
  } catch (error: any) {
    console.error('Database connection error in BlogListingPage:', error.message || error)
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          The Ports<span className="text-amber-500">AI</span> Journal
        </h1>
        <p className="text-neutral-400 text-base leading-relaxed">
          Deep-dives, guides, and strategic discussions on maritime logistics and trade optimization.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <Link
            href="/blog"
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              !categorySlug
                ? 'bg-neutral-100 text-black'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            All
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                categorySlug === cat.slug
                  ? 'bg-neutral-100 text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <form action="/blog" method="GET" className="relative w-full sm:max-w-xs">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <input
            type="text"
            name="search"
            placeholder="Search journal..."
            defaultValue={search}
            className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
        </form>
      </div>

      {/* Posts Listing */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950/20 border border-neutral-900 rounded-2xl">
          <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No articles found</h3>
          <p className="text-neutral-500 text-xs mb-4">
            Try adjusting your search terms or selecting another category.
          </p>
          <Link href="/blog" className="text-xs font-semibold text-amber-500 hover:underline">
            Reset Filters
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post: any) => (
              <article key={post.id} className="group flex flex-col justify-between border border-neutral-900 bg-neutral-950/20 hover:bg-neutral-950/45 hover:border-neutral-800 rounded-2xl p-5 transition-all">
                <div className="space-y-4">
                  {/* Thumbnail */}
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[1.618/1] w-full rounded-xl overflow-hidden border border-neutral-900 bg-neutral-950 block">
                    {post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url ? (
                      <Image
                        src={post.coverImage.url}
                        alt={post.coverImage.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-900 text-xs">
                        No Image Available
                      </div>
                    )}
                  </Link>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                      <span className="text-amber-500">{post.category?.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.publishedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="text-xl font-bold text-white hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-neutral-900 mt-5">
                  <div className="flex items-center gap-2.5">
                    {post.author?.avatar && typeof post.author.avatar === 'object' && post.author.avatar.url ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-800">
                        <Image
                          src={post.author.avatar.url}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                    )}
                    <span className="text-xs text-neutral-300 font-medium">
                      {post.author?.name}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-amber-500 group-hover:text-amber-400 flex items-center gap-0.5">
                    Read <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-900 pt-6">
              <Link
                href={hasPrevPage ? `/blog?page=${pageNum - 1}${categorySlug ? `&category=${categorySlug}` : ''}${search ? `&search=${search}` : ''}` : '#'}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasPrevPage
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-850'
                    : 'text-neutral-600 border border-neutral-900 pointer-events-none'
                }`}
              >
                Previous Page
              </Link>
              <span className="text-xs text-neutral-500 font-medium">
                Page {pageNum} of {totalPages}
              </span>
              <Link
                href={hasNextPage ? `/blog?page=${pageNum + 1}${categorySlug ? `&category=${categorySlug}` : ''}${search ? `&search=${search}` : ''}` : '#'}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasNextPage
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-850'
                    : 'text-neutral-600 border border-neutral-900 pointer-events-none'
                }`}
              >
                Next Page
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
