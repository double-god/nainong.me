/**
 * Comment state management with Jotai
 */

import { atom } from 'jotai'
import type { Comment, CommentWithReplies, CommentFormData } from '@/types'

// Loading state
export const commentsLoadingAtom = atom<boolean>(false)

// Error state
export const commentsErrorAtom = atom<string | null>(null)

// Current page for pagination
export const commentsPageAtom = atom<number>(1)

// Total pages
export const commentsTotalPagesAtom = atom<number>(0)

// Total comments count
export const commentsTotalCountAtom = atom<number>(0)

// Comments data
export const commentsAtom = atom<CommentWithReplies[]>([])

// All comments (flat list)
export const commentsFlatAtom = atom<Comment[]>([])

// Reply to comment ID (null = new comment, undefined = not replying)
export const replyToAtom = atom<string | null | undefined>(undefined)

// Submitting state
export const commentSubmittingAtom = atom<boolean>(false)

// Last submit timestamp (for rate limiting)
export const lastSubmitTimeAtom = atom<number>(0)

// Derived atom: check if can submit (rate limited)
export const canSubmitCommentAtom = atom((get) => {
  const lastSubmitTime = get(lastSubmitTimeAtom)
  const now = Date.now()
  const RATE_LIMIT = 30 * 1000 // 30 seconds
  return now - lastSubmitTime > RATE_LIMIT
})

// Derived atom: get remaining time for rate limit
export const submitRemainingTimeAtom = atom((get) => {
  const lastSubmitTime = get(lastSubmitTimeAtom)
  const now = Date.now()
  const RATE_LIMIT = 30 * 1000 // 30 seconds
  const remaining = RATE_LIMIT - (now - lastSubmitTime)
  return Math.max(0, remaining)
})

// Action atom: set comments
export const setCommentsAtom = atom(
  null,
  (get, set, comments: Comment[]) => {
    // Organize comments into nested structure
    const organized = organizeCommentsNested(comments)
    set(commentsAtom, organized)
    set(commentsFlatAtom, comments)
  }
)

// Action atom: add a new comment
export const addCommentAtom = atom(
  null,
  (get, set, newComment: Comment) => {
    const currentComments = get(commentsFlatAtom)
    const updatedComments = [...currentComments, newComment]

    // Reorganize all comments
    const organized = organizeCommentsNested(updatedComments)
    set(commentsAtom, organized)
    set(commentsFlatAtom, updatedComments)
    set(commentsTotalCountAtom, updatedComments.length)
  }
)

// Action atom: set loading state
export const setCommentsLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(commentsLoadingAtom, loading)
    if (loading) {
      set(commentsErrorAtom, null)
    }
  }
)

// Action atom: set error
export const setCommentsErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    set(commentsErrorAtom, error)
    set(commentsLoadingAtom, false)
  }
)

// Action atom: reset pagination
export const resetCommentsPaginationAtom = atom(null, (get, set) => {
  set(commentsPageAtom, 1)
})

// Action atom: increment page
export const incrementCommentsPageAtom = atom(null, (get, set) => {
  const currentPage = get(commentsPageAtom)
  const totalPages = get(commentsTotalPagesAtom)
  if (currentPage < totalPages) {
    set(commentsPageAtom, currentPage + 1)
  }
})

// Helper function to organize comments into nested structure
function organizeCommentsNested(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const rootComments: CommentWithReplies[] = []

  // First pass: create map and initialize replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure (max 3 levels deep)
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!
      if (!parent.replies) {
        parent.replies = []
      }
      parent.replies.push(commentWithReplies)
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}
