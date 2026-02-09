import { User, Post, Tag, Category } from '@prisma/client'

export type { User, Post, Tag, Category }

export interface PostWithRelations extends Post {
  author: User
  tags: Tag[]
  categories: Category[]
}

export interface UserWithPosts extends User {
  posts: Post[]
}

export type Role = 'ADMIN' | 'AUTHOR'
