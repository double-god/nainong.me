/**
 * Comment Skeleton Component
 * Displays loading placeholder while comments are being fetched
 */

import { motion } from 'framer-motion'

export function CommentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton comments */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4"
        >
          {/* Avatar skeleton */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 animate-pulse" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
              <div className="h-3 w-16 bg-secondary/30 rounded animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-secondary/30 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-secondary/30 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-secondary/30 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
