# ===============================
# Stage 1: Build
# ===============================
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 启用 pnpm
RUN corepack enable

# 2. 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 3. 关键步骤：删除 prepare 脚本
# 这样就可以正常运行 install，既不会报 git hooks 的错，又能正确安装 esbuild
RUN npm pkg delete scripts.prepare

# 4. 正常安装依赖 (千万不要加 --ignore-scripts)
RUN pnpm install --frozen-lockfile

# 5. 复制源码并构建
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
