export interface SEOScoreResult {
  score: number
  maxScore: number
  percentage: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: SEOCheck[]
  suggestions: string[]
}

export interface SEOCheck {
  name: string
  passed: boolean
  score: number
  maxScore: number
  message: string
}

export interface SEOAnalysisInput {
  title: string
  content: string
  excerpt?: string | null
  tags?: string[]
  categories?: string[]
}

export function calculateSEOScore(input: SEOAnalysisInput): SEOScoreResult {
  const checks: SEOCheck[] = []
  const suggestions: string[] = []

  // 1. 標題長度檢查 (建議 50-60 字符)
  const titleLength = input.title.length
  let titleScore = 0
  if (titleLength >= 50 && titleLength <= 60) {
    titleScore = 20
  } else if (titleLength >= 30 && titleLength < 50) {
    titleScore = 15
    suggestions.push('標題長度建議在 50-60 字符之間，目前稍短')
  } else if (titleLength > 60 && titleLength <= 70) {
    titleScore = 15
    suggestions.push('標題長度建議在 50-60 字符之間，目前稍長')
  } else if (titleLength < 30) {
    titleScore = 10
    suggestions.push('標題過短，建議增加描述性內容至 50-60 字符')
  } else {
    titleScore = 10
    suggestions.push('標題過長，建議縮短至 60 字符以內')
  }

  checks.push({
    name: '標題長度',
    passed: titleScore >= 15,
    score: titleScore,
    maxScore: 20,
    message: `標題長度 ${titleLength} 字符 (建議 50-60)`,
  })

  // 2. 描述長度檢查 (建議 150-160 字符)
  const excerptLength = input.excerpt?.length || 0
  let excerptScore = 0
  if (excerptLength >= 150 && excerptLength <= 160) {
    excerptScore = 20
  } else if (excerptLength >= 120 && excerptLength < 150) {
    excerptScore = 15
    suggestions.push('描述長度建議在 150-160 字符之間，目前稍短')
  } else if (excerptLength > 160 && excerptLength <= 180) {
    excerptScore = 15
    suggestions.push('描述長度建議在 150-160 字符之間，目前稍長')
  } else if (excerptLength > 0 && excerptLength < 120) {
    excerptScore = 10
    suggestions.push('描述過短，建議增加內容至 150-160 字符')
  } else if (excerptLength === 0) {
    excerptScore = 0
    suggestions.push('缺少描述，建議添加 150-160 字符的描述')
  } else {
    excerptScore = 10
    suggestions.push('描述過長，建議縮短至 160 字符以內')
  }

  checks.push({
    name: '描述長度',
    passed: excerptScore >= 15,
    score: excerptScore,
    maxScore: 20,
    message: excerptLength > 0 
      ? `描述長度 ${excerptLength} 字符 (建議 150-160)`
      : '缺少描述',
  })

  // 3. 內容長度檢查 (建議至少 300 字)
  const contentLength = input.content.length
  let contentScore = 0
  if (contentLength >= 1000) {
    contentScore = 20
  } else if (contentLength >= 500) {
    contentScore = 15
    suggestions.push('內容長度不錯，但建議達到 1000 字以上以獲得更好排名')
  } else if (contentLength >= 300) {
    contentScore = 10
    suggestions.push('內容稍短，建議擴充至 500-1000 字')
  } else {
    contentScore = 5
    suggestions.push('內容過短，建議至少 300 字以上')
  }

  checks.push({
    name: '內容長度',
    passed: contentScore >= 15,
    score: contentScore,
    maxScore: 20,
    message: `內容長度 ${contentLength} 字符 (建議 1000+)`,
  })

  // 4. 關鍵字密度檢查 (建議 1-3%)
  const keywords = extractKeywords(input.content)
  const keywordDensity = calculateKeywordDensity(input.content, keywords)
  let keywordScore = 0
  
  if (keywordDensity >= 1 && keywordDensity <= 3) {
    keywordScore = 20
  } else if (keywordDensity > 0.5 && keywordDensity < 1) {
    keywordScore = 15
    suggestions.push('關鍵字密度稍低，建議適度增加主要關鍵字出現次數')
  } else if (keywordDensity > 3 && keywordDensity <= 5) {
    keywordScore = 10
    suggestions.push('關鍵字密度過高，可能被視為關鍵字堆砌')
  } else if (keywordDensity > 5) {
    keywordScore = 5
    suggestions.push('關鍵字密度過高，請降低關鍵字使用頻率')
  } else {
    keywordScore = 10
    suggestions.push('內容缺少明確的關鍵字，建議設定主題關鍵字')
  }

  checks.push({
    name: '關鍵字密度',
    passed: keywordScore >= 15,
    score: keywordScore,
    maxScore: 20,
    message: `關鍵字密度 ${keywordDensity.toFixed(1)}% (建議 1-3%)`,
  })

  // 5. 標籤與分類檢查
  const hasTags = (input.tags?.length || 0) > 0
  const hasCategories = (input.categories?.length || 0) > 0
  let tagScore = 0
  
  if (hasTags && hasCategories) {
    tagScore = 20
  } else if (hasTags || hasCategories) {
    tagScore = 10
    suggestions.push(hasTags 
      ? '建議添加分類以改善內容組織'
      : '建議添加標籤以提升搜尋可見性'
    )
  } else {
    tagScore = 0
    suggestions.push('缺少標籤和分類，建議添加以提升 SEO')
  }

  checks.push({
    name: '標籤與分類',
    passed: tagScore >= 10,
    score: tagScore,
    maxScore: 20,
    message: hasTags && hasCategories 
      ? `已設定 ${input.tags?.length} 個標籤和 ${input.categories?.length} 個分類`
      : hasTags
      ? `已設定 ${input.tags?.length} 個標籤，缺少分類`
      : hasCategories
      ? `已設定 ${input.categories?.length} 個分類，缺少標籤`
      : '缺少標籤和分類',
  })

  // 計算總分
  const totalScore = checks.reduce((sum, check) => sum + check.score, 0)
  const maxScore = checks.reduce((sum, check) => sum + check.maxScore, 0)
  const percentage = Math.round((totalScore / maxScore) * 100)

  // 評級
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (percentage >= 90) grade = 'A'
  else if (percentage >= 80) grade = 'B'
  else if (percentage >= 70) grade = 'C'
  else if (percentage >= 60) grade = 'D'
  else grade = 'F'

  // 通用建議
  if (suggestions.length === 0) {
    suggestions.push('文章 SEO 表現優秀！繼續保持。')
  }

  return {
    score: totalScore,
    maxScore,
    percentage,
    grade,
    checks,
    suggestions,
  }
}

