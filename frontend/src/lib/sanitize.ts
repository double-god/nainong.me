/**
 * XSS Protection utilities
 * Uses DOMPurify to sanitize user input and prevent XSS attacks
 */

import DOMPurify from 'dompurify'

// Configure DOMPurify for comment content
const purifyConfig = {
  ALLOWED_TAGS: [
    // Basic formatting
    'p', 'br', 'hr',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Text formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'pre',
    // Lists
    'ul', 'ol', 'li',
    // Blockquotes
    'blockquote',
    // Links (with safety checks)
    'a',
    // Images
    'img',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    // Other
    'div', 'span',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id',
    'target', 'rel',
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload'],
  // Add rel="noopener noreferrer" to all links
  ADD_ATTR: ['target'],
}

// Configure purify with our settings (only in browser)
if (typeof window !== 'undefined') {
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    // Add rel="noopener noreferrer" to all links
    if (data.attrName === 'href' && node.tagName === 'A') {
      node.setAttribute('rel', 'noopener noreferrer')
      node.setAttribute('target', '_blank')
    }
  })
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, purifyConfig)
}

/**
 * Sanitize plain text input (nickname, email, etc.)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  // Basic URL validation and sanitization
  if (!url) return ''

  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return ''
    }
    return parsed.href
  } catch {
    return ''
  }
}

/**
 * Validate nickname
 */
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(nickname)

  if (!sanitized || sanitized.trim().length === 0) {
    return { valid: false, error: '昵称不能为空' }
  }

  if (sanitized.length > 50) {
    return { valid: false, error: '昵称不能超过50个字符' }
  }

  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: true } // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' }
  }

  return { valid: true }
}

/**
 * Validate website URL
 */
export function validateWebsite(website: string): { valid: boolean; error?: string } {
  if (!website || website.trim().length === 0) {
    return { valid: true } // Website is optional
  }

  const sanitized = sanitizeUrl(website)
  if (!sanitized) {
    return { valid: false, error: '网站链接格式不正确' }
  }

  return { valid: true }
}

/**
 * Validate comment content
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeHtml(content)

  if (!sanitized || sanitized.trim().length === 0) {
    return { valid: false, error: '评论内容不能为空' }
  }

  if (sanitized.length < 5) {
    return { valid: false, error: '评论内容至少需要5个字符' }
  }

  if (sanitized.length > 5000) {
    return { valid: false, error: '评论内容不能超过5000个字符' }
  }

  return { valid: true }
}
