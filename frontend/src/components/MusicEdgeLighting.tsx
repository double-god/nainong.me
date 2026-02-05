import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface MusicEdgeLightingProps {
  isPlaying: boolean
  playStartTime?: number
}

export function MusicEdgeLighting({ isPlaying, playStartTime }: MusicEdgeLightingProps) {
  // 调试信息
  console.log('MusicEdgeLighting render:', { isPlaying, playStartTime })

  // 生成辐射线条数据
  const radiatingLines = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      // 随机选择一边：0=顶, 1=右, 2=底, 3=左
      side: Math.floor(Math.random() * 4),
      // 随机位置（百分比）
      position: Math.random() * 100,
      // 随机长度（向外辐射的长度）
      length: Math.random() * 60 + 30,
      // 随机粗细
      thickness: Math.random() > 0.6 ? 2 : 1,
      // 随机动画延迟
      delay: Math.random() * 2,
      // 随机动画时长
      duration: Math.random() * 1 + 0.8,
    }))
  }, [])

  // 计算透明度
  const opacity = useMemo(() => {
    if (!isPlaying) return 0

    // 如果正在播放但没有时间戳，显示动画（用于测试）
    if (!playStartTime) return 1

    const elapsed = Date.now() - playStartTime
    if (elapsed < 800) {
      // 前0.8秒淡入
      return elapsed / 800
    } else if (elapsed > 6000) {
      // 6秒后淡出
      return Math.max(0, 1 - (elapsed - 6000) / 1500)
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
          exit={{ opacity: 0, transition: { duration: 1.5 } }}
        >
          {/* ========== 四边主边框流光（三星侧屏闪光风格）========== */}

          {/* 顶边：从中心向两端展开 */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-50"
            style={{
              originX: 0.5,
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          {/* 右边：从中心向两端展开 */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent z-50"
            style={{
              originY: 0.5,
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          />

          {/* 底边：从中心向两端展开 */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-50"
            style={{
              originX: 0.5,
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)',
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          />

          {/* 左边：从中心向两端展开 */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent z-50"
            style={{
              originY: 0.5,
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          />

          {/* ========== 辐射律动线条 ========== */}

          {/* 顶部辐射线条（向上） */}
          {radiatingLines.filter(l => l.side === 0).map((line) => (
            <motion.div
              key={`top-${line.id}`}
              className="absolute top-0 bg-gradient-to-t from-cyan-400/80 to-transparent z-40"
              style={{
                left: `${line.position}%`,
                width: `${line.thickness}px`,
                height: `${line.length}px`,
                transformOrigin: 'bottom center',
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
              }}
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 右侧辐射线条（向右） */}
          {radiatingLines.filter(l => l.side === 1).map((line) => (
            <motion.div
              key={`right-${line.id}`}
              className="absolute right-0 bg-gradient-to-r from-cyan-400/80 to-transparent z-40"
              style={{
                top: `${line.position}%`,
                width: `${line.length}px`,
                height: `${line.thickness}px`,
                transformOrigin: 'left center',
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
              }}
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 底部辐射线条（向下） */}
          {radiatingLines.filter(l => l.side === 2).map((line) => (
            <motion.div
              key={`bottom-${line.id}`}
              className="absolute bottom-0 bg-gradient-to-b from-cyan-400/80 to-transparent z-40"
              style={{
                left: `${line.position}%`,
                width: `${line.thickness}px`,
                height: `${line.length}px`,
                transformOrigin: 'top center',
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
              }}
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* 左侧辐射线条（向左） */}
          {radiatingLines.filter(l => l.side === 3).map((line) => (
            <motion.div
              key={`left-${line.id}`}
              className="absolute left-0 bg-gradient-to-l from-cyan-400/80 to-transparent z-40"
              style={{
                top: `${line.position}%`,
                width: `${line.length}px`,
                height: `${line.thickness}px`,
                transformOrigin: 'right center',
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
              }}
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: line.duration,
                repeat: Infinity,
                delay: line.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* ========== 角落高亮光晕 ========== */}

          <motion.div
            className="absolute top-0 left-0 w-20 h-20 rounded-br-full bg-gradient-to-br from-cyan-400/30 to-transparent z-30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-gradient-to-bl from-cyan-400/30 to-transparent z-30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            style={{
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-20 h-20 rounded-tr-full bg-gradient-to-tl from-cyan-400/30 to-transparent z-30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            style={{
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-full bg-gradient-to-tr from-cyan-400/30 to-transparent z-30"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
            style={{
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
