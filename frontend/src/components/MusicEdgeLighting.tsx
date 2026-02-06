import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MusicEdgeLightingProps {
  isActive: boolean
  duration?: number
}

export function MusicEdgeLighting({ isActive, duration = 5000 }: MusicEdgeLightingProps) {
  const [visible, setVisible] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isActive, duration])

  // 青绿色系渐变色
  const cyanColors = [
    'rgba(34, 211, 238, 0.9)',   // cyan-400
    'rgba(45, 212, 191, 0.8)',   // teal-400
    'rgba(20, 184, 166, 0.7)',   // teal-500
    'rgba(6, 182, 212, 0.6)',    // cyan-500
    'rgba(8, 145, 178, 0.5)',    // cyan-600
    'rgba(13, 148, 136, 0.4)',   // teal-600
  ]

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* ========== 多层波浪边框 ========== */}

          {/* 第一层 - 主边框 */}
          {cyanColors.slice(0, 3).map((color, i) => (
            <motion.div
              key={`border-${i}`}
              className="absolute inset-0 border-2"
              style={{
                borderColor: color,
                boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`,
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: [0.98, 1.02, 0.98],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 1, -1, 0],
              }}
              exit={{
                scale: 1.05,
                opacity: 0,
                transition: { duration: 1.5 }
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: i * 0.15,
              }}
            />
          ))}

          {/* 第二层 - 波浪律动线 */}
          {[0, 1, 2, 3].map((side) => (
            <div key={`wave-${side}`} className="absolute inset-0">
              {Array.from({ length: 5 }).map((_, i) => {
                const isTop = side === 0
                const isRight = side === 1
                const isBottom = side === 2
                const isLeft = side === 3

                return (
                  <motion.div
                    key={`${side}-${i}`}
                    className="absolute"
                    style={{
                      backgroundColor: cyanColors[i % cyanColors.length],
                      boxShadow: `0 0 15px ${cyanColors[i % cyanColors.length]}`,
                      ...(isTop && {
                        top: 0,
                        left: `${i * 20}%`,
                        width: '15%',
                        height: '3px',
                        originX: 0.5,
                      }),
                      ...(isRight && {
                        right: 0,
                        top: `${i * 20}%`,
                        height: '15%',
                        width: '3px',
                        originY: 0.5,
                      }),
                      ...(isBottom && {
                        bottom: 0,
                        left: `${i * 20}%`,
                        width: '15%',
                        height: '3px',
                        originX: 0.5,
                      }),
                      ...(isLeft && {
                        left: 0,
                        top: `${i * 20}%`,
                        height: '15%',
                        width: '3px',
                        originY: 0.5,
                      }),
                    }}
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: [0.8, 1.5, 0.8],
                      opacity: [0.2, 0.9, 0.2],
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                      transition: { duration: 1 }
                    }}
                    transition={{
                      duration: 1.5 + i * 0.2,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'easeInOut',
                      delay: i * 0.2 + side * 0.1,
                    }}
                  />
                )
              })}
            </div>
          ))}

          {/* 第三层 - 角落光晕 */}
          {[
            { position: 'top-0 left-0', rotate: 0 },
            { position: 'top-0 right-0', rotate: 90 },
            { position: 'bottom-0 right-0', rotate: 180 },
            { position: 'bottom-0 left-0', rotate: 270 },
          ].map((corner, i) => (
            <motion.div
              key={`corner-${i}`}
              className={`absolute ${corner.position} w-32 h-32`}
              style={{
                background: `radial-gradient(circle at corner, ${cyanColors[i % cyanColors.length]}, transparent 70%)`,
                transformOrigin: corner.position.includes('top')
                  ? corner.position.includes('left')
                    ? 'top left'
                    : 'top right'
                  : corner.position.includes('left')
                    ? 'bottom left'
                    : 'bottom right',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.2, 0.6, 0.2],
                rotate: [0, 15, -15, 0],
              }}
              exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: 1.2 }
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}

          {/* 第四层 - 呼吸背景 */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${cyanColors[0]}10, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.1, 1],
            }}
            exit={{
              opacity: 0,
              transition: { duration: 1.5 }
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />

          {/* 第五层 - 律动光点 */}
          {Array.from({ length: 16 }).map((_, i) => {
            // 随机分布在边缘附近
            const angle = (i / 16) * 360
            const baseRadius = 42  // 基础半径（距离中心）
            const radiusVariation = 8 + Math.random() * 6  // 半径变化量
            const radius = baseRadius + radiusVariation

            // 添加轻微的角度偏移，让分布更自然
            const angleOffset = (Math.random() - 0.5) * 20  // -10到+10度的偏移
            const finalAngle = angle + angleOffset

            return (
              <motion.div
                key={`dot-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px',
                  backgroundColor: cyanColors[i % cyanColors.length],
                  boxShadow: `0 0 15px ${cyanColors[i % cyanColors.length]}, 0 0 30px ${cyanColors[i % cyanColors.length]}`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  // 在边缘附近小范围摆动
                  x: [Math.cos((finalAngle * Math.PI) / 180) * radius,
                      Math.cos(((finalAngle + 15) * Math.PI) / 180) * (radius + 3),
                      Math.cos(((finalAngle - 10) * Math.PI) / 180) * (radius - 2)],
                  y: [Math.sin((finalAngle * Math.PI) / 180) * radius,
                      Math.sin(((finalAngle + 15) * Math.PI) / 180) * (radius + 3),
                      Math.sin(((finalAngle - 10) * Math.PI) / 180) * (radius - 2)],
                  // 平滑的大小变化
                  scale: [0.5, 1.1, 0.5],
                  // 平滑的透明度变化
                  opacity: [0.3, 0.8, 0.3],
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 1, ease: 'easeOut' }
                }}
                transition={{
                  duration: 3.5 + Math.random() * 1.5, // 随机化动画时长
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: [0.4, 0, 0.2, 1],
                  delay: i * 0.15,
                }}
              />
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
