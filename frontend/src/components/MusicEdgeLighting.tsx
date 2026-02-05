import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface MusicEdgeLightingProps {
  isPlaying: boolean
  playStartTime?: number
}

export function MusicEdgeLighting({ isPlaying, playStartTime }: MusicEdgeLightingProps) {
  // 生成随机线条数据
  const lines = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      // 顶部/底部线条
      top: i < 3,
      bottom: i >= 3 && i < 6,
      // 左侧/右侧线条
      left: i >= 6 && i < 9,
      right: i >= 9,
      // 随机位置（百分比）
      position: Math.random() * 80 + 10,
      // 随机长度（px）
      length: Math.random() * 80 + 40,
      // 随机粗细
      thickness: Math.random() > 0.7 ? 3 : 1.5,
      // 随机动画延迟
      delay: Math.random() * 2,
      // 随机动画时长
      duration: Math.random() * 1.5 + 1,
    }))
  }, [])

  // 计算播放时长，超过6秒后淡化
  const opacity = useMemo(() => {
    if (!isPlaying || !playStartTime) return 0
    const elapsed = Date.now() - playStartTime
    if (elapsed < 1000) {
      // 前1秒淡入
      return elapsed / 1000
    } else if (elapsed > 6000) {
      // 6秒后淡出
      return Math.max(0, 1 - (elapsed - 6000) / 2000)
    }
    return 1
  }, [isPlaying, playStartTime])

  return (
    <AnimatePresence>
      {isPlaying && opacity > 0 && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 顶部线条 */}
          {lines.filter(l => l.top).map((line) => (
            <motion.div
              key={`top-${line.id}`}
              className="absolute top-0 bg-gradient-to-b from-teal-400/60 to-cyan-400/20"
              style={{
                left: `${line.position}%`,
                width: `${line.length}px`,
                height: `${line.thickness}px`,
              }}
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 底部线条 */}
          {lines.filter(l => l.bottom).map((line) => (
            <motion.div
              key={`bottom-${line.id}`}
              className="absolute bottom-0 bg-gradient-to-t from-teal-400/60 to-cyan-400/20"
              style={{
                left: `${line.position}%`,
                width: `${line.length}px`,
                height: `${line.thickness}px`,
              }}
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 左侧线条 */}
          {lines.filter(l => l.left).map((line) => (
            <motion.div
              key={`left-${line.id}`}
              className="absolute left-0 bg-gradient-to-r from-teal-400/60 to-cyan-400/20"
              style={{
                top: `${line.position}%`,
                width: `${line.thickness}px`,
                height: `${line.length}px`,
              }}
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 右侧线条 */}
          {lines.filter(l => l.right).map((line) => (
            <motion.div
              key={`right-${line.id}`}
              className="absolute right-0 bg-gradient-to-l from-teal-400/60 to-cyan-400/20"
              style={{
                top: `${line.position}%`,
                width: `${line.thickness}px`,
                height: `${line.length}px`,
              }}
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 角落呼吸光点 */}
          <motion.div
            className="absolute top-0 left-0 w-16 h-16 bg-teal-400/10 rounded-br-full"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/10 rounded-bl-full"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-16 h-16 bg-cyan-400/10 rounded-tr-full"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 bg-teal-400/10 rounded-tl-full"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
