// src/types.ts
export interface Post {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  
  // 这些字段要和你 PocketBase 里的字段名对应
  title: string;
  slug: string;       // 文章的 URL 别名 (建议在 PB 里建这个字段)
  content: string;    // 文章正文
  summary?: string;   // 简介 (可选)
  cover?: string;     // 封面图文件名 (可选)
  tags?: string[];    // 标签 (建议在 PB 里设为 JSON 或 Relation，这里简化处理)
  category?: string;  // 分类
}