# ==========================================
# Stage 1: 下载器 (负责下载 Linux 版 PB)
# ==========================================
FROM alpine:latest AS downloader

# 安装 curl 和 unzip
RUN apk add --no-cache curl unzip

# 定义版本 (以后要升级改这里就行)
ARG PB_VERSION=0.22.9

# 下载并解压 (自动适配 Linux AMD64)
RUN curl -L -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pb.zip -d /pb/

# ==========================================
# Stage 2: 最终运行时
# ==========================================
FROM alpine:latest

# 安装 CA 证书 (否则无法连接 Cloudflare R2 / HTTPS)
RUN apk add --no-cache ca-certificates

WORKDIR /app

# 从下载层复制二进制文件
COPY --from=downloader /pb/pocketbase /app/pocketbase

# 给执行权限
RUN chmod +x /app/pocketbase

# 暴露端口
EXPOSE 8090

# 启动命令 (绑定到 0.0.0.0)
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]