import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface RichTextProps {
  content: any
  className?: string
}

const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16
const IS_SUBSCRIPT = 32
const IS_SUPERSCRIPT = 64

function formatText(text: string, format: number): React.ReactNode {
  let element: React.ReactNode = text
  if (format & IS_BOLD) {
    element = <strong className="font-bold text-white">{element}</strong>
  }
  if (format & IS_ITALIC) {
    element = <em className="italic">{element}</em>
  }
  if (format & IS_STRIKETHROUGH) {
    element = <span className="line-through">{element}</span>
  }
  if (format & IS_UNDERLINE) {
    element = <span className="underline decoration-amber-500/40">{element}</span>
  }
  if (format & IS_CODE) {
    element = <code className="bg-neutral-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-sm">{element}</code>
  }
  if (format & IS_SUBSCRIPT) {
    element = <sub>{element}</sub>
  }
  if (format & IS_SUPERSCRIPT) {
    element = <sup>{element}</sup>
  }
  return element
}

function serialize(nodes: any[]): React.ReactNode[] {
  if (!nodes || !Array.isArray(nodes)) return []

  return nodes.map((node, index) => {
    if (!node) return null

    switch (node.type) {
      case 'text': {
        const text = node.text || ''
        return <React.Fragment key={index}>{formatText(text, node.format || 0)}</React.Fragment>
      }
      case 'linebreak':
        return <br key={index} />
      case 'paragraph':
        return (
          <p key={index} className="mb-6 text-neutral-300 leading-relaxed text-lg font-sans">
            {node.children ? serialize(node.children) : null}
          </p>
        )
      case 'heading': {
        const Tag = node.tag || 'h2'
        const headingClasses: Record<string, string> = {
          h1: 'text-4xl font-extrabold text-white mt-10 mb-5 tracking-tight font-sans',
          h2: 'text-3xl font-bold text-white mt-8 mb-4 tracking-tight font-sans',
          h3: 'text-2xl font-semibold text-white mt-6 mb-3 font-sans',
          h4: 'text-xl font-semibold text-white mt-5 mb-2 font-sans',
          h5: 'text-lg font-semibold text-white mt-4 mb-2 font-sans',
          h6: 'text-base font-semibold text-white mt-4 mb-2 font-sans',
        }
        return (
          <Tag key={index} className={headingClasses[Tag] || headingClasses.h2}>
            {node.children ? serialize(node.children) : null}
          </Tag>
        )
      }
      case 'list': {
        const Tag = node.listType === 'ordered' ? 'ol' : 'ul'
        const listClass =
          node.listType === 'ordered'
            ? 'list-decimal pl-6 mb-6 space-y-2 text-neutral-300 text-lg'
            : 'list-disc pl-6 mb-6 space-y-2 text-neutral-300 text-lg'
        return (
          <Tag key={index} className={listClass}>
            {node.children ? serialize(node.children) : null}
          </Tag>
        )
      }
      case 'listitem':
        return (
          <li key={index} className="text-neutral-300 leading-relaxed">
            {node.children ? serialize(node.children) : null}
          </li>
        )
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-amber-500 pl-5 italic text-neutral-300 my-8 bg-neutral-900/40 py-4 pr-4 rounded-r font-sans text-xl">
            {node.children ? serialize(node.children) : null}
          </blockquote>
        )
      case 'code': {
        return (
          <pre key={index} className="bg-neutral-950 p-5 rounded-xl overflow-x-auto my-8 border border-neutral-800 font-mono text-sm text-neutral-200">
            <code>{node.children ? serialize(node.children) : node.text || ''}</code>
          </pre>
        )
      }
      case 'upload': {
        const media = node.value
        if (!media || !media.url) return null
        
        // Handle custom image sizes (Full, Medium, Small)
        const size = node.fields?.size || 'full'
        const sizeClasses = {
          full: 'w-full max-h-[550px] aspect-[16/10]',
          medium: 'w-full md:w-3/4 max-h-[450px] aspect-[16/10]',
          small: 'w-full md:w-1/2 max-h-[350px] aspect-[16/10]',
        }
        const selectedClass = sizeClasses[size as 'full' | 'medium' | 'small'] || sizeClasses.full

        return (
          <div key={index} className="my-10 flex flex-col items-center justify-center w-full">
            <div className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 ${selectedClass}`}>
              <Image
                src={media.url}
                alt={media.alt || 'Blog Image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            {media.alt && <span className="text-sm text-neutral-500 mt-3 italic text-center">{media.alt}</span>}
          </div>
        )
      }
      case 'link': {
        const url = node.fields?.url || ''
        const newTab = node.fields?.newTab
        const isInternal = url.startsWith('/') || url.startsWith('http://localhost') || url.includes('blog.portsai.in')
        if (isInternal) {
          return (
            <Link
              key={index}
              href={url}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/30 transition-colors"
            >
              {node.children ? serialize(node.children) : url}
            </Link>
          )
        }
        return (
          <a
            key={index}
            href={url}
            target={newTab ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/30 transition-colors"
          >
            {node.children ? serialize(node.children) : url}
          </a>
        )
      }
      case 'block': {
        const blockType = node.fields?.blockType
        if (blockType === 'Code') {
          const code = node.fields?.code || ''
          const language = node.fields?.language || ''
          return (
            <pre key={index} className="bg-neutral-950 p-5 rounded-xl overflow-x-auto my-8 border border-neutral-800 font-mono text-sm text-neutral-200">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-900 pb-2 mb-3">
                <span>{language}</span>
              </div>
              <code>{code}</code>
            </pre>
          )
        }
        return null
      }
      case 'horizontalrule':
        return <hr key={index} className="border-neutral-800 my-10" />
      default:
        if (node.children) {
          return <React.Fragment key={index}>{serialize(node.children)}</React.Fragment>
        }
        return null
    }
  })
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content || !content.root || !content.root.children) return null

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {serialize(content.root.children)}
    </div>
  )
}
