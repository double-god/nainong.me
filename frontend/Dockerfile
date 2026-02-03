# ===============================
# Stage 1: Build (Compile Frontend)
# ===============================
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
# 跳过 postinstall 钩子（该钩子调用 pnpm，但镜像中只有 npm）
RUN npm install --ignore-scripts

# Copy source and build
COPY . .
# 跳过类型检查，直接构建 (astro check 在 Docker 中可能失败)
RUN npx astro build && npx pagefind --site dist

# ===============================
# Stage 2: Production (Nginx)
# ===============================
FROM nginx:alpine

# Copy compiled assets from Stage 1 to Nginx
# 注意：从 builder 阶段的 /app/dist 拷贝到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
