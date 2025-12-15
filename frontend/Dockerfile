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
# Stage 3: 最终运行时 (极简镜像)
# ==========================================
FROM node:20-alpine AS runtime
WORKDIR /app

# 1. 也是先复制依赖文件
COPY package.json package-lock.json ./

# 2. 【关键】只安装生产环境依赖 (去除 devDependencies)
# 这会把体积减少 50% 以上
RUN npm ci --only=production && npm cache clean --force

# 3. 从 Build 层只复制构建产物
COPY --from=build /app/dist ./dist

# 环境变量：监听所有 IP，否则 Docker 外部访问不到
ENV HOST=0.0.0.0
ENV PORT=4321

# 启动命令
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]