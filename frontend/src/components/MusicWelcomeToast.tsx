import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'music-welcome-shown'

export function MusicWelcomeToast() {
  const [show, setShow] = useState(() => {
    // 检查是否已经显示过
    const hasShown = localStorage.getItem(STORAGE_KEY)
    return !hasShown
  })

  useEffect(() => {
    if (!show) return

    // 标记为已显示
    localStorage.setItem(STORAGE_KEY, 'true')

    // 6秒后自动消失
    const timer = setTimeout(() => {
      setShow(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed left-12 bottom-32 z-50"
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{
            scale: 0,
            opacity: 0,
            rotate: 180,
            transition: { duration: 0.5, ease: 'easeIn' }
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
        >
          <div className="relative">
            {/* 蓝色半透明果冻质感提示框 */}
            <motion.div
              className="w-72 h-72 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.75) 0%, rgba(37, 99, 235, 0.65) 100%)',
                border: '2px solid rgba(147, 197, 253, 0.5)',
              }}
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  '0 12px 48px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                ],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="text-center px-8">
                <motion.div
                  className="text-4xl mb-3"
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8,
                    repeat: 2,
                    repeatDelay: 0.5
                  }}
                >
                  🎵
                </motion.div>
                <p className="text-base font-medium text-white leading-relaxed drop-shadow-lg">
                  这是我花两元买的歌，请你听歌呀੭ ˙ᗜ˙ ੭
                </p>
              </div>
            </motion.div>

            {/* 装饰性小元素 */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-300/80"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-blue-400/80"
              animate={{
                scale: [1, 1.3, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.7
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
