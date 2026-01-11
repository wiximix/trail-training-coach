import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "越野训练教练",
  description: "越野训练教练APP",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            越野训练教练
          </h1>
          <p className="text-lg text-gray-600">
            科学训练，智能预测，助力越野跑者突破极限
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/members"
            className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              成员管理
            </h2>
            <p className="text-gray-600">
              管理跑者成员的基础数据、跑力数据和补给偏好
            </p>
          </Link>

          <Link
            href="/trails"
            className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">赛道管理</h2>
            <p className="text-gray-600">
              录入和管理各个越野赛道的详细信息，包括CP点数据
            </p>
          </Link>

          <Link
            href="/predict"
            className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              成绩预测
            </h2>
            <p className="text-gray-600">
              基于跑者数据和赛道信息，智能预测比赛成绩和补给策略
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}