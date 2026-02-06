/**
 * 从图片 URL 提取主色调
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建 canvas context'))
          return
        }

        // 缩小尺寸以提高性能
        canvas.width = 50
        canvas.height = 50
        ctx.drawImage(img, 0, 0, 50, 50)

        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, 50, 50)
        const pixels = imageData.data

        // 采样像素（每隔10个像素采样一次）
        const colorCounts: Map<string, number> = new Map()
        for (let i = 0; i < pixels.length; i += 40) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]

          // 跳过透明像素
          if (a < 128) continue

          // 量化颜色（减少颜色数量）
          const roundedR = Math.round(r / 32) * 32
          const roundedG = Math.round(g / 32) * 32
          const roundedB = Math.round(b / 32) * 32

          const colorKey = `${roundedR},${roundedG},${roundedB}`
          colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1)
        }

        // 找到出现次数最多的颜色
        let maxCount = 0
        let dominantColor = '128,128,128'

        colorCounts.forEach((count, color) => {
          if (count > maxCount) {
            maxCount = count
            dominantColor = color
          }
        })

        resolve(`rgb(${dominantColor})`)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
  })
}

/**
 * 将颜色变浅处理
 * @param color - RGB 颜色字符串，如 "rgb(128, 128, 128)"
 * @param lightness - 变浅程度 (0-1)，默认 0.3 表示变浅 30%
 */
export function lightenColor(color: string, lightness: number = 0.3): string {
  // 解析 RGB 值
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) {
    return color // 如果不是 RGB 格式，返回原颜色
  }

  const [, r, g, b] = match.map(Number)

  // 转换为 HSL
  const [h, s, l] = rgbToHsl(r, g, b)

  // 增加亮度
  const newL = Math.min(100, l + lightness * 100)

  // 转换回 RGB
  const [newR, newG, newB] = hslToRgb(h, s, newL)

  return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`
}

/**
 * RGB 转 HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s, l * 100]
}

/**
 * HSL 转 RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  s /= 100
  l /= 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [r * 255, g * 255, b * 255]
}
