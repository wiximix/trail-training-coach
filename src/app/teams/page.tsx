"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/features/auth/AuthGuard"
import DashboardLayout from "@/components/features/layout/DashboardLayout"
import { Users, Plus, Search, UserPlus, UserCheck } from "lucide-react"
import { Button, Card, Input } from "@/components/ui"

interface Team {
  id: string
  name: string
  description: string
  ownerId: string
  memberCount: number
  createdAt: string
}

interface UserTeam {
  team: Team
  member: {
    role: string
    status: string
  }
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeams, setUserTeams] = useState<UserTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null

  useEffect(() => {
    fetchTeams()
    if (user?.id) {
      fetchUserTeams()
    }
  }, [user])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      const data = await response.json()

      if (data.success) {
        setTeams(data.data)
      } else {
        setError(data.error || "获取跑团列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    }
  }

  const fetchUserTeams = async () => {
    try {
      const response = await fetch(`/api/teams/my?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setUserTeams(data.data)
      }
    } catch (err) {
      console.error("获取我的跑团失败:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 过滤跑团列表
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase()
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    )
  })

  // 检查用户是否已加入跑团
  const isMember = (teamId: string) => {
    return userTeams.some(
      (ut) => ut.team.id === teamId && ut.member.status === "approved"
    )
  }

  // 检查用户的申请状态
  const getApplicationStatus = (teamId: string) => {
    const userTeam = userTeams.find((ut) => ut.team.id === teamId)
    return userTeam?.member.status || null
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 页面标题和操作按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">跑团</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                创建或加入跑团，与志同道合的跑者一起训练
              </p>
            </div>
            <Button
              onClick={() => router.push("/teams/new")}
              className="inline-flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              创建跑团
            </Button>
          </div>

          {/* Tab 切换 */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                所有跑团
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "my"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                我的跑团
              </button>
            </nav>
          </div>

          {/* 搜索栏 */}
          {activeTab === "all" && (
            <Card>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索跑团（名称、描述...）"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">{error}</div>
          )}

          {/* 我的跑团列表 */}
          {activeTab === "my" && (
            <div className="space-y-4">
              {userTeams.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    暂无跑团
                  </h3>
                  <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    加入或创建你的第一个跑团
                  </p>
                  <Button
                    onClick={() => router.push("/teams/new")}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    创建跑团
                  </Button>
                </div>
              ) : (
                userTeams.map((userTeam) => (
                  <Link
                    key={userTeam.team.id}
                    href={`/teams/${userTeam.team.id}`}
                    className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:shadow-none hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {userTeam.team.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              userTeam.member.role === "owner"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                : userTeam.member.role === "admin"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {userTeam.member.role === "owner"
                              ? "创建者"
                              : userTeam.member.role === "admin"
                              ? "管理员"
                              : "成员"}
                          </span>
                        </div>
                        {userTeam.team.description && (
                          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            {userTeam.team.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{userTeam.team.memberCount} 成员</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            创建于 {formatDate(userTeam.team.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* 所有跑团列表 */}
          {activeTab === "all" && (
            <div className="space-y-4">
              {filteredTeams.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    {searchQuery ? "未找到匹配的跑团" : "暂无跑团"}
                  </h3>
                  <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? "请尝试其他搜索关键词"
                      : "成为第一个创建跑团的人"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => router.push("/teams/new")}
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      创建跑团
                    </Button>
                  )}
                </div>
              ) : (
                filteredTeams.map((team) => {
                  const applicationStatus = getApplicationStatus(team.id)
                  const isTeamMember = isMember(team.id)

                  return (
                    <div
                      key={team.id}
                      className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:shadow-none hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <Link href={`/teams/${team.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {team.name}
                            </h3>
                          </Link>
                          {team.description && (
                            <p className="mb-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {team.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              <span>{team.memberCount} 成员</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              创建于 {formatDate(team.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {isTeamMember ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                              <UserCheck className="h-4 w-4" />
                              已加入
                            </span>
                          ) : applicationStatus === "pending" ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                              <UserPlus className="h-4 w-4" />
                              等待审核
                            </span>
                          ) : (
                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/teams/${team.id}/members`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ userId: user.id }),
                                  })
                                  const data = await response.json()
                                  if (data.success) {
                                    alert("申请已提交，请等待审核")
                                    await fetchUserTeams()
                                  } else {
                                    alert(data.error || "申请失败")
                                  }
                                } catch (err) {
                                  alert("网络错误，请稍后重试")
                                }
                              }}
                              variant="ghost"
                              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                              <UserPlus className="h-4 w-4" />
                              申请加入
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
