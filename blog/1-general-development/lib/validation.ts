// 驗證工具
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  password: z.string().min(6, '密碼至少需要 6 個字元'),
})

export const postSchema = z.object({
  title: z.string().min(1, '標題為必填'),
  content: z.string().min(1, '內容為必填'),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export const tagSchema = z.object({
  name: z.string().min(1, '標籤名稱為必填'),
  description: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PostInput = z.infer<typeof postSchema>
export type TagInput = z.infer<typeof tagSchema>
