#!/usr/bin/env node

/**
 * 完整的音乐添加流程
 * 1. 上传音频文件到 R2
 * 2. 上传封面图片到 R2
 * 3. 在 PocketBase 中创建音乐记录
 *
 * 环境变量：
 *   PB_URL - PocketBase 地址 (默认: http://localhost:8090)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PB_URL = process.env.PB_URL || 'http://localhost:8090';

// 调用 R2 上传脚本
function uploadToR2(filePath) {
  try {
    const scriptPath = path.join(__dirname, 'upload-to-r2.js');
    const output = execSync(`node "${scriptPath}" "${filePath}"`, {
      encoding: 'utf-8',
      cwd: __dirname,
    });

    // 提取 URL（假设上传脚本最后一行输出 URL）
    const lines = output.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('https://')) {
        return line;
      }
    }
    throw new Error('无法从输出中提取 URL');
  } catch (error) {
    throw new Error(`R2 上传失败: ${error.message}`);
  }
}

// 创建 PocketBase 音乐记录
async function createMusicRecord(title, artist, coverUrl, musicUrl) {
  const record = {
    title,
    artist: artist || '',
    cover: coverUrl,
    url: musicUrl,
    active: true,
  };

  try {
    const response = await fetch(`${PB_URL}/api/collections/music/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建记录失败');
    }

    const result = await response.json();
    console.log('✅ PocketBase 记录创建成功！');
    console.log(`   ID: ${result.id}`);
    console.log(`   标题: ${result.title}\n`);
    return result;
  } catch (error) {
    throw new Error(`PocketBase 创建记录失败: ${error.message}`);
  }
}

// 主函数
async function main() {
  console.log('\n🎵 音乐添加工具\n');
  console.log('这个工具会自动完成以下步骤：');
  console.log('1. 上传音频文件到 R2');
  console.log('2. 上传封面图片到 R2');
  console.log('3. 在 PocketBase 中创建音乐记录\n');
  console.log(`PocketBase: ${PB_URL}\n`);

  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
用法：
  node add-music.js <音频文件> <封面文件> [歌曲名] [歌手]

示例：
  node add-music.js song.mp3 cover.jpg
  node add-music.js song.mp3 cover.jpg "我的歌" "歌手名"
  node add-music.js music.flac image.png "Awesome Song" "Artist"

说明：
  - 音频文件支持: MP3, M4A, FLAC, WAV, OGG
  - 封面文件支持: JPG, PNG, WebP, GIF
  - 如果不提供歌名和歌手，会使用文件名

环境变量：
  PB_URL - PocketBase 地址 (默认: http://localhost:8090)
    `);
    return;
  }

  const audioFile = args[0];
  const coverFile = args[1];
  let title = args[2] || '';
  let artist = args[3] || '';

  // 检查文件是否存在
  if (!fs.existsSync(audioFile)) {
    console.error(`❌ 音频文件不存在: ${audioFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(coverFile)) {
    console.error(`❌ 封面文件不存在: ${coverFile}`);
    process.exit(1);
  }

  // 如果没有提供歌名，使用文件名
  if (!title) {
    title = path.basename(audioFile, path.extname(audioFile));
    console.log(`ℹ️  使用文件名作为歌名: ${title}\n`);
  }

  try {
    // 步骤 1: 上传音频
    console.log(`📤 [1/3] 上传音频文件: ${path.basename(audioFile)}`);
    const musicUrl = await uploadToR2(audioFile);

    // 步骤 2: 上传封面
    console.log(`📤 [2/3] 上传封面图片: ${path.basename(coverFile)}`);
    const coverUrl = await uploadToR2(coverFile);

    // 步骤 3: 创建记录
    console.log(`📝 [3/3] 创建 PocketBase 记录`);
    await createMusicRecord(title, artist, coverUrl, musicUrl);

    console.log('🎉 全部完成！刷新网页查看效果。\n');
  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}\n`);
    process.exit(1);
  }
}

main();