function extractKeywords(content: string): string[] {
  // 簡單的關鍵字提取：移除常見停用詞，找出高頻詞
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一個', '上', '也', '很', '到', '說', '要', '去', '你', '會', '著', '沒有', '看', '好', '自己', '這', '那', '這個', '那個', '之', '與', '及', '等', '或', '但', '而', '因為', '所以', '如果', '可以', '於', '被', '把', '給', '讓', '向', '從', '對', '為', '以', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'and', 'but', 'or', 'yet', 'so', 'if', 'because', 'although', 'though', 'while', 'where', 'when', 'that', 'which', 'who', 'whom', 'whose', 'what', 'whatever', 'whoever', 'whomever', 'whichever', 'this', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
  ])

  const words = content
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word))

  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

function calculateKeywordDensity(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0
  
  const totalWords = content.split(/\s+/).length
  if (totalWords === 0) return 0

  const keywordCount = keywords.reduce((sum, keyword) => {
    const regex = new RegExp(keyword, 'gi')
    const matches = content.match(regex)
    return sum + (matches?.length || 0)
  }, 0)

  return (keywordCount / totalWords) * 100
}

export function calculateReadability(content: string): {
  score: number
  level: string
} {
  // 簡化的可讀性評分 (基於字數和句數)
  const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  if (sentences.length === 0 || words.length === 0) {
    return { score: 0, level: '無法評估' }
  }

  const avgWordsPerSentence = words.length / sentences.length
  
  // 簡化計算：平均句長在 15-25 字之間為最佳
  let score = 100
  if (avgWordsPerSentence < 10) {
    score -= 20
  } else if (avgWordsPerSentence > 30) {
    score -= 20
  }

  let level: string
  if (score >= 80) level = '易讀'
  else if (score >= 60) level = '適中'
  else level = '較難'

  return { score: Math.max(0, score), level }
}
