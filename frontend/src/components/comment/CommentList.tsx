/**
 * Comment List Component
 * Displays all comments for a post
 */

import { useAtom, useAtomValue } from 'jotai'
import { MessageSquare } from 'lucide-react'
import { CommentItem } from './CommentItem'
import {
  commentsAtom,
  commentsLoadingAtom,
  commentsErrorAtom,
  commentsTotalCountAtom,
  replyToAtom,
} from '@/store/comments'

interface CommentListProps {
  onRefresh?: () => void
}

export function CommentList({ onRefresh }: CommentListProps) {
  const [comments] = useAtom(commentsAtom)
  const [loading] = useAtom(commentsLoadingAtom)
  const [error] = useAtom(commentsErrorAtom)
  const totalCount = useAtomValue(commentsTotalCountAtom)
  const [, setReplyTo] = useAtom(replyToAtom)

  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    // Scroll to form
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-center text-secondary/50">加载评论中…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">评论加载失败</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-accent hover:underline"
        >
          重试
        </button>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageSquare size={48} className="mx-auto mb-4 text-secondary/30" />
        <p className="text-secondary/50 mb-2">还没有评论</p>
        <p className="text-secondary/30 text-sm">来发表第一条评论吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment count */}
      <div className="flex items-center gap-2 text-primary font-semibold">
        <MessageSquare size={20} />
        <span>
          {totalCount} {totalCount === 1 ? '条评论' : '条评论'}
        </span>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  )
}
