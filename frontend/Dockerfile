# ==========================================
# Stage 1: 依赖安装层 (利用 Docker 缓存)
# ==========================================
FROM node:20-alpine AS deps

# 安装 pnpm (使用官方安装脚本)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 优先复制依赖定义文件 (利用 Docker 缓存层)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 使用 --frozen-lockfile 确保依赖一致性
# --prefer-offline 减少网络请求
RUN pnpm install --frozen-lockfile --prefer-offline

# ==========================================
# Stage 2: 构建层 (生成静态文件)
# ==========================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建优化参数 (适配 2GB 内存)
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV Astro__build__ConcurrentTasks=1

# 构建静态站点
# pnpm build 会执行: astro check && astro build && pagefind --site dist
RUN pnpm build

# ==========================================
# Stage 3: 生产运行时 (使用 nginx 提供静态文件)
# ==========================================
FROM nginx:alpine AS runtime

# 安装 tzdata 以支持时区设置
RUN apk add --no-cache tzdata

# 设置时区 (可按需修改)
ENV TZ=Asia/Shanghai

# 从 builder 阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置 (可选)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 使用 nginx daemon off 模式运行
CMD ["nginx", "-g", "daemon off;"]
