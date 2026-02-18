'use client';

import { Script } from 'next/script';
import { useEffect } from 'react';

interface DocumentProps {
  children: React.ReactNode;
}

export default function Document({ children }: DocumentProps) {
  useEffect(() => {
    // 设置 basePath 环境变量
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      if (path.startsWith(basePath) && path.length > basePath.length) {
        // 应用 basePath 到相对链接
        const originalPushState = history.pushState;
        history.pushState = function(state: any, title: string, url?: string) {
          if (url && !url.startsWith('http')) {
            url = basePath + url.replace(/^\//, '');
          }
          originalPushState.call(this, state, title, url);
        };
      }
    }
  }, []);

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Trail Training Coach - 徒步训练助手" />
        <link rel="icon" href="/favicon.ico" />
        <Script
          strategy="beforeInteractive"
          src="https://byptb6339h.coze.site/init.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
