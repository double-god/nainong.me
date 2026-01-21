import { useAtom, useAtomValue } from 'jotai'
import { musicControlsAtom, musicPlayerAtom, type MusicTrack } from '@/store/music'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// 示例音乐数据，可以替换为实际的音乐来源
const DEMO_TRACK: MusicTrack = {
  id: '1',
  title: '示例音乐',
  cover: 'https://object.lxchapu.com/bed%2F2024%2F0507_6e3e8f73df2d4e6d.webp',
  url: '', // 在这里添加音乐文件 URL
}

export function MusicPlayer() {
  const [, setPlayerState] = useAtom(musicControlsAtom)
  const { isPlaying, isExpanded, currentTrack } = useAtomValue(musicPlayerAtom)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  // 初始化音乐
  useEffect(() => {
    if (!currentTrack) {
      setPlayerState({ type: 'update', payload: { currentTrack: DEMO_TRACK } })
    }
  }, [currentTrack, setPlayerState])

  // 处理音频播放
  useEffect(() => {
    if (isPlaying && audioRef.current && currentTrack?.url) {
      audioRef.current.play().catch(console.error)
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack])

  // 更新播放进度
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const percent = (audio.currentTime / audio.duration) * 100
      setDisplayProgress(percent || 0)
    }

    const handleEnded = () => {
      setPlayerState({ type: 'update', payload: { isPlaying: false } })
      setDisplayProgress(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setPlayerState])

  const handleTogglePlay = () => {
    setPlayerState({ type: 'toggle' })
  }

  const handleMouseEnter = () => {
    setPlayerState({ type: 'update', payload: { isExpanded: true } })
  }

  const handleMouseLeave = () => {
    setPlayerState({ type: 'update', payload: { isExpanded: false } })
  }

  if (!currentTrack) return null

  return (
    <>
      <audio ref={audioRef} src={currentTrack.url} />

      <motion.div
        className="fixed left-4 bottom-6 z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            // 展开状态 - 胶囊状
            <motion.div
              key="expanded"
              className="flex items-center gap-3 px-3 py-2 rounded-full shadow-lg shadow-zinc-800/5 border border-primary bg-white/90 dark:bg-zinc-800/90 backdrop-blur"
              initial={{ width: 48, borderRadius: 24 }}
              animate={{ width: 'auto', borderRadius: 24 }}
              exit={{ width: 48, borderRadius: 24 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* 封面图 */}
              <div className="relative size-10 flex-shrink-0">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="size-full rounded-full object-cover"
                />
                {/* 播放状态指示器 */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 歌曲信息 */}
              <motion.div
                className="min-w-0 flex-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-sm font-medium text-primary truncate">
                  {currentTrack.title}
                </div>
                {currentTrack.artist && (
                  <div className="text-xs text-secondary truncate">
                    {currentTrack.artist}
                  </div>
                )}

                {/* 播放进度条 */}
                <div className="mt-1.5 h-1 bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>

              {/* 播放/暂停按钮 */}
              <motion.button
                className="flex-shrink-0 size-8 flex items-center justify-center"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? '暂停' : '播放'}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="relative">
                  {isPlaying ? (
                    // 暂停图标 (两条竖线)
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-primary rounded-sm" />
                      <div className="w-1 h-3 bg-primary rounded-sm" />
                    </div>
                  ) : (
                    // 播放图标 (三角形)
                    <div
                      className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-primary"
                      style={{ borderLeftWidth: '10px', borderTopWidth: '6px', borderBottomWidth: '6px' }}
                    />
                  )}
                </div>
              </motion.button>
            </motion.div>
          ) : (
            // 收起状态 - 圆形
            <motion.button
              key="collapsed"
              className="relative size-12 rounded-full shadow-lg shadow-zinc-800/5 border border-primary bg-white/90 dark:bg-zinc-800/90 backdrop-blur overflow-hidden"
              onClick={handleTogglePlay}
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? '暂停' : '播放'}
            >
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="size-full object-cover"
              />

              {/* 播放状态覆盖层 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                {isPlaying ? (
                  // 暂停图标
                  <motion.div
                    className="flex gap-1"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-1 h-4 bg-white rounded-sm" />
                    <div className="w-1 h-4 bg-white rounded-sm" />
                  </motion.div>
                ) : (
                  // 播放图标
                  <motion.div
                    className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-white"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    style={{ borderLeftWidth: '12px', borderTopWidth: '8px', borderBottomWidth: '8px' }}
                  />
                )}
              </div>

              {/* 播放时的动画边框 */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-accent"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
