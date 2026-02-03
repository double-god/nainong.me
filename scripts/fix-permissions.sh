#!/bin/bash
# 修复 Docker 创建的文件权限
# 在 Runner 服务器上运行此脚本

PROJECT_DIR="/home/runner/actions-runner/_work/nainong.me/nainong.me"

echo "=== 修复 Docker 文件权限 ==="

# 查找并删除受保护的数据库文件
find "$PROJECT_DIR" -type f \( -name "*.db" -o -name "*.db-shm" -o -name "*.db-wal" \) -exec rm -f {} \; 2>/dev/null

echo "✅ 清理完成"
