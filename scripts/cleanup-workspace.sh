#!/bin/bash
# GitHub Actions Runner 工作目录清理脚本
# 解决 Docker 创建的 root 权限文件导致的工作目录清理失败问题

RUNNER_WORK_DIR="/home/runner/actions-runner/_work"
REPO_NAME="nainong.me"

echo "=== 清理工作目录中的受保护文件 ==="

# 查找并删除受保护的数据库文件
find "$RUNNER_WORK_DIR/$REPO_NAME" -type f \( -name "*.db" -o -name "*.db-shm" -o -name "*.db-wal" \) -exec rm -f {} \; 2>/dev/null

# 查找并删除 dist 目录中的 root 权限文件
find "$RUNNER_WORK_DIR/$REPO_NAME" -type d -name "dist" -exec rm -rf {} \; 2>/dev/null

echo "✅ 清理完成"
