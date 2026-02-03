# ===============================
# Stage 1: Build (Compile Frontend)
# ===============================
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# 这一步非常关键：让 Docker 自己编译，生成 /app/dist
RUN npm run build

# ===============================
# Stage 2: Production (Nginx)
# ===============================
FROM nginx:alpine

# Copy compiled assets from Stage 1 to Nginx
# 注意：从 builder 阶段的 /app/dist 拷贝到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
