/**
 * Comment Form Component
 * Form for submitting new comments
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  commentSubmittingAtom,
  canSubmitCommentAtom,
  submitRemainingTimeAtom,
  replyToAtom,
} from '@/store/comments'
import { createComment } from '@/utils/comments'
import {
  validateNickname,
  validateEmail,
  validateWebsite,
  validateContent,
} from '@/lib/sanitize'

interface CommentFormProps {
  postSlug: string
  onSuccess?: () => void
}

export function CommentForm({ postSlug, onSuccess }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useAtom(commentSubmittingAtom)
  const [canSubmit] = useAtom(canSubmitCommentAtom)
  const [remainingTime] = useAtom(submitRemainingTimeAtom)
  const [replyTo, setReplyTo] = useAtom(replyToAtom)

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [content, setContent] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Format remaining time
  const formatRemainingTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}秒`
  }

  // Validate field
  const validateField = (name: string, value: string) => {
    let error = ''

    switch (name) {
      case 'nickname':
        error = validateNickname(value).error || ''
        break
      case 'email':
        error = validateEmail(value).error || ''
        break
      case 'website':
        error = validateWebsite(value).error || ''
        break
      case 'content':
        error = validateContent(value).error || ''
        break
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }

  // Handle field change
  const handleFieldChange = (name: string, value: string) => {
    switch (name) {
      case 'nickname':
        setNickname(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'website':
        setWebsite(value)
        break
      case 'content':
        setContent(value)
        break
    }

    if (touched[name]) {
      validateField(name, value)
    }
  }

  // Handle field blur
  const handleFieldBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyTo(null)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check rate limit
    if (!canSubmit) {
      toast.error(`请等待${formatRemainingTime(remainingTime)}后再试`)
      return
    }

    // Validate all fields
    const isNicknameValid = validateField('nickname', nickname)
    const isEmailValid = validateField('email', email)
    const isWebsiteValid = validateField('website', website)
    const isContentValid = validateField('content', content)

    if (!isNicknameValid || !isEmailValid || !isWebsiteValid || !isContentValid) {
      toast.error('请检查表单填写')
      return
    }

    setIsSubmitting(true)

    try {
      await createComment(postSlug, {
        nickname,
        email: email || undefined,
        website: website || undefined,
        content,
        parentId: replyTo || undefined,
      })

      toast.success('评论发表成功！')

      // Reset form
      setNickname('')
      setEmail('')
      setWebsite('')
      setContent('')
      setErrors({})
      setTouched({})
      setReplyTo(null)

      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit comment:', error)
      toast.error('评论发表失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
          <span className="text-sm text-secondary">
            回复评论 <span className="text-accent">#{replyTo.slice(0, 8)}</span>
          </span>
          <button
            type="button"
            onClick={handleCancelReply}
            className="p-1 hover:bg-secondary/20 rounded transition-colors"
            aria-label="取消回复"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Nickname (required) */}
      <div>
        <label htmlFor="comment-nickname" className="block text-sm font-medium text-primary mb-1">
          昵称 <span className="text-accent">*</span>
        </label>
        <input
          id="comment-nickname"
          type="text"
          value={nickname}
          onChange={(e) => handleFieldChange('nickname', e.target.value)}
          onBlur={() => handleFieldBlur('nickname', nickname)}
          disabled={isSubmitting}
          placeholder="请输入昵称"
          className={`w-full px-3 py-2 rounded-lg border bg-primary text-primary placeholder:text-secondary/50 transition-colors ${
            touched.nickname && errors.nickname
              ? 'border-red-500 focus:border-red-500'
              : 'border-primary/30 focus:border-accent'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={touched.nickname && !!errors.nickname}
          aria-describedby={errors.nickname ? 'comment-nickname-error' : undefined}
        />
        {touched.nickname && errors.nickname && (
          <p id="comment-nickname-error" className="mt-1 text-sm text-red-500">
            {errors.nickname}
          </p>
        )}
      </div>

      {/* Email (optional) */}
      <div>
        <label htmlFor="comment-email" className="block text-sm font-medium text-primary mb-1">
          邮箱 <span className="text-secondary/50 text-xs">(可选，用于头像)</span>
        </label>
        <input
          id="comment-email"
          type="email"
          value={email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email', email)}
          disabled={isSubmitting}
          placeholder="your@email.com"
          className={`w-full px-3 py-2 rounded-lg border bg-primary text-primary placeholder:text-secondary/50 transition-colors ${
            touched.email && errors.email
              ? 'border-red-500 focus:border-red-500'
              : 'border-primary/30 focus:border-accent'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'comment-email-error' : undefined}
        />
        {touched.email && errors.email && (
          <p id="comment-email-error" className="mt-1 text-sm text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Website (optional) */}
      <div>
        <label htmlFor="comment-website" className="block text-sm font-medium text-primary mb-1">
          网站 <span className="text-secondary/50 text-xs">(可选)</span>
        </label>
        <input
          id="comment-website"
          type="url"
          value={website}
          onChange={(e) => handleFieldChange('website', e.target.value)}
          onBlur={() => handleFieldBlur('website', website)}
          disabled={isSubmitting}
          placeholder="https://yourwebsite.com"
          className={`w-full px-3 py-2 rounded-lg border bg-primary text-primary placeholder:text-secondary/50 transition-colors ${
            touched.website && errors.website
              ? 'border-red-500 focus:border-red-500'
              : 'border-primary/30 focus:border-accent'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={touched.website && !!errors.website}
          aria-describedby={errors.website ? 'comment-website-error' : undefined}
        />
        {touched.website && errors.website && (
          <p id="comment-website-error" className="mt-1 text-sm text-red-500">
            {errors.website}
          </p>
        )}
      </div>

      {/* Content (required) */}
      <div>
        <label htmlFor="comment-content" className="block text-sm font-medium text-primary mb-1">
          评论内容 <span className="text-accent">*</span>
          <span className="text-secondary/50 text-xs ml-2">(支持 Markdown 语法)</span>
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          onBlur={() => handleFieldBlur('content', content)}
          disabled={isSubmitting}
          placeholder="发条友善的评论吧（支持 Markdown 语法）…"
          rows={5}
          className={`w-full px-3 py-2 rounded-lg border bg-primary text-primary placeholder:text-secondary/50 transition-colors resize-none ${
            touched.content && errors.content
              ? 'border-red-500 focus:border-red-500'
              : 'border-primary/30 focus:border-accent'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={touched.content && !!errors.content}
          aria-describedby={errors.content ? 'comment-content-error' : undefined}
        />
        {touched.content && errors.content && (
          <p id="comment-content-error" className="mt-1 text-sm text-red-500">
            {errors.content}
          </p>
        )}
        <div className="mt-1 text-xs text-secondary/50 text-right">
          {content.length} / 5000
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="w-full md:w-auto px-6 py-2.5 bg-accent text-primary font-medium rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '发表中…' : '发表评论'}
      </button>

      {!canSubmit && (
        <p className="text-sm text-secondary/50">
          请等待 {formatRemainingTime(remainingTime)} 后再试
        </p>
      )}
    </form>
  )
}
