# 自动化部署配置指南

## 概述

本项目使用 GitHub Actions 自动化部署流程，当推送到 `main` 分支时自动：
1. 构建 Docker 镜像并推送到 Docker Hub
2. 通过 SSH 连接到服务器
3. 拉取最新镜像并重启容器

## 配置步骤

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets（Settings → Secrets and variables → Actions）：

#### Docker Hub 认证
| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `DOCKER_USERNAME` | Docker Hub 用户名 | `your-username` |
| `DOCKER_PASSWORD` | Docker Hub 密码或访问令牌 | `dckr_pat_xxxxx` |

**建议使用访问令牌**：在 Docker Hub → Account Settings → Security → New Access Token 创建

#### SSH 服务器连接
| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SSH_HOST` | 服务器 IP 地址 | `123.45.67.89` |
| `SSH_USER` | SSH 登录用户名 | `root` |
| `SSH_KEY` | SSH 私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SSH_PORT` | SSH 端口（可选，默认 22） | `22` |
| `DEPLOY_PATH` | 服务器上的部署路径 | `/root/my-blog` |

**获取 SSH 私钥**：
```bash
# 在本地机器上
cat ~/.ssh/id_rsa
# 复制整个输出（包括 BEGIN 和 END 行）
```

### 2. 服务器准备

#### 安装 Docker 和 Docker Compose
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl enable docker
systemctl start docker

# 安装 Docker Compose (如果未包含)
# Docker 现在已包含 compose plugin
docker compose version
```

#### 配置 SSH 密钥认证
```bash
# 在服务器上
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加你的公钥到 authorized_keys
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 准备部署目录
```bash
mkdir -p /root/my-blog
cd /root/my-blog

# 复制 docker-compose.yml 到此目录
# 或者让 GitHub Actions 自动复制
```

### 3. 配置环境变量

在服务器上创建 `.env` 文件：
```bash
cd /root/my-blog
cat > .env << EOF
DOCKER_USERNAME=你的DockerHub用户名
PUBLIC_API_URL=https://api.nainong.me
EOF
```

### 4. 首次部署

```bash
cd /root/my-blog
docker compose up -d
```

## 使用方式

### 本地开发构建

```bash
# 本地构建镜像
docker compose build

# 启动服务
docker compose up -d
```

### 生产环境部署

推送到 `main` 分支后，GitHub Actions 自动执行：
1. 构建 `frontend` 和 `backend` 镜像
2. 推送到 Docker Hub
3. SSH 连接服务器执行：
   - `docker compose pull` 拉取最新镜像
   - `docker compose down` 停止旧容器
   - `docker compose up -d` 启动新容器
   - `docker image prune -af --filter "until=72h"` 清理旧镜像

### 手动触发部署

在 GitHub Actions 页面选择 "Deploy to Production" workflow，点击 "Run workflow"

## 资源限制 (适配 2核2GB 服务器)

| 服务 | CPU 限制 | 内存限制 | 说明 |
|------|---------|---------|------|
| backend | 0.5 核 | 256MB | PocketBase |
| frontend | 1.0 核 | 300MB | Nginx 静态文件 |
| nginx | 0.25 核 | 128MB | 反向代理 |

## 监控和维护

### 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务
docker compose logs -f backend
```

### 查看容器状态
```bash
docker compose ps
```

### 重启服务
```bash
docker compose restart
```

### 清理未使用的镜像
```bash
docker image prune -a
```

## 故障排查

### 镜像拉取失败
检查 `.env` 中的 `DOCKER_USERNAME` 是否正确

### 容器启动失败
```bash
docker compose logs backend
docker compose logs frontend
```

### 内存不足
检查资源限制：
```bash
docker stats
```

## 安全建议

1. **使用访问令牌**：Docker Hub 建议使用访问令牌而非密码
2. **SSH 密钥**：使用密钥认证，禁用密码登录
3. **防火墙**：只开放必要端口（80, 443, 22）
4. **定期更新**：及时更新基础镜像和依赖
5. **备份**：定期备份 `pb_data` 目录

## 回滚策略

如果新版本出现问题：
```bash
# 拉取上一个版本的镜像
docker pull 你的用户名/blog-backend:上一个版本tag

# 修改 docker-compose.yml 使用旧镜像
# 然后重启
docker compose up -d
```

建议在 Docker Hub 保留最近 3-5 个版本的镜像标签。
