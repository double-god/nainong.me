import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MusicEdgeLightingProps {
  isActive: boolean
  duration?: number
}

export function MusicEdgeLighting({ isActive, duration = 6000 }: MusicEdgeLightingProps) {
  const [visible, setVisible] = useState(isActive)

  useEffect(() => {
    setVisible(isActive)
    if (isActive && duration > 0) {
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    }
  }, [isActive, duration])

  // 使用 Turquoise 颜色 #40E0D0
  const cyanColor = '#40E0D0'
  const glowShadow = `0 0 25px ${cyanColor}, 0 0 10px rgba(64, 224, 208, 0.5)`

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {/* --- 1. 顶边 --- */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute top-0 left-0 w-full h-[5px]"
            style={{
              backgroundColor: cyanColor,
              boxShadow: glowShadow,
              originX: 0.5,
            }}
          />

          {/* --- 2. 底边 --- */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute bottom-0 left-0 w-full h-[5px]"
            style={{
              backgroundColor: cyanColor,
              boxShadow: glowShadow,
              originX: 0.5,
            }}
          />

          {/* --- 3. 左边 --- */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute top-0 left-0 h-full w-[5px]"
            style={{
              backgroundColor: cyanColor,
              boxShadow: glowShadow,
              originY: 0.5,
            }}
          />

          {/* --- 4. 右边 --- */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute top-0 right-0 h-full w-[5px]"
            style={{
              backgroundColor: cyanColor,
              boxShadow: glowShadow,
              originY: 0.5,
            }}
          />

          {/* --- 5. 氛围背景 (淡淡的青色呼吸) --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.03, 0.07, 0.03] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: cyanColor }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
