// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // 【关键修复】添加 output: 'server'，开启服务端渲染 (SSR)
  // 这样构建时不会在浏览器端或构建阶段尝试直接访问后端
  output: 'server',

  adapter: node({
    mode: 'standalone'
  })
});