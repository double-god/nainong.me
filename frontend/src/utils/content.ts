// src/utils/content.ts
import { pb } from '@/lib/pb'
import type { Post } from '@/types'

// 获取所有文章 (按时间倒序)
export async function getSortedPosts(): Promise<Post[]> {
  try {
    // 假设你的表名叫 'posts'
    const records = await pb.collection('posts').getFullList<Post>({
      sort: '-created',
    })
    return records
  } catch (e) {
    console.error('无法从 PocketBase 获取文章:', e)
    return []
  }
}

// 获取所有标签 (需要你手动从文章里提取，或者 PB 单独建表)
// 这里先返回空，防止报错
export async function getAllTags() {
  return []
}

// 获取所有分类
export async function getAllCategories() {
  return []
}

// 获取热门标签
export async function getHotTags() {
  return []
}
