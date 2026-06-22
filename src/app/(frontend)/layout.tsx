import React from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './styles.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  description: 'Premium insights on logistics, supply chain, and global shipping by PortsAI.',
  title: {
    template: '%s | PortsAI Blog',
    default: 'PortsAI Blog - Insights on Global Shipping & Logistics',
  },
  metadataBase: new URL('https://blog.portsai.in'),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-[#0a0a0a] text-neutral-100 font-sans min-h-screen flex flex-col antialiased">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/75 border-b border-neutral-900">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-lg transition-transform group-hover:scale-105">
                P
              </span>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Ports<span className="text-amber-500">AI</span> <span className="font-light text-neutral-400 text-sm ml-1.5 border-l border-neutral-800 pl-2">Blog</span>
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-6">
              <Link
                href="/blog"
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                All Articles
              </Link>
              <a
                href="/admin"
                className="text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all"
              >
                Admin Panel
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-900 bg-neutral-950/50 py-12 mt-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-400">PortsAI.in</span>
              <span>© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="https://portsai.in" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">
                Main Website
              </a>
              <a href="/admin" className="hover:text-neutral-300 transition-colors">
                Admin Panel
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
