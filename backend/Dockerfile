# 使用 PocketBase 官方镜像作为基础镜像
FROM alpine:latest

# 安装必要的依赖
RUN apk add --no-cache ca-certificates

# 创建 pocketbase 用户
RUN addgroup -S -g 1000 pocketbase &&\
    adduser -S -u 1000 -G pocketbase pocketbase

# 下载 PocketBase
WORKDIR /app
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip &&\
    unzip pocketbase_0.22.0_linux_amd64.zip &&\
    rm pocketbase_0.22.0_linux_amd64.zip

# 创建数据目录
RUN mkdir -p /pb_data &&\
    chown -R pocketbase:pocketbase /pb_data /app

# 切换到 pocketbase 用户
USER pocketbase

# 暴露端口
EXPOSE 8090

# 挂载数据卷
VOLUME ["/pb_data"]

# 启动 PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]