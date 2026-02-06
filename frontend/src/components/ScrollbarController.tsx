import { useEffect } from 'react'

/**
 * 滚动条控制器
 * 检测页面滚动状态，并在滚动时给 html 元素添加 is-scrolling 类
 * 用于实现自定义滚动条样式的动态显示/隐藏效果
 */
export function ScrollbarController() {
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      const html = document.documentElement

      // 添加滚动状态类
      html.classList.add('is-scrolling')

      // 清除之前的定时器
      clearTimeout(scrollTimeout)

      // 1.5秒后移除滚动状态类
      scrollTimeout = setTimeout(() => {
        html.classList.remove('is-scrolling')
      }, 1500)
    }

    // 监听窗口滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true })

    // 初始化：页面加载后 2 秒移除 is-scrolling 类（如果存在）
    const initTimeout = setTimeout(() => {
      document.documentElement.classList.remove('is-scrolling')
    }, 2000)

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
      clearTimeout(initTimeout)
    }
  }, [])

  return null
}
