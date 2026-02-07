/**
 * Comment System Component
 * Main component that manages the entire comment system
 */

import { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { MessageSquare } from 'lucide-react'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { CommentSkeleton } from './CommentSkeleton'
import {
  fetchAllComments,
} from '@/utils/comments'
import {
  commentsLoadingAtom,
  setCommentsErrorAtom,
  setCommentsAtom,
  commentsTotalCountAtom,
  commentsTotalPagesAtom,
  lastSubmitTimeAtom,
  resetCommentsPaginationAtom,
} from '@/store/comments'

interface CommentSystemProps {
  postSlug: string
}

export function CommentSystem({ postSlug }: CommentSystemProps) {
  const [loading, setLoading] = useAtom(commentsLoadingAtom)
  const setError = useSetAtom(setCommentsErrorAtom)
  const setComments = useSetAtom(setCommentsAtom)
  const setTotalCount = useSetAtom(commentsTotalCountAtom)
  const setTotalPages = useSetAtom(commentsTotalPagesAtom)
  const setLastSubmitTime = useSetAtom(lastSubmitTimeAtom)

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true)
      setError(null)

      try {
        const comments = await fetchAllComments(postSlug)
        setComments(comments)
        setTotalCount(comments.length)
        setTotalPages(1)
      } catch (error) {
        console.error('Failed to load comments:', error)
        setError('加载评论失败，请刷新页面重试')
      } finally {
        setLoading(false)
      }
    }

    loadComments()

    // Load last submit time from localStorage (global, not per-post)
    const savedTime = localStorage.getItem('comment-submit-global')
    if (savedTime) {
      const parsedTime = parseInt(savedTime, 10)
      // Only restore if within the rate limit period, otherwise reset
      const now = Date.now()
      const RATE_LIMIT = 30 * 1000 // 30 seconds
      if (now - parsedTime < RATE_LIMIT) {
        setLastSubmitTime(parsedTime)
      } else {
        // Too old, clear it
        localStorage.removeItem('comment-submit-global')
      }
    }

    return () => {
      // Cleanup: don't use resetCommentsPaginationAtom as it's not a function
    }
  }, [postSlug])

  // Handle comment success
  const handleCommentSuccess = () => {
    // Update last submit time (global, not per-post)
    const now = Date.now()
    setLastSubmitTime(now)
    localStorage.setItem('comment-submit-global', now.toString())

    // Reload comments
    const reloadComments = async () => {
      setLoading(true)
      try {
        const comments = await fetchAllComments(postSlug)
        setComments(comments)
        setTotalCount(comments.length)
      } catch (error) {
        console.error('Failed to reload comments:', error)
      } finally {
        setLoading(false)
      }
    }

    reloadComments()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MessageSquare size={24} />
          评论
        </h2>
        <p className="mt-2 text-secondary/70">
          欢迎留言，请友善发言
        </p>
      </div>

      {/* Comment Form */}
      <div id="comment-form" className="mb-12 p-6 rounded-xl bg-secondary/5 border border-primary/10">
        <CommentForm postSlug={postSlug} onSuccess={handleCommentSuccess} />
      </div>

      {/* Comments List */}
      <div>
        {loading ? <CommentSkeleton /> : <CommentList onRefresh={handleCommentSuccess} />}
      </div>
    </div>
  )
}
