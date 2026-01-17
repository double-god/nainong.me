# ==========================================
# Stage 1: 基础依赖层 (利用缓存)
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app

# 1. 先只复制依赖描述文件
# 原理：只要 package.json 没变，Docker 就会直接跳过 npm install 使用缓存
COPY package.json package-lock.json ./

# 2. 安装所有依赖 (包括开发依赖，用于 Build)
RUN npm ci

# ==========================================
# Stage 2: 构建层 (编译代码)
# ==========================================
FROM base AS build
# 复制源代码 (这一步最常变，所以放在安装依赖之后)
COPY . .
# 开始构建 (生成 dist/ 目录)
RUN npm run build

# ==========================================
# Stage 3: 最终运行时 (极致优化版)
# ==========================================
FROM node:20-alpine AS runtime
WORKDIR /app

# 【优化1】设置生产环境变量 (极重要！提升性能，减少日志)
ENV NODE_ENV=production

# 1. 复制依赖
COPY package.json package-lock.json ./

# 2. 安装生产依赖 (配合 ENV 使用，忽略 dev 依赖)
RUN npm ci --only=production && npm cache clean --force

# 3. 复制构建产物
COPY --from=build /app/dist ./dist

# 环境变量
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]