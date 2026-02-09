export interface KeywordAnalysis {
  keywords: KeywordItem[]
  totalWords: number
  uniqueWords: number
  topKeywords: KeywordItem[]
}

export interface KeywordItem {
  word: string
  count: number
  density: number
  tfidf: number
}

export interface KeywordSuggestion {
  keyword: string
  relevance: number
  reason: string
}

// 中文停用詞
const chineseStopWords = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一個', '上', '也', '很', '到', '說', '要', '去', '你', '會', '著', '沒有', '看', '好', '自己', '這', '那', '這個', '那個', '之', '與', '及', '等', '或', '但', '而', '因為', '所以', '如果', '可以', '於', '被', '把', '給', '讓', '向', '從', '對', '為', '以', '它', '們', '他', '她', '我們', '你們', '他們', '她們', '這些', '那些', '什麼', '怎麼', '為什麼', '哪個', '哪裡', '誰', '何時', '如何', '還是', '或者', '並且', '雖然', '但是', '然而', '不過', '而且', '並且', '因此', '因而', '於是', '然後', '接著', '首先', '其次', '最後', '例如', '比如', '像是', '像', '如同', '好像', '似乎', '可能', '也許', '大概', '應該', '必須', '需要', '應當', '得', '該', '須', '需', '當', '須要'
])

// 英文停用詞
const englishStopWords = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'and', 'but', 'or', 'yet', 'so', 'if', 'because', 'although', 'though', 'while', 'where', 'when', 'that', 'which', 'who', 'whom', 'whose', 'what', 'whatever', 'whoever', 'whomever', 'whichever', 'this', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'am', 'having', 'doing'
])

export function extractKeywords(content: string, topN: number = 20): KeywordAnalysis {
  // 清理內容
  const cleanedContent = content
    .replace(/[#*`\[\](){}|]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\n+/g, ' ')

  // 提取中文詞彙 (2-6 個字)
  const chineseWords: string[] = []
  const chineseRegex = /[\u4e00-\u9fa5]{2,6}/g
  let match
  while ((match = chineseRegex.exec(cleanedContent)) !== null) {
    if (!chineseStopWords.has(match[0])) {
      chineseWords.push(match[0])
    }
  }

  // 提取英文詞彙
  const englishWords = cleanedContent
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !englishStopWords.has(word))

  // 合併所有詞彙
  const allWords = [...chineseWords, ...englishWords]
  
  // 統計詞頻
  const wordFreq = new Map<string, number>()
  allWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })

  // 計算 TF-IDF (簡化版本，只使用 TF)
  const totalWords = allWords.length
  const uniqueWords = wordFreq.size

  const keywords: KeywordItem[] = Array.from(wordFreq.entries())
    .map(([word, count]) => ({
      word,
      count,
      density: (count / totalWords) * 100,
      tfidf: count / Math.sqrt(totalWords), // 簡化 TF-IDF
    }))
    .sort((a, b) => b.tfidf - a.tfidf)

  return {
    keywords: keywords.slice(0, topN),
    totalWords,
    uniqueWords,
    topKeywords: keywords.slice(0, 10),
  }
}

export function suggestKeywords(
  content: string,
  existingTags: string[] = []
): KeywordSuggestion[] {
  const analysis = extractKeywords(content, 30)
  const suggestions: KeywordSuggestion[] = []

  // 過濾掉已存在的標籤
  const existingSet = new Set(existingTags.map(t => t.toLowerCase()))
  
  analysis.keywords.forEach(({ word, count, density }) => {
    if (!existingSet.has(word.toLowerCase()) && count >= 2) {
      const relevance = Math.min(100, density * 10 + count * 5)
      let reason = ''

      if (density > 2) {
        reason = '高頻出現，是文章核心主題'
      } else if (count >= 5) {
        reason = '多次出現，與內容高度相關'
      } else if (count >= 3) {
        reason = '適度出現，可作為輔助關鍵字'
      } else {
        reason = '潛在關鍵字，建議考慮添加'
      }

      suggestions.push({
        keyword: word,
        relevance: Math.round(relevance),
        reason,
      })
    }
  })

  return suggestions.slice(0, 10)
}

export function analyzeKeywordTrends(
  posts: { content: string; createdAt: Date }[]
): Map<string, { count: number; trend: 'up' | 'down' | 'stable' }> {
  const monthlyKeywords = new Map<string, Map<string, number>>()

  posts.forEach(post => {
    const month = post.createdAt.toISOString().slice(0, 7) // YYYY-MM
    const analysis = extractKeywords(post.content, 10)
    
    if (!monthlyKeywords.has(month)) {
      monthlyKeywords.set(month, new Map())
    }
    
    const monthMap = monthlyKeywords.get(month)!
    analysis.keywords.forEach(({ word, count }) => {
      monthMap.set(word, (monthMap.get(word) || 0) + count)
    })
  })

  // 計算趨勢
  const trends = new Map<string, { count: number; trend: 'up' | 'down' | 'stable' }>()
  const months = Array.from(monthlyKeywords.keys()).sort()

  if (months.length >= 2) {
    const currentMonth = months[months.length - 1]
    const previousMonth = months[months.length - 2]
    
    const currentKeywords = monthlyKeywords.get(currentMonth)!
    const previousKeywords = monthlyKeywords.get(previousMonth)!

    currentKeywords.forEach((count, word) => {
      const prevCount = previousKeywords.get(word) || 0
      let trend: 'up' | 'down' | 'stable'
      
      if (count > prevCount * 1.2) {
        trend = 'up'
      } else if (count < prevCount * 0.8) {
        trend = 'down'
      } else {
        trend = 'stable'
      }

      trends.set(word, { count, trend })
    })
  }

  return trends
}

export function getKeywordDensityWarnings(
  content: string,
  targetKeyword: string
): { status: 'good' | 'low' | 'high'; message: string; density: number } {
  const words = content.split(/\s+/).filter(w => w.length > 0)
  const totalWords = words.length
  
  if (totalWords === 0) {
    return { status: 'low', message: '內容為空', density: 0 }
  }

  const regex = new RegExp(targetKeyword, 'gi')
  const matches = content.match(regex) || []
  const density = (matches.length / totalWords) * 100

  if (density >= 1 && density <= 3) {
    return { 
      status: 'good', 
      message: `關鍵字密度 ${density.toFixed(1)}% 在理想範圍內 (1-3%)`, 
      density 
    }
  } else if (density < 1) {
    return { 
      status: 'low', 
      message: `關鍵字密度 ${density.toFixed(1)}% 過低，建議增加至 1-3%`, 
      density 
    }
  } else {
    return { 
      status: 'high', 
      message: `關鍵字密度 ${density.toFixed(1)}% 過高，可能導致關鍵字堆砌`, 
      density 
    }
  }
}
