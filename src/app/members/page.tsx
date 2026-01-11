"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Member {
  id: string
  name: string
  height?: number
  weight?: number
  gender?: string
  restingHeartRate?: number
  maxHeartRate?: number
  lactateThresholdHeartRate?: number
  lactateThresholdPace?: string
  marathonPace?: string
  terrainPaceFactors?: any
  preferredSupplyTypes?: string[]
  crampFrequency?: string
  expectedSweatRate?: string
}

// 可显示的列配置
const COLUMN_OPTIONS = [
  { key: "name", label: "姓名", default: true },
  { key: "gender", label: "性别", default: true },
  { key: "height", label: "身高", default: true },
  { key: "weight", label: "体重", default: true },
  { key: "restingHeartRate", label: "静息心率", default: true },
  { key: "maxHeartRate", label: "最大心率", default: true },
  { key: "lactateThresholdHeartRate", label: "乳酸阈值心率", default: false },
  { key: "lactateThresholdPace", label: "乳酸阈值配速", default: false },
  { key: "marathonPace", label: "马拉松配速", default: true },
  { key: "crampFrequency", label: "抽筋情况", default: false },
  { key: "expectedSweatRate", label: "预计出汗量", default: false },
]

// 计算储备心率区间
function calculateHRRZones(restingHeartRate: number, maxHeartRate: number) {
  const hrr = maxHeartRate - restingHeartRate
  return {
    zone1: {
      name: "Zone 1 (恢复)",
      min: restingHeartRate + Math.round(hrr * 0.5),
      max: restingHeartRate + Math.round(hrr * 0.6),
      color: "bg-gray-100 text-gray-800",
    },
    zone2: {
      name: "Zone 2 (有氧基础)",
      min: restingHeartRate + Math.round(hrr * 0.6),
      max: restingHeartRate + Math.round(hrr * 0.7),
      color: "bg-green-100 text-green-800",
    },
    zone3: {
      name: "Zone 3 (有氧)",
      min: restingHeartRate + Math.round(hrr * 0.7),
      max: restingHeartRate + Math.round(hrr * 0.8),
      color: "bg-blue-100 text-blue-800",
    },
    zone4: {
      name: "Zone 4 (无氧)",
      min: restingHeartRate + Math.round(hrr * 0.8),
      max: restingHeartRate + Math.round(hrr * 0.9),
      color: "bg-orange-100 text-orange-800",
    },
    zone5: {
      name: "Zone 5 (最大摄氧量)",
      min: restingHeartRate + Math.round(hrr * 0.9),
      max: maxHeartRate,
      color: "bg-red-100 text-red-800",
    },
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // 列选择状态
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMN_OPTIONS.filter(col => col.default).map(col => col.key)
  )
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  // 行选择状态
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")

  // 心率区间展开状态
  const [expandedHrrMemberId, setExpandedHrrMemberId] = useState<string>("")

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      if (data.success) {
        setMembers(data.data)
      } else {
        setError(data.error || "获取成员列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除成员 "${name}" 吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setMembers(members.filter((m) => m.id !== id))
        if (selectedMemberId === id) {
          setSelectedMemberId("")
        }
      } else {
        alert(data.error || "删除失败")
      }
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    )
  }

  const getCellValue = (member: Member, columnKey: string): string => {
    const value = member[columnKey as keyof Member]
    if (value === undefined || value === null) return "-"
    if (typeof value === "object" && Array.isArray(value)) return value.join(", ")
    return String(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首页
            </Link>
          </div>
          <p className="text-center text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← 返回首页
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">成员管理</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {showColumnSelector ? "关闭列选择" : "选择显示列"}
            </button>
            {selectedMemberId && (
              <button
                onClick={() => router.push(`/members/${selectedMemberId}/edit`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                编辑选中
              </button>
            )}
            <button
              onClick={() => router.push("/members/new")}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              新增成员
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {/* 列选择器 */}
        {showColumnSelector && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 font-semibold text-gray-900">选择要显示的列</h3>
            <div className="flex flex-wrap gap-3">
              {COLUMN_OPTIONS.map((column) => (
                <label key={column.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
            暂无成员数据，点击上方按钮添加第一个成员
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="radio"
                      checked={!selectedMemberId}
                      onChange={() => setSelectedMemberId("")}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {selectedColumns.map((columnKey) => (
                    <th
                      key={columnKey}
                      className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500"
                    >
                      {COLUMN_OPTIONS.find(col => col.key === columnKey)?.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {members.map((member) => {
                  const hrrZones = member.restingHeartRate && member.maxHeartRate
                    ? calculateHRRZones(member.restingHeartRate, member.maxHeartRate)
                    : null

                  return (
                    <React.Fragment key={member.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            checked={selectedMemberId === member.id}
                            onChange={() => setSelectedMemberId(member.id)}
                            className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        {selectedColumns.map((columnKey) => (
                          <td key={columnKey} className="px-4 py-3 text-sm text-gray-900">
                            {getCellValue(member, columnKey)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/members/${member.id}/edit`)}
                              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(member.id, member.name)}
                              className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                            >
                              删除
                            </button>
                            {hrrZones && (
                              <button
                                onClick={() =>
                                  setExpandedHrrMemberId(
                                    expandedHrrMemberId === member.id ? "" : member.id
                                  )
                                }
                                className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                              >
                                心率区间
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* 储备心率区间详情 */}
                      {expandedHrrMemberId === member.id && hrrZones && (
                        <tr>
                          <td colSpan={selectedColumns.length + 2}>
                            <div className="bg-gray-50 p-4">
                              <h4 className="mb-3 font-semibold text-gray-900">
                                储备心率区间 (HRR)
                              </h4>
                              <div className="grid gap-2 md:grid-cols-5">
                                {Object.values(hrrZones).map((zone) => (
                                  <div
                                    key={zone.name}
                                    className={`rounded p-2 text-xs ${zone.color}`}
                                  >
                                    <div className="font-medium">{zone.name}</div>
                                    <div className="mt-1">
                                      {zone.min} - {zone.max} bpm
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 text-xs text-gray-600">
                                静息心率: {member.restingHeartRate} bpm | 最大心率: {member.maxHeartRate} bpm
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
