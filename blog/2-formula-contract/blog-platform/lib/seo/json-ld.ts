import { siteConfig } from './metadata'

export interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  image?: string[]
  datePublished: string
  dateModified: string
  author: {
    '@type': 'Person' | 'Organization'
    name: string
  }
  publisher: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
  mainEntityOfPage: {
    '@type': 'WebPage'
    '@id': string
  }
  articleSection?: string
  keywords?: string[]
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: {
    '@type': 'ListItem'
    position: number
    name: string
    item?: string
  }[]
}

export interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export function generateArticleSchema(
  post: {
    title: string
    excerpt: string | null
    slug: string
    createdAt: Date | string
    updatedAt: Date | string
    author: { name: string }
    categories?: { category: { name: string } }[]
    tags?: { tag: { name: string } }[]
  },
  imageUrl?: string
): ArticleSchema {
  const keywords = [
    ...(post.categories?.map(c => c.category.name) || []),
    ...(post.tags?.map(t => t.tag.name) || []),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/posts/${post.slug}`,
    },
    articleSection: post.categories?.[0]?.category.name,
    keywords: keywords.length > 0 ? keywords : undefined,
  }
}

export function generateBreadcrumbSchema(
  items: { name: string; url?: string }[]
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateTagPageSchema(
  tag: { name: string; slug: string },
  postCount: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `標籤：${tag.name}`,
    description: `探索 ${postCount} 篇關於 ${tag.name} 的文章`,
    url: `${siteConfig.url}/tags/${tag.slug}`,
  }
}

export function generateCategoryPageSchema(
  category: { name: string; slug: string },
  postCount: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `分類：${category.name}`,
    description: `探索 ${postCount} 篇 ${category.name} 分類的文章`,
    url: `${siteConfig.url}/categories/${category.slug}`,
  }
}

export function serializeSchema(schema: object): string {
  return JSON.stringify(schema, null, 2)
}
