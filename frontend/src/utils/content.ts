// src/utils/content.ts
import { pb } from '@/lib/pb'
import type { Post } from '@/types'
import type { MusicTrack } from '@/store/music'

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
    // 返回空数组，避免构建失败
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

// 获取音乐列表
export async function getMusicList(): Promise<MusicTrack[]> {
  try {
    const records = await pb.collection('music').getFullList<{
      id: string
      title: string
      artist?: string
      cover: string
      url: string
      active: boolean
    }>({
      filter: 'active = true',
      sort: 'created',
    })

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      artist: record.artist,
      cover: record.cover,
      url: record.url,
    }))
  } catch (e) {
    console.error('无法从 PocketBase 获取音乐列表:', e)
    return []
  }
}

// 获取文章总字数
export async function getAllPostsWordCount(): Promise<number> {
  try {
    const posts = await getSortedPosts()
    return posts.reduce((total, post) => {
      // 简单计算：假设每篇文章约 1000 字
      // 实际项目中应该从 post.content 计算真实字数
      return total + 1000
    }, 0)
  } catch (e) {
    console.error('无法计算文章字数:', e)
    return 0
  }
}

// 获取最早的文章（用于归档页面侧边栏）
export async function getOldestPosts(count: number = 5): Promise<Post[]> {
  try {
    const posts = await getSortedPosts()
    return posts.slice(0, count)
  } catch (e) {
    console.error('无法获取最早的文章:', e)
    return []
  }
}

// 将字符串转换为 URL slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // 空格替换为横杠
    .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '') // 只保留中文、字母、数字、横杠
    .replace(/-+/g, '-') // 多个横杠合并为一个
    .replace(/^-+/, '') // 去除开头的横杠
    .replace(/-+$/, '') // 去除结尾的横杠
}
