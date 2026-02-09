import { NextRequest, NextResponse } from 'next/server'
import { calculateSEOScore, SEOAnalysisInput } from '@/lib/seo/score'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const input: SEOAnalysisInput = {
      title: body.title || '',
      content: body.content || '',
      excerpt: body.excerpt,
      tags: body.tags || [],
      categories: body.categories || [],
    }

    const result = calculateSEOScore(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error('SEO score calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate SEO score' },
      { status: 500 }
    )
  }
}
