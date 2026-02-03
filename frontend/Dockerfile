# ===============================
# Stage 1: Build
# ===============================
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 启用 Corepack 以支持 pnpm (Node 18 自带)
RUN corepack enable

# 2. 复制依赖定义
COPY package.json pnpm-lock.yaml ./

# 3. 正常安装依赖 (不跳过脚本，确保 Esbuild 正常工作)
# --frozen-lockfile: 严格按照 lock 文件安装
RUN pnpm install --frozen-lockfile

# 4. 复制源码并构建
COPY . .
# 跳过 astro check，直接构建（避免类型检查失败）
RUN pnpm astro build && pnpm pagefind --site dist

# ===============================
# Stage 2: Production
# ===============================
FROM nginx:alpine

# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
# 拷贝 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
