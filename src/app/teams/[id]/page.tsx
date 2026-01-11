"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"
import {
  Users,
  Calendar,
  Shield,
  MoreVertical,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react"

interface Team {
  id: string
  name: string
  description: string
  ownerId: string
  memberCount: number
  createdAt: string
}

interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: "owner" | "admin" | "member"
  status: "pending" | "approved" | "rejected" | "left"
  joinedAt?: string
  createdAt: string
  user?: {
    id: string
    username: string
    email: string
  }
}

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"members" | "pending">("members")
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null

  useEffect(() => {
    fetchTeamData()
    fetchMembers()
  }, [teamId])

  const fetchTeamData = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)
      const data = await response.json()

      if (data.success) {
        setTeam(data.data)
      } else {
        setError(data.error || "获取跑团信息失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    }
  }

  const fetchMembers = async (status?: string) => {
    try {
      const url = status
        ? `/api/teams/${teamId}/members?status=${status}`
        : `/api/teams/${teamId}/members`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setMembers(data.data)
      }
    } catch (err) {
      console.error("获取成员列表失败:", err)
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

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (data.success) {
        fetchMembers("pending")
      } else {
        alert(data.error || "操作失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const handleReject = async (userId: string) => {
    if (!confirm("确定要拒绝这个申请吗？")) return

    try {
      const response = await fetch(`/api/teams/${teamId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (data.success) {
        fetchMembers("pending")
      } else {
        alert(data.error || "操作失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const handleRemove = async (memberId: string, memberUserId: string) => {
    if (!confirm("确定要移除这个成员吗？")) return

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberUserId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        fetchMembers()
        fetchTeamData()
      } else {
        alert(data.error || "操作失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const handleLeave = async () => {
    if (!confirm("确定要退出这个跑团吗？")) return

    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await response.json()
      if (data.success) {
        alert("已退出跑团")
        window.location.href = "/teams"
      } else {
        alert(data.error || "操作失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const isAdmin = () => {
    const member = members.find(
      (m) => m.userId === user?.id && m.status === "approved"
    )
    return member && (member.role === "owner" || member.role === "admin")
  }

  const isOwner = () => {
    return team?.ownerId === user?.id
  }

  const isMember = () => {
    return members.some(
      (m) => m.userId === user?.id && m.status === "approved"
    )
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

  if (error || !team) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <Link href="/teams" className="text-blue-600 hover:text-blue-700">
                ← 返回跑团列表
              </Link>
            </div>
            <div className="rounded-lg bg-red-50 p-6 text-red-600">
              {error || "跑团不存在"}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const approvedMembers = members.filter((m) => m.status === "approved")
  const pendingMembers = members.filter((m) => m.status === "pending")

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 面包屑导航 */}
          <div>
            <Link href="/teams" className="text-blue-600 hover:text-blue-700">
              ← 返回跑团列表
            </Link>
          </div>

          {/* 跑团信息 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {team.name}
                  </h1>
                  {isOwner() && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      <Crown className="h-3 w-3" />
                      创建者
                    </span>
                  )}
                </div>
                {team.description && (
                  <p className="text-sm text-gray-600">{team.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{team.memberCount} 成员</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>创建于 {formatDate(team.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isMember() && !isOwner() && (
                  <button
                    onClick={handleLeave}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    退出跑团
                  </button>
                )}
                {isOwner() && (
                  <button
                    onClick={() => window.location.href = `/teams/${team.id}/edit`}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="mr-1 inline h-4 w-4" />
                    编辑
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => {
                  setActiveTab("members")
                  fetchMembers("approved")
                }}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "members"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                成员列表 ({approvedMembers.length})
              </button>
              {(isAdmin() || isOwner()) && (
                <button
                  onClick={() => {
                    setActiveTab("pending")
                    fetchMembers("pending")
                  }}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "pending"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  待审核 ({pendingMembers.length})
                </button>
              )}
            </nav>
          </div>

          {/* 成员列表 */}
          {activeTab === "members" && (
            <div className="space-y-4">
              {approvedMembers.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
                  暂无成员
                </div>
              ) : (
                approvedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        {member.user?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {member.user?.username || "未知用户"}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              member.role === "owner"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.role === "owner"
                              ? "创建者"
                              : member.role === "admin"
                              ? "管理员"
                              : "成员"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>

                    {isAdmin() && member.role !== "owner" && (
                      <button
                        onClick={() => handleRemove(member.id, member.userId)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <UserX className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 待审核列表 */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingMembers.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
                  暂无待审核申请
                </div>
              ) : (
                pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                        {member.user?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {member.user?.username || "未知用户"}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(member.userId)}
                        className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(member.userId)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
