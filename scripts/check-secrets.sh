#!/bin/bash

# GitHub Secrets 配置验证脚本
# 用于检查 Self-Hosted Runner 所需的环境变量

echo "=== 检查 GitHub Secrets 配置 ==="
echo ""

# 需要的 Secrets 列表
required_secrets=("DOCKER_USERNAME" "DOCKER_PASSWORD")
optional_secrets=()

echo "必需的 Secrets:"
for secret in "${required_secrets[@]}"; do
    if [ -z "${!secret}" ]; then
        echo "❌ $secret - 未设置"
    else
        echo "✅ $secret - 已设置"
        # 显示部分值（隐藏敏感信息）
        if [ "$secret" = "DOCKER_PASSWORD" ]; then
            echo "   值: ${!secret:0:10}...（已隐藏）"
        else
            echo "   值: ${!secret}"
        fi
    fi
done

echo ""
echo "可选的 Secrets:"
for secret in "${optional_secrets[@]}"; do
    if [ -z "${!secret}" ]; then
        echo "⚠️  $secret - 未设置（可选）"
    else
        echo "✅ $secret - 已设置"
    fi
done

echo ""
echo "=== Docker Hub 连接测试 ==="
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    echo "正在测试 Docker Hub 认证..."
    if echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin 2>/dev/null; then
        echo "✅ Docker Hub 认证成功"
        docker logout
    else
        echo "❌ Docker Hub 认证失败"
        echo "请检查 DOCKER_USERNAME 和 DOCKER_PASSWORD 是否正确"
    fi
else
    echo "⚠️  无法测试 - DOCKER_USERNAME 或 DOCKER_PASSWORD 未设置"
fi

echo ""
echo "=== 检查完成 ==="
