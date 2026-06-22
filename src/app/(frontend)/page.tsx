import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Search, Calendar, User, Clock, ArrowRight, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
  }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.search || ''
  const categorySlug = params.category || ''

  const payloadConfig = await config
  let categories: any[] = []
  let posts: any[] = []
  let dbConnectionError = false

  try {
    const payload = await getPayload({ config: payloadConfig })

    // Fetch categories for the filter bar
    const categoriesData = await payload.find({
      collection: 'categories',
      limit: 50,
      sort: 'name',
    })
    categories = categoriesData.docs

    // Build the query for posts
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

    // Fetch posts matching query
    const postsData = await payload.find({
      collection: 'posts',
      where: whereQuery,
      sort: '-publishedDate',
      limit: 20,
      depth: 2, // Resolve author, coverImage, category
    })
    posts = postsData.docs
  } catch (error: any) {
    console.error('Database connection error in HomePage:', error.message || error)
    dbConnectionError = true
  }

  // Find the featured post (check boolean flag or take the newest one if none flagged)
  const featuredPost = posts.find((post: any) => post.featured) || posts[0]
  const otherPosts = featuredPost ? posts.filter((post: any) => post.id !== featuredPost.id) : posts

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
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Search and Category Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-8">
        {/* Categories scrollable list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              !categorySlug
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            All
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}${search ? `&search=${search}` : ''}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                categorySlug === cat.slug
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <form action="/" method="GET" className="relative max-w-sm w-full">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <input
            type="text"
            name="search"
            placeholder="Search articles..."
            defaultValue={search}
            className="w-full bg-neutral-900/60 border border-neutral-800 rounded-full pl-10 pr-5 py-2 text-sm focus:outline-none focus:border-amber-500/50 text-neutral-200 transition-colors"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-500" />
        </form>
      </div>

      {/* Main Content Layout */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950/20 border border-neutral-900 rounded-2xl p-8 max-w-2xl mx-auto mt-8">
          <Star className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No articles found</h2>
          <p className="text-neutral-400 mb-6 text-sm">
            {search || categorySlug
              ? "We couldn't find any published articles matching your criteria. Try adjusting your search or category."
              : 'Welcome to PortsAI Blog! No articles have been published yet. Log in to the administrator portal to draft and publish your first article.'}
          </p>
          {(search || categorySlug) ? (
            <Link href="/" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-sm border border-neutral-800 transition-colors">
              Clear filters
            </Link>
          ) : (
            <a href="/admin" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.02]">
              Access Admin Panel <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left/Middle Column (Articles) */}
          <div className="lg:col-span-2 space-y-12">
            {/* 1. Featured Post Hero (only shown if not filtering/searching, or on first page) */}
            {!search && !categorySlug && featuredPost && (
              <article className="group flex flex-col gap-6 border-b border-neutral-900 pb-10">
                <Link href={`/blog/${featuredPost.slug}`} className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950">
                  {featuredPost.coverImage && typeof featuredPost.coverImage === 'object' && featuredPost.coverImage.url ? (
                    <Image
                      src={featuredPost.coverImage.url}
                      alt={featuredPost.coverImage.alt || featuredPost.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                      sizes="(max-width: 1024px) 100vw, 750px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                      No Image Available
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    Featured
                  </span>
                </Link>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
                    <span className="text-amber-500">{featuredPost.category?.name}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredPost.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`} className="block">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight hover:text-amber-400 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-neutral-400 text-base leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-950">
                    <div className="flex items-center gap-3">
                      {featuredPost.author?.avatar && typeof featuredPost.author.avatar === 'object' && featuredPost.author.avatar.url ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-800">
                          <Image
                            src={featuredPost.author.avatar.url}
                            alt={featuredPost.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                          <User className="w-4.5 h-4.5 text-neutral-500" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-neutral-300">
                        {featuredPost.author?.name}
                      </span>
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-400 group/link">
                      Read Article <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Latest/Other Articles List (Medium layout) */}
            <div className="space-y-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-neutral-900 pb-3">
                {search || categorySlug ? 'Search Results' : 'Latest Insights'}
              </h3>
              
              <div className="divide-y divide-neutral-900">
                {otherPosts.map((post: any) => (
                  <article key={post.id} className="group py-6 first:pt-0 flex flex-col-reverse md:flex-row gap-6 justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="text-amber-500 font-semibold">{post.category?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-800" />
                        <span>
                          {new Date(post.publishedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`} className="block">
                        <h4 className="text-xl font-bold text-white hover:text-amber-400 transition-colors leading-snug">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-3 pt-2">
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
                        <span className="text-xs text-neutral-400 font-medium">
                          {post.author?.name}
                        </span>
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden border border-neutral-900 bg-neutral-950 flex-shrink-0">
                      {post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url ? (
                        <Image
                          src={post.coverImage.url}
                          alt={post.coverImage.alt || post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-102"
                          sizes="(max-width: 768px) 100vw, 150px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900 text-xs">
                          No Image
                        </div>
                      )}
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            {/* About Box */}
            <div className="border border-neutral-900 bg-neutral-950/20 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">About PortsAI</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                PortsAI is a leading-edge logistics platform optimizing global trade. Our blog brings you expert insights on supply chain optimization, port automation, marine analytics, and the future of shipping technology.
              </p>
              <a
                href="https://portsai.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-400 group/site"
              >
                Visit PortsAI.in <ArrowRight className="w-4 h-4 transition-transform group-hover/site:translate-x-0.5" />
              </a>
            </div>

            {/* Newsletter mock sign up */}
            <div className="border border-neutral-900 bg-neutral-950/20 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Informed</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Subscribe to our newsletter to receive the latest updates, trade insights, and articles directly in your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
