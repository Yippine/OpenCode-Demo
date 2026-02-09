'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface SEOCheck {
  name: string
  passed: boolean
  score: number
  maxScore: number
  message: string
}

interface SEOScoreResult {
  score: number
  maxScore: number
  percentage: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: SEOCheck[]
  suggestions: string[]
}

interface SEOAnalyzerProps {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  categories?: string[]
}

export function SEOAnalyzer({
  title,
  content,
  excerpt,
  tags = [],
  categories = [],
}: SEOAnalyzerProps) {
  const [result, setResult] = useState<SEOScoreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const analyzeSEO = async () => {
      if (!title || !content) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/seo-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            excerpt,
            tags,
            categories,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to analyze SEO')
        }

        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '分析失敗')
      } finally {
        setLoading(false)
      }
    }

    // 防抖動
    const timeoutId = setTimeout(analyzeSEO, 1000)
    return () => clearTimeout(timeoutId)
  }, [title, content, excerpt, tags, categories])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100'
      case 'B':
        return 'text-blue-600 bg-blue-100'
      case 'C':
        return 'text-yellow-600 bg-yellow-100'
      case 'D':
        return 'text-orange-600 bg-orange-100'
      case 'F':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            SEO 分析中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO 分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">輸入標題和內容以開始 SEO 分析</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SEO 分析結果</span>
          <Badge className={getGradeColor(result.grade)} variant="secondary">
            評級: {result.grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 總分 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>SEO 總分</span>
            <span className="font-medium">
              {result.score} / {result.maxScore} ({result.percentage}%)
            </span>
          </div>
          <Progress
            value={result.percentage}
            className="h-2"
          >
            <div
              className={`h-full transition-all ${getProgressColor(result.percentage)}`}
              style={{ width: `${result.percentage}%` }}
            />
          </Progress>
        </div>

        {/* 檢查項目 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">檢查項目</h4>
          {result.checks.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {check.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-sm">{check.name}</p>
                  <p className="text-xs text-gray-500">{check.message}</p>
                </div>
              </div>
              <span className="text-sm font-medium">
                {check.score}/{check.maxScore}
              </span>
            </div>
          ))}
        </div>

        {/* 建議 */}
        {result.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">改進建議</h4>
            <div className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <Alert key={index} variant="default" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {suggestion}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
