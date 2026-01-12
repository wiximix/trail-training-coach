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
};

export default nextConfig;
