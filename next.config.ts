import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 正式域名配置
  env: {
    NEXT_PUBLIC_DOMAIN: "byptb6339h.coze.site",
    NEXT_PUBLIC_URL: "https://byptb6339h.coze.site",
    NEXT_PUBLIC_APP_URL: "https://byptb6339h.coze.site",
  },
  // 启用严格模式
  reactStrictMode: true,
  // 仅在生产环境配置静态导出
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // 禁用图片优化以支持静态导出
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  },
  // 配置 basePath 用于 GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/trail-training-coach' : '',
};

export default nextConfig;
