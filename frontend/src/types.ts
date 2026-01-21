// src/types.ts
export interface Post {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string

  title: string
  slug: string
  content: string
  summary?: string
  cover?: string
  tags?: string[]
  category?: string

  // 👇 新增这一行
  draft?: boolean
}
