import { Metadata } from 'next'
import { HomePage } from '@/components/home-page'
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo/metadata'

export const metadata: Metadata = generateSEOMetadata({
  title: '首頁',
  description: siteConfig.description,
  type: 'website',
})

export default function Page() {
  return <HomePage />
}
