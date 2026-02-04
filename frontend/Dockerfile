# ===============================
# Stage 1: Build
# ===============================
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 启用 pnpm
RUN corepack enable

# 2. 配置国内镜像源（解决国内网络问题）
RUN npm config set registry https://registry.npmmirror.com

# 3. 复制依赖文件和配置
COPY package.json pnpm-lock.yaml .npmrc ./

# 4. 删除 prepare 脚本（避免 git hooks 报错）
RUN npm pkg delete scripts.prepare

# 5. 安装依赖（.npmrc 中已配置重试和超时）
RUN pnpm install --frozen-lockfile \
    --network-timeout 180000 \
    --fetch-retries 5 \
    --fetch-retry-mintimeout 10000 \
    --fetch-retry-maxtimeout 60000

# 6. 复制源码并构建
COPY . .
# 跳过 astro check，直接构建
RUN pnpm astro build && pnpm pagefind --site dist

# ===============================
# Stage 2: Production
# ===============================
FROM nginx:alpine

# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 去除 Windows 换行符 (CRLF -> LF)
RUN sed -i 's/\r$//' /etc/nginx/conf.d/default.conf

# 修复权限
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
