import { useAtom, useAtomValue } from 'jotai'
import { musicControlsAtom, musicPlayerAtom } from '@/store/music'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getMusicList } from '@/utils/content'
import { MusicWelcomeToast } from './MusicWelcomeToast'
import { MusicEdgeLighting } from './MusicEdgeLighting'

export function MusicPlayer() {
  const [, setPlayerState] = useAtom(musicControlsAtom)
  const { isPlaying, isExpanded, currentTrack } = useAtomValue(musicPlayerAtom)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  // 初始化音乐
  useEffect(() => {
    const initMusic = async () => {
      if (!currentTrack) {
        const musicList = await getMusicList()

        if (musicList.length > 0) {
          setPlayerState({ type: 'update', payload: { currentTrack: musicList[0] } })
        }
      }
    }

    initMusic()
  }, [currentTrack, setPlayerState])

  // 处理音频播放
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && currentTrack?.url) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack?.url])

  // 更新播放进度和单曲循环
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const percent = (audio.currentTime / audio.duration) * 100
      setDisplayProgress(percent || 0)
    }

    const handleEnded = () => {
      // 单曲循环：重新播放
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      }
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
      <audio ref={audioRef} src={currentTrack.url} loop />

      {/* 欢迎提示框（首次加载显示） */}
      <MusicWelcomeToast />

      {/* Edge Lighting 效果 */}
      <MusicEdgeLighting isActive={isPlaying} />

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
              className="flex items-center gap-3 px-3 py-2 rounded-full shadow-2xl shadow-cyan-500/20 border border-primary bg-white/90 dark:bg-zinc-800/90 backdrop-blur"
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
                  className="size-full rounded-full object-cover shadow-lg"
                />
                {/* 波浪播放指示器 */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-end gap-[2px] h-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] bg-gradient-to-t from-cyan-400 to-teal-400 rounded-full"
                          style={{ height: '8px' }}
                          animate={{
                            height: ['8px', '16px', '8px'],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                            delay: i * 0.1,
                          }}
                        />
                      ))}
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
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
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
              className="relative size-12 rounded-full shadow-2xl shadow-cyan-500/20 border-2 border-primary bg-white/90 dark:bg-zinc-800/90 backdrop-blur overflow-hidden"
              onClick={handleTogglePlay}
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
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
                  // 波浪图标
                  <div className="flex items-end gap-[3px] h-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[4px] bg-gradient-to-t from-cyan-400 to-teal-400 rounded-full shadow-lg"
                        style={{ height: '10px' }}
                        animate={{
                          height: ['10px', '22px', '10px'],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: 'loop',
                          ease: 'easeInOut',
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
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

              {/* 播放时的动画边框 - 蓝绿色 */}
              {isPlaying && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: 'rgba(34, 211, 238, 0.6)',
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.2)',
                    }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: 'rgba(45, 212, 191, 0.6)',
                      boxShadow: '0 0 15px rgba(45, 212, 191, 0.4)',
                    }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
