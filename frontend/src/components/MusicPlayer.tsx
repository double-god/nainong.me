import { useAtom, useAtomValue } from 'jotai'
import { musicControlsAtom, musicPlayerAtom, type MusicTrack } from '@/store/music'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getMusicList } from '@/utils/content'
import { MusicWelcomeToast } from './MusicWelcomeToast'
import { MusicEdgeLighting } from './MusicEdgeLighting'

export function MusicPlayer() {
  const [playStartTime, setPlayStartTime] = useState<number | undefined>()
  const [, setPlayerState] = useAtom(musicControlsAtom)
  const { isPlaying, isExpanded, currentTrack } = useAtomValue(musicPlayerAtom)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  // 调试信息
  console.log('MusicPlayer render:', { isPlaying, isExpanded, currentTrack, playStartTime })

  // 初始化音乐
  useEffect(() => {
    const initMusic = async () => {
      if (!currentTrack) {
        // 尝试从 PocketBase 获取音乐列表
        const musicList = await getMusicList()

        if (musicList.length > 0) {
          // 使用第一首音乐作为默认曲目
          setPlayerState({ type: 'update', payload: { currentTrack: musicList[0] } })
        }
      }
    }

    initMusic()
  }, [currentTrack, setPlayerState])

  // 处理音频播放和播放时间追踪
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log('MusicPlayer: 播放状态变化', { isPlaying, currentTrack: currentTrack?.title, playStartTime })

    if (isPlaying && currentTrack?.url) {
      // 使用函数式更新避免闭包陷阱
      setPlayStartTime(prev => {
        if (!prev) {
          const startTime = Date.now()
          console.log('MusicPlayer: 设置 playStartTime =', startTime)
          return startTime
        }
        return prev
      })
      audio.play().catch(console.error)
    } else {
      console.log('MusicPlayer: 暂停播放')
      audio.pause()
      if (!isPlaying) {
        setPlayStartTime(undefined)
      }
    }
  }, [isPlaying, currentTrack?.url])

  // 更新播放进度
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const percent = (audio.currentTime / audio.duration) * 100
      setDisplayProgress(percent || 0)
    }

    const handleEnded = () => {
      // 单曲循环：重新播放
      console.log('🔄 Audio ended 事件触发！开始单曲循环...')
      if (audioRef.current) {
        console.log('🔄 重置 currentTime = 0')
        audioRef.current.currentTime = 0
        console.log('🔄 调用 audio.play()')
        audioRef.current.play().catch(console.error)
        const newStartTime = Date.now()
        console.log('🔄 重置 playStartTime =', newStartTime)
        setPlayStartTime(newStartTime)
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

  // 调试：确认 audio 元素已挂载
  useEffect(() => {
    if (audioRef.current) {
      console.log('MusicPlayer: audio 元素已挂载', {
        src: audioRef.current.src,
        loop: audioRef.current.loop,
        readyState: audioRef.current.readyState
      })
    } else {
      console.log('MusicPlayer: audio 元素未挂载')
    }
  }, [currentTrack])

  return (
    <>
      <audio ref={audioRef} src={currentTrack.url} loop />

      {/* 🔴 调试层：无条件渲染，确认组件是否在运行 */}
      <div className="fixed top-20 right-4 z-[100] bg-yellow-400 text-black p-4 rounded shadow-2xl text-sm font-mono">
        <div className="font-bold mb-2">🎵 MUSIC PLAYER DEBUG</div>
        <div>isPlaying: {String(isPlaying)}</div>
        <div>isExpanded: {String(isExpanded)}</div>
        <div>playStartTime: {playStartTime ? new Date(playStartTime).toISOString() : 'undefined'}</div>
        <div>currentTrack: {currentTrack?.title || 'undefined'}</div>
        <div>displayProgress: {displayProgress.toFixed(1)}%</div>
      </div>

      {/* 欢迎提示框（首次加载显示） */}
      <MusicWelcomeToast />

      {/* 边缘辐射动画 */}
      <MusicEdgeLighting isPlaying={isPlaying} playStartTime={playStartTime} />

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

              {/* 播放时的动画边框 - 蓝绿色 */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 bg-gradient-to-r from-teal-400 to-cyan-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    background: 'transparent',
                    borderColor: 'rgba(45, 212, 191, 0.6)',
                  }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
