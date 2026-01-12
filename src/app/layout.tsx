import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://byptb6339h.coze.site"),
  title: "越野训练教练",
  description: "专业的越野训练教练APP，帮助跑者提高成绩",
  keywords: ["越野跑", "训练", "马拉松", "跑步", "运动", "教练", "成绩预测"],
  authors: [{ name: "越野训练教练" }],
  creator: "越野训练教练",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://byptb6339h.coze.site",
    title: "越野训练教练",
    description: "专业的越野训练教练APP，帮助跑者提高成绩",
    siteName: "越野训练教练",
  },
  twitter: {
    card: "summary",
    title: "越野训练教练",
    description: "专业的越野训练教练APP，帮助跑者提高成绩",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
