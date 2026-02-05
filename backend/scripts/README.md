# 音乐管理脚本

用于上传音乐到 Cloudflare R2 并在 PocketBase 中创建记录。

## 📦 安装依赖

```bash
npm install @aws-sdk/client-s3 --save
```

## 🔧 配置

### 方法 1：环境变量（推荐）

```bash
export R2_ACCESS_KEY_ID="your-access-key-id"
export R2_SECRET_ACCESS_KEY="your-secret-access-key"
export R2_BUCKET="nainong-blog"
export R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
export R2_PUBLIC_URL="https://img.nainong.me"
```

### 方法 2：配置文件（已配置好）

配置文件 `r2-config.json` 已包含你的真实凭证。

## 🚀 使用

### 方式 1：直接使用 MP3 文件（推荐）

如果你已经有 MP3 格式的音乐文件，直接使用：

```bash
cd backend/scripts

# 自动上传音频、封面并创建 PocketBase 记录
node add-music.js song.mp3 cover.jpg "歌曲名" "歌手"

# 示例
node add-music.js music.mp3 cover.jpg "夜曲" "周杰伦"
```

### 方式 2：转换其他格式后上传

如果你的音乐是 FLAC、WAV、M4A 等格式，先转换为 MP3：

```bash
cd backend/scripts

# 步骤 1: 转换为 MP3（可选）
node convert-audio.js song.flac song.mp3

# 步骤 2: 上传
node add-music.js song.mp3 cover.jpg "歌曲名" "歌手"
```

**支持的音频格式：**
- 直接使用：MP3, M4A, OGG（浏览器支持）
- 需要转换：FLAC, WAV, WMA, AAC（转换为 MP3）
- 不支持：NCM（加密格式）

### 方式 3：仅上传文件到 R2

如果你只想上传文件，不创建 PocketBase 记录：

```bash
cd backend/scripts

node upload-to-r2.js song.mp3
node upload-to-r2.js cover.jpg
```

## 📖 完整工作流程

### 流程 A：使用 MP3 文件（最简单）

```
1. 准备 MP3 格式的音乐文件
   ↓
2. 准备封面图片 (JPG/PNG/WebP)
   ↓
3. 运行脚本
   node add-music.js song.mp3 cover.jpg "我的歌" "歌手"
   ↓
4. 脚本自动完成：
   ✓ 上传音频到 R2
   ✓ 上传封面到 R2
   ✓ 在 PocketBase 创建记录
   ↓
5. 刷新网页，音乐自动出现在播放器
```

### 流程 B：转换格式后上传

```
1. 准备音频文件（任意格式）
   ↓
2. (可选) 转换为 MP3
   node convert-audio.js song.flac song.mp3
   ↓
3. 准备封面图片
   ↓
4. 运行脚本
   node add-music.js song.mp3 cover.jpg "我的歌" "歌手"
   ↓
5. 刷新网页查看效果
```

## 🔑 技术说明

- **AWS Signature v4**: 由 AWS SDK 自动处理
- **上传方法**: PUT (S3 协议标准)
- **文件命名**: 自动使用时间戳+随机数避免冲突
- **Content-Type**: 自动根据文件扩展名设置

## ⚠️ 注意事项

1. **不要提交 r2-config.json 到 Git**（已在 .gitignore 中）
2. **NCM 文件**：加密格式，无法直接使用
3. **API 凭证**：请妥善保管 Secret Access Key
4. **FFmpeg**：仅在需要转换音频格式时安装（如果使用 MP3 文件则不需要）

## 📝 PocketBase 配置

确保在 PocketBase 中创建了 `music` 集合，包含以下字段：

- `title` (Text, 必填)
- `artist` (Text, 可选)
- `cover` (URL, 必填)
- `url` (URL, 必填)
- `active` (Bool, 可选)

