import { NextRequest, NextResponse } from 'next/server'
import { extractKeywords, suggestKeywords, getKeywordDensityWarnings } from '@/lib/seo/keywords'

// POST /api/admin/keywords - 分析關鍵字
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, existingTags = [], targetKeyword } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const analysis = extractKeywords(content)
    const suggestions = suggestKeywords(content, existingTags)
    
    let densityCheck = null
    if (targetKeyword) {
      densityCheck = getKeywordDensityWarnings(content, targetKeyword)
    }

    return NextResponse.json({
      analysis,
      suggestions,
      densityCheck,
    })
  } catch (error) {
    console.error('Keyword analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500 }
    )
  }
}

// GET /api/admin/keywords?content=... - 快速分析
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const content = searchParams.get('content')

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const analysis = extractKeywords(content, 15)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Keyword analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze keywords' },
      { status: 500 }
    )
  }
}
