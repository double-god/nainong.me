#!/bin/bash
# Docker 权限诊断脚本

echo "=== 1. 检查当前用户 ==="
CURRENT_USER=$(whoami)
echo "当前用户: $CURRENT_USER"

echo ""
echo "=== 2. 检查用户组 ==="
groups $CURRENT_USER

echo ""
echo "=== 3. 检查 docker 组成员 ==="
getent group docker

echo ""
echo "=== 4. 检查 docker.sock 权限 ==="
ls -la /var/run/docker.sock

echo ""
echo "=== 5. 测试 Docker 连接 ==="
if docker ps &>/dev/null; then
    echo "✅ Docker 权限正常"
else
    echo "❌ Docker 权限不足"
    echo "需要："
    echo "  1. 重新登录: ssh logout 后重新登录"
    echo "  2. 或重启 Runner 服务"
fi

echo ""
echo "=== 6. Runner 进程信息 ==="
ps aux | grep -E "actions-runner|runsvc" | grep -v grep
