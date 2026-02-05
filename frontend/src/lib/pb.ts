// src/lib/pb.ts
import PocketBase from 'pocketbase'

// 开发环境使用本地 PocketBase，生产环境使用服务器
const PB_URL = import.meta.env.DEV ? 'http://localhost:8090' : 'https://nainong.me'

export const pb = new PocketBase(PB_URL)

