import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const title = searchParams.get('title')?.slice(0, 100) || 'Blog Platform'
    const description = searchParams.get('description')?.slice(0, 200) || '探索最新的技術文章、生活隨筆與深度思考'
    const author = searchParams.get('author') || ''
    const date = searchParams.get('date') || new Date().toLocaleDateString('zh-TW')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Blog Platform
            </div>
            
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
            
            <p
              style={{
                fontSize: '28px',
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              {author && (
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  作者：{author}
                </div>
              )}
              <div
                style={{
                  fontSize: '20px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {date}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: Error | unknown) {
    console.log(`${e instanceof Error ? e.message : 'Unknown error'}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
