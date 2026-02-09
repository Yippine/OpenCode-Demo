import { Metadata } from 'next'

export interface SEOMetadata {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  author?: string
  tags?: string[]
}

export const siteConfig = {
  name: 'Blog Platform',
  description: '探索最新的技術文章、生活隨筆與深度思考',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: 'Blog Platform Team',
  twitter: '@blogplatform',
}

export function generateMetadata({
  title,
  description,
  canonical,
  ogImage,
  type = 'website',
  publishedAt,
  updatedAt,
  author,
  tags,
}: SEOMetadata): Metadata {
  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`
  const fullDescription = description || siteConfig.description
  const url = canonical || siteConfig.url
  const image = ogImage || `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'zh_TW',
      type,
      ...(type === 'article' && {
        publishedTime: publishedAt,
        modifiedTime: updatedAt,
        authors: author ? [author] : undefined,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
      creator: siteConfig.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }
}

export function generatePostMetadata(
  post: {
    title: string
    excerpt: string | null
    slug: string
    createdAt: Date | string
    updatedAt: Date | string
    author: { name: string }
    tags?: { tag: { name: string } }[]
  },
  ogImage?: string
): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt || `閱讀 ${post.title} - ${siteConfig.description}`,
    canonical: `${siteConfig.url}/posts/${post.slug}`,
    ogImage,
    type: 'article',
    publishedAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
    author: post.author.name,
    tags: post.tags?.map(t => t.tag.name),
  })
}

export function generateTagMetadata(
  tag: { name: string; slug: string },
  postCount: number
): Metadata {
  return generateMetadata({
    title: `標籤：${tag.name}`,
    description: `探索 ${postCount} 篇關於 ${tag.name} 的文章`,
    canonical: `${siteConfig.url}/tags/${tag.slug}`,
    type: 'website',
  })
}

export function generateCategoryMetadata(
  category: { name: string; slug: string },
  postCount: number
): Metadata {
  return generateMetadata({
    title: `分類：${category.name}`,
    description: `探索 ${postCount} 篇 ${category.name} 分類的文章`,
    canonical: `${siteConfig.url}/categories/${category.slug}`,
    type: 'website',
  })
}
