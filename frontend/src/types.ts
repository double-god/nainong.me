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

export interface Comment {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string

  postSlug: string
  content: string
  nickname: string
  email?: string
  website?: string
  ip: string
  userAgent?: string
  parentId?: string
  pinned?: boolean
}

export interface CommentFormData {
  nickname: string
  email?: string
  website?: string
  content: string
  parentId?: string
}

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
}
