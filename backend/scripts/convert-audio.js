#!/usr/bin/env node

/**
 * 音频格式转换脚本（可选功能）
 *
 * 用法：
 *   node convert-audio.js input.wav output.mp3
 *   node convert-audio.js input.flac           # 自动输出为 .mp3
 *   node convert-audio.js *.m4a               # 批量转换
 *
 * 支持的输入格式：MP3, WAV, FLAC, M4A, OGG, WMA, AAC
 * 输出格式：MP3 (192kbps, 高质量)
 *
 * 依赖：需要安装 FFmpeg
 *   Windows: winget install FFmpeg
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查 FFmpeg 是否安装
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg 未安装！');
    console.error('\n请安装 FFmpeg：');
    console.error('  Windows: winget install FFmpeg');
    console.error('  或访问: https://ffmpeg.org/download.html\n');
    return false;
  }
}

// 转换单个文件
function convertAudio(input, output) {
  if (!fs.existsSync(input)) {
    console.error(`❌ 文件不存在: ${input}`);
    return false;
  }

  // 如果没有指定输出文件，自动生成
  if (!output) {
    const parsed = path.parse(input);
    output = path.join(parsed.dir, `${parsed.name}.mp3`);
  }

  console.log(`🎵 转换中: ${path.basename(input)} → ${path.basename(output)}`);

  try {
    // FFmpeg 命令
    execSync(
      `ffmpeg -i "${input}" -codec:a libmp3lame -b:a 192k -ar 44100 -y "${output}"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ 转换成功: ${output}\n`);
    return true;
  } catch (error) {
    console.error(`❌ 转换失败: ${error.message}\n`);
    return false;
  }
}

// 批量转换
function convertMultiple(files) {
  let success = 0;
  let failed = 0;

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    const supportedExts = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.wma', '.aac', '.opus'];

    if (supportedExts.includes(ext)) {
      if (ext === '.mp3') {
        console.log(`⏭️  跳过: ${file} (已经是 MP3 格式)\n`);
        return;
      }

      if (ext === '.ncm') {
        console.log(`⚠️  跳过: ${file} (NCM 是加密格式，需要先解密)\n`);
        return;
      }

      const result = convertAudio(file);
      if (result) success++;
      else failed++;
    } else {
      console.log(`⏭️  跳过: ${file} (不支持的格式)\n`);
    }
  });

  console.log(`\n📊 转换统计：`);
  console.log(`   成功: ${success}`);
  console.log(`   失败: ${failed}`);
  console.log(`   总计: ${files.length}`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (!checkFFmpeg()) {
    process.exit(1);
  }

  if (args.length === 0) {
    console.log(`
🎵 音频格式转换脚本（可选功能）

用法：
  node convert-audio.js <input> [output]

示例：
  node convert-audio.js song.wav                    # 转换为 song.mp3
  node convert-audio.js song.flac output.mp3        # 指定输出文件名
  node convert-audio.js *.m4a                       # 批量转换
  node convert-audio.js folder/*.wav                # 转换文件夹中的所有文件

支持的输入格式：MP3, WAV, FLAC, M4A, OGG, WMA, AAC, OPUS
输出格式：MP3 (192kbps, 44.1kHz, 高质量)

注意：如果不使用此脚本，可以直接使用 MP3 格式的文件
    `);
    return;
  }

  // 处理通配符
  const { glob } = require('glob');
  const files = args.flatMap(arg => {
    if (arg.includes('*')) {
      try {
        return glob.sync(arg);
      } catch {
        return [arg];
      }
    }
    return [arg];
  });

  if (files.length === 1) {
    const [input, output] = args;
    convertAudio(input, output);
  } else if (files.length > 1) {
    convertMultiple(files);
  }
}

main();
