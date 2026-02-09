/**
 * Comment API utilities
 * Handles all PocketBase comment operations
 */

import { pb } from '@/lib/pb'
import type { Comment, CommentFormData, CommentWithReplies } from '@/types'
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '@/lib/sanitize'

const COMMENTS_COLLECTION = 'comments'
const COMMENTS_PER_PAGE = 20
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Cache management
const commentCache = new Map<string, { data: Comment[]; timestamp: number }>()

function getCacheKey(postSlug: string, page: number = 1): string {
  return `${postSlug}-${page}`
}

function setCache(postSlug: string, page: number, data: Comment[]) {
  commentCache.set(getCacheKey(postSlug, page), {
    data,
    timestamp: Date.now(),
  })
}

function getCache(postSlug: string, page: number = 1): Comment[] | null {
  const cached = commentCache.get(getCacheKey(postSlug, page))
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function clearCache(postSlug?: string) {
  if (postSlug) {
    // Clear all cache entries for this post
    for (const [key] of commentCache) {
      if (key.startsWith(postSlug)) {
        commentCache.delete(key)
      }
    }
  } else {
    commentCache.clear()
  }
}

/**
 * Get client IP address
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Get user agent
 */
function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
}

/**
 * Fetch comments for a post with pagination
 */
export async function fetchComments(
  postSlug: string,
  page: number = 1
): Promise<{ items: Comment[]; totalItems: number; totalPages: number }> {
  // Check cache first
  const cached = getCache(postSlug, page)
  if (cached) {
    return {
      items: cached,
      totalItems: cached.length,
      totalPages: Math.ceil(cached.length / COMMENTS_PER_PAGE),
    }
  }

  try {
    const result = await pb.collection(COMMENTS_COLLECTION).getList<Comment>(page, COMMENTS_PER_PAGE, {
      filter: `postSlug = "${postSlug}"`,
      sort: '-pinned,-created',
    })

    // Cache the result
    setCache(postSlug, page, result.items)

    return {
      items: result.items,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return { items: [], totalItems: 0, totalPages: 0 }
  }
}

/**
 * Fetch all comments for a post (no pagination)
 */
export async function fetchAllComments(postSlug: string): Promise<Comment[]> {
  try {
    const result = await pb.collection(COMMENTS_COLLECTION).getFullList<Comment>({
      filter: `postSlug = "${postSlug}"`,
      sort: '-pinned,-created',
    })

    // Cache the result
    setCache(postSlug, 1, result)

    return result
  } catch (error) {
    console.error('Failed to fetch all comments:', error)
    return []
  }
}

/**
 * Organize comments into nested structure
 */
export function organizeComments(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const rootComments: CommentWithReplies[] = []

  // First pass: create map and initialize replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parentId && commentMap.has(comment.parentId)) {
      // This is a reply
      const parent = commentMap.get(comment.parentId)!
      if (!parent.replies) {
        parent.replies = []
      }
      parent.replies.push(commentWithReplies)
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

/**
 * Create a new comment
 */
export async function createComment(
  postSlug: string,
  formData: CommentFormData
): Promise<Comment | null> {
  try {
    const ip = await getClientIP()
    const userAgent = getUserAgent()

    // Sanitize input
    const sanitizedData = {
      postSlug,
      content: sanitizeHtml(formData.content),
      nickname: sanitizeText(formData.nickname),
      email: formData.email ? sanitizeText(formData.email) : undefined,
      website: formData.website ? sanitizeUrl(formData.website) : undefined,
      ip,
      userAgent,
      parentId: formData.parentId || undefined,
    }

    const result = await pb.collection(COMMENTS_COLLECTION).create<Comment>(sanitizedData)

    // Clear cache for this post
    clearCache(postSlug)

    return result
  } catch (error) {
    console.error('Failed to create comment:', error)
    throw error
  }
}

/**
 * Get avatar URL from local SVG (most reliable)
 */
export function getUIAvatarUrl(nickname: string, size: number = 80): string {
  // Use first character for avatar
  const initial = nickname.trim().charAt(0).toUpperCase() || '?'
  // Generate colors based on nickname for consistency
  const colors = ['6366f1', '8b5cf6', 'ec4899', 'f43f5e', 'f97316', 'eab308', '22c55e', '14b8a6', '0ea5e9', '3b82f6']
  const colorIndex = nickname.charCodeAt(0) % colors.length
  const backgroundColor = colors[colorIndex]

  // Create SVG data URL
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#${backgroundColor}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size * 0.45}" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="600">
        ${initial}
      </text>
    </svg>
  `.trim()

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Get avatar URL from Gravatar (using China-friendly mirror)
 */
export function getGravatarUrl(email: string, size: number = 80): string {
  const cleanEmail = email.trim().toLowerCase()
  const hash = md5(cleanEmail)
  // Use gravatar.loli.net mirror for China accessibility
  return `https://gravatar.loli.net/avatar/${hash}?s=${size}&d=retro`
}

/**
 * Calculate MD5 hash (simple implementation)
 */
function md5(string: string): string {
  function rotateLeft(value: number, shift: number) {
    return (value << shift) | (value >>> (32 - shift))
  }

  function addUnsigned(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  function f(x: number, y: number, z: number) {
    return (x & y) | (~x & z)
  }
  function g(x: number, y: number, z: number) {
    return (x & z) | (y & ~z)
  }
  function h(x: number, y: number, z: number) {
    return x ^ y ^ z
  }
  function i(x: number, y: number, z: number) {
    return y ^ (x | ~z)
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(str: string) {
    let lWordCount = 0
    const lNumberOfWordsTemp1 = str.length
    let lNumberOfWordsTemp2 = lNumberOfWordsTemp1 + 8
    let lNumberOfWords = (lNumberOfWordsTemp2 - (lNumberOfWordsTemp2 % 64)) / 64
    let lByteCount = (lNumberOfWords + 1) * 16
    const lWordArray: number[] = Array(lByteCount - 1).fill(0)
    let lBytePosition = 0
    let lByteCountCurrent = 0
    while (lByteCountCurrent < lNumberOfWordsTemp1) {
      lWordCount = (lByteCountCurrent - (lByteCountCurrent % 4)) / 4
      lBytePosition = (lByteCountCurrent % 4) * 8
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCountCurrent) << lBytePosition)
      lByteCountCurrent++
    }
    lWordCount = (lByteCountCurrent - (lByteCountCurrent % 4)) / 4
    lBytePosition = (lByteCountCurrent % 4) * 8
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
    lWordArray[lByteCount - 2] = lNumberOfWordsTemp1 << 3
    lWordArray[lByteCount - 2] = lWordArray[lByteCount - 2] | (lNumberOfWordsTemp1 >>> 29)
    return lWordArray
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = ''
    let wordToHexValueTemp = ''
    let lByte = 0
    let lCount = 0
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255
      wordToHexValueTemp = '0' + lByte.toString(16)
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2)
    }
    return wordToHexValue
  }

  const x = convertToWordArray(string)
  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const s11 = 7
  const s12 = 12
  const s13 = 17
  const s14 = 22
  const s21 = 5
  const s22 = 9
  const s23 = 14
  const s24 = 20
  const s31 = 4
  const s32 = 11
  const s33 = 16
  const s34 = 23
  const s41 = 6
  const s42 = 10
  const s43 = 15
  const s44 = 21

  for (let k = 0; k < x.length; k += 16) {
    const AA = a
    const BB = b
    const CC = c
    const DD = d

    a = ff(a, b, c, d, x[k + 0], s11, 0xd76aa478)
    d = ff(d, a, b, c, x[k + 1], s12, 0xe8c7b756)
    c = ff(c, d, a, b, x[k + 2], s13, 0x242070db)
    b = ff(b, c, d, a, x[k + 3], s14, 0xc1bdceee)
    a = ff(a, b, c, d, x[k + 4], s11, 0xf57c0faf)
    d = ff(d, a, b, c, x[k + 5], s12, 0x4787c62a)
    c = ff(c, d, a, b, x[k + 6], s13, 0xa8304613)
    b = ff(b, c, d, a, x[k + 7], s14, 0xfd469501)
    a = ff(a, b, c, d, x[k + 8], s11, 0x698098d8)
    d = ff(d, a, b, c, x[k + 9], s12, 0x8b44f7af)
    c = ff(c, d, a, b, x[k + 10], s13, 0xffff5bb1)
    b = ff(b, c, d, a, x[k + 11], s14, 0x895cd7be)
    a = ff(a, b, c, d, x[k + 12], s11, 0x6b901122)
    d = ff(d, a, b, c, x[k + 13], s12, 0xfd987193)
    c = ff(c, d, a, b, x[k + 14], s13, 0xa679438e)
    b = ff(b, c, d, a, x[k + 15], s14, 0x49b40821)
    a = gg(a, b, c, d, x[k + 1], s21, 0xf61e2562)
    d = gg(d, a, b, c, x[k + 6], s22, 0xc040b340)
    c = gg(c, d, a, b, x[k + 11], s23, 0x265e5a51)
    b = gg(b, c, d, a, x[k + 0], s24, 0xe9b6c7aa)
    a = gg(a, b, c, d, x[k + 5], s21, 0xd62f105d)
    d = gg(d, a, b, c, x[k + 10], s22, 0x2441453)
    c = gg(c, d, a, b, x[k + 15], s23, 0xd8a1e681)
    b = gg(b, c, d, a, x[k + 4], s24, 0xe7d3fbc8)
    a = gg(a, b, c, d, x[k + 9], s21, 0x21e1cde6)
    d = gg(d, a, b, c, x[k + 14], s22, 0xc33707d6)
    c = gg(c, d, a, b, x[k + 3], s23, 0xf4d50d87)
    b = gg(b, c, d, a, x[k + 8], s24, 0x455a14ed)
    a = gg(a, b, c, d, x[k + 13], s21, 0xa9e3e905)
    d = gg(d, a, b, c, x[k + 2], s22, 0xfcefa3f8)
    c = gg(c, d, a, b, x[k + 7], s23, 0x676f02d9)
    b = gg(b, c, d, a, x[k + 12], s24, 0x8d2a4c8a)
    a = hh(a, b, c, d, x[k + 5], s31, 0xfffa3942)
    d = hh(d, a, b, c, x[k + 8], s32, 0x8771f681)
    c = hh(c, d, a, b, x[k + 11], s33, 0x6d9d6122)
    b = hh(b, c, d, a, x[k + 14], s34, 0xfde5380c)
    a = hh(a, b, c, d, x[k + 1], s31, 0xa4beea44)
    d = hh(d, a, b, c, x[k + 4], s32, 0x4bdecfa9)
    c = hh(c, d, a, b, x[k + 7], s33, 0xf6bb4b60)
    b = hh(b, c, d, a, x[k + 10], s34, 0xbebfbc70)
    a = hh(a, b, c, d, x[k + 13], s31, 0x289b7ec6)
    d = hh(d, a, b, c, x[k + 2], s32, 0xeaa127fa)
    c = hh(c, d, a, b, x[k + 5], s33, 0xd4ef3085)
    b = hh(b, c, d, a, x[k + 8], s34, 0x4881d05)
    a = hh(a, b, c, d, x[k + 11], s31, 0xd9d4d039)
    d = hh(d, a, b, c, x[k + 14], s32, 0xe6db99e5)
    c = hh(c, d, a, b, x[k + 1], s33, 0x1fa27cf8)
    b = hh(b, c, d, a, x[k + 4], s34, 0xc4ac5665)
    a = ii(a, b, c, d, x[k + 7], s41, 0xf4292244)
    d = ii(d, a, b, c, x[k + 10], s42, 0x432aff97)
    c = ii(c, d, a, b, x[k + 13], s43, 0xab9423a7)
    b = ii(b, c, d, a, x[k + 0], s44, 0xfc93a039)
    a = ii(a, b, c, d, x[k + 3], s41, 0x655b59c3)
    d = ii(d, a, b, c, x[k + 6], s42, 0x8f0ccc92)
    c = ii(c, d, a, b, x[k + 9], s43, 0xffeff47d)
    b = ii(b, c, d, a, x[k + 12], s44, 0x85845dd1)
    a = ii(a, b, c, d, x[k + 15], s41, 0x6fa87e4f)
    d = ii(d, a, b, c, x[k + 2], s42, 0xfe2ce6e0)
    c = ii(c, d, a, b, x[k + 5], s43, 0xa3014314)
    b = ii(b, c, d, a, x[k + 8], s44, 0x4e0811a1)
    a = ii(a, b, c, d, x[k + 11], s41, 0xf7537e82)
    d = ii(d, a, b, c, x[k + 14], s42, 0xbd3af235)
    c = ii(c, d, a, b, x[k + 1], s43, 0x2ad7d2bb)
    b = ii(b, c, d, a, x[k + 4], s44, 0xeb86d391)

    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}

/**
 * Get avatar URL (tries Gravatar first, falls back to UI Avatars)
 */
export function getAvatarUrl(email: string | undefined, nickname: string, size: number = 80): string {
  if (email && email.includes('@')) {
    return getGravatarUrl(email, size)
  }
  return getUIAvatarUrl(nickname, size)
}
