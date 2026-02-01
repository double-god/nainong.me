#!/bin/bash
# 配置 Runner 用户 sudo 免密码执行 docker 命令

RUNNER_USER=$1

if [ -z "$RUNNER_USER" ]; then
    echo "用法: $0 <runner-username>"
    echo "示例: $0 ubuntu"
    echo ""
    echo "查找 Runner 用户名:"
    ps aux | grep actions-runner | grep -v grep | awk '{print $1}' | sort -u
    exit 1
fi

echo "为用户 $RUNNER_USER 配置 sudo 免密码..."

# 使用 visudo 检查语法
sudo bash -c "echo '$RUNNER_USER ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose' >> /etc/sudoers.d/actions-runner"

# 设置正确的权限
sudo chmod 440 /etc/sudoers.d/actions-runner

echo "✅ 配置完成！"
echo "测试："
echo "  sudo -u $RUNNER_USER docker ps"
