#!/usr/bin/env node

/**
 * Cloudflare R2 上传脚本
 * 使用 AWS S3 SDK 自动处理 Signature v4 签名
 *
 * 环境变量配置：
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   R2_PUBLIC_URL
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 从环境变量或配置文件加载配置
function loadConfig() {
  // 优先使用环境变量
  const envConfig = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET || 'nainong-blog',
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    publicUrl: process.env.R2_PUBLIC_URL || 'https://img.nainong.me',
  };

  // 如果环境变量不完整，尝试从配置文件加载
  if (!envConfig.accessKeyId || !envConfig.secretAccessKey) {
    const configPath = path.join(__dirname, 'r2-config.json');

    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      Object.assign(envConfig, fileConfig);
    }
  }

  // 验证必填字段
  if (!envConfig.accessKeyId || !envConfig.secretAccessKey) {
    console.error('❌ 缺少 R2 API 凭证！');
    console.error('\n请设置环境变量或创建配置文件：\n');
    console.error('方法 1 - 环境变量：');
    console.error('  export R2_ACCESS_KEY_ID="your-access-key"');
    console.error('  export R2_SECRET_ACCESS_KEY="your-secret-key"');
    console.error('  export R2_BUCKET="nainong-blog"\n');
    console.error('方法 2 - 配置文件：');
    console.error('  复制 r2-config.json.example 为 r2-config.json');
    console.error('  填入你的 API 凭证\n');
    return null;
  }

  // 自动构建 endpoint（如果没有提供）
  if (!envConfig.endpoint && envConfig.accountId) {
    envConfig.endpoint = `https://${envConfig.accountId}.r2.cloudflarestorage.com`;
  }

  return envConfig;
}

// 创建 R2 客户端（AWS SDK 自动处理 Signature v4）
function createR2Client(config) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

// 上传文件到 R2
async function uploadToR2(client, config, filePath, customKey = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName);

  // 生成唯一文件名（防止冲突）
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const key = customKey || `music/${timestamp}-${random}${fileExt}`;

  // 确定 Content-Type
  const contentTypes = {
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };

  const contentType = contentTypes[fileExt] || 'application/octet-stream';

  // 上传到 R2（AWS SDK 自动处理 AWS Signature v4 签名）
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });

  try {
    await client.send(command);
    const publicUrl = `${config.publicUrl}/${key}`;
    console.log(`✅ 上传成功: ${fileName}`);
    console.log(`   URL: ${publicUrl}\n`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ 上传失败: ${error.message}`);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('\n📤 Cloudflare R2 上传工具 (AWS S3 协议)\n');

  // 加载配置
  const config = loadConfig();
  if (!config) {
    process.exit(1);
  }

  // 显示配置信息（隐藏敏感信息）
  console.log('配置信息：');
  console.log(`  Endpoint: ${config.endpoint}`);
  console.log(`  Bucket: ${config.bucket}`);
  console.log(`  Region: ${config.region}`);
  console.log(`  Public URL: ${config.publicUrl}`);
  console.log(`  Access Key: ${config.accessKeyId?.substring(0, 8)}...****\n`);

  // 创建 R2 客户端
  const client = createR2Client(config);

  // 获取命令行参数
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
用法：
  node upload-to-r2.js <文件路径> [自定义Key]

示例：
  node upload-to-r2.js song.mp3
  node upload-to-r2.js cover.jpg
  node upload-to-r2.js song.mp3 "albums/2024/my-song.mp3"

支持的文件类型：
  - 音频: MP3, M4A, FLAC, WAV, OGG
  - 图片: JPG, PNG, WebP, GIF

配置方式：
  1. 环境变量（推荐用于 CI/CD）
  2. 配置文件 r2-config.json（本地开发）

注意：配置文件已加入 .gitignore，不会被提交到 Git
    `);
    return;
  }

  const filePath = args[0];
  const customKey = args[1];

  try {
    const url = await uploadToR2(client, config, filePath, customKey);
    console.log(`\n🎉 上传完成！\n`);
    console.log(`可以直接使用这个 URL:\n${url}\n`);
  } catch (error) {
    console.error(`\n❌ 上传失败: ${error.message}\n`);
    console.error('请检查：');
    console.error('1. API 凭证是否正确');
    console.error('2. Bucket 名称是否正确');
    console.error('3. 网络连接是否正常\n');
    process.exit(1);
  }
}

main();
