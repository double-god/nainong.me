/**
 * Comment Item Component
 * Displays a single comment with its replies
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageSquare } from 'lucide-react'
import { marked } from 'marked'
import type { CommentWithReplies } from '@/types'
import { getAvatarUrl } from '@/utils/comments'

interface CommentItemProps {
  comment: CommentWithReplies
  depth?: number
  onReply?: (commentId: string) => void
}

const MAX_DEPTH = 3

export function CommentItem({ comment, depth = 0, onReply }: CommentItemProps) {
  const [renderedContent, setRenderedContent] = useState('')

  useEffect(() => {
    // Render markdown to HTML
    const renderMarkdown = async () => {
      try {
        const html = await marked.parse(comment.content || '')
        setRenderedContent(html)
      } catch (error) {
        console.error('Failed to render markdown:', error)
        setRenderedContent(comment.content || '')
      }
    }
    renderMarkdown()
  }, [comment.content])

  const timeAgo = formatDistanceToNow(new Date(comment.created), {
    addSuffix: true,
    locale: zhCN,
  })

  const avatarUrl = getAvatarUrl(comment.email, comment.nickname)
  const hasReplies = comment.replies && comment.replies.length > 0
  const canReply = depth < MAX_DEPTH

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${depth > 0 ? 'ml-8 md:ml-12 pl-4 border-l-2 border-primary/20' : ''}`}
    >
      {/* Main comment */}
      <div className="flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={comment.nickname}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-primary text-sm md:text-base">
              {comment.nickname}
            </span>

            {comment.pinned && (
              <span className="px-2 py-0.5 text-xs bg-secondary text-accent rounded-full">
                置顶
              </span>
            )}

            <span className="text-secondary text-xs md:text-sm">·</span>

            <time className="text-secondary text-xs md:text-sm" dateTime={comment.created}>
              {timeAgo}
            </time>

            {comment.website && (
              <>
                <span className="text-secondary text-xs md:text-sm">·</span>
                <a
                  href={comment.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent text-xs md:text-sm hover:underline"
                >
                  网站主页
                </a>
              </>
            )}

            {canReply && onReply && (
              <>
                <span className="text-secondary text-xs md:text-sm">·</span>
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-accent text-xs md:text-sm hover:underline transition-colors"
                >
                  <MessageSquare size={14} />
                  回复
                </button>
              </>
            )}
          </div>

          {/* Comment content (render as HTML) */}
          <div
            className="mt-2 text-primary text-sm md:text-base prose prose-sm dark:prose-invert max-w-none comment-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="space-y-4">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
