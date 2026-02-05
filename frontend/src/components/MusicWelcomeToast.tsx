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
          className="fixed left-4 bottom-32 z-50"
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
            {/* babyblue 圆形提示框 */}
            <motion.div
              className="w-72 h-72 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #BFEFFF 0%, #87CEEB 100%)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(191, 239, 255, 0.4)',
                  '0 0 40px rgba(191, 239, 255, 0.6)',
                  '0 0 20px rgba(191, 239, 255, 0.4)',
                ],
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
                <p className="text-base font-medium text-sky-900 leading-relaxed">
                  这是我花两元的买的歌，请你听歌呀੭ ˙ᗜ˙ ੭
                </p>
              </div>
            </motion.div>

            {/* 装饰性小元素 */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sky-300"
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
              className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-sky-400"
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
