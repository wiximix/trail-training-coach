"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MemberForm, type MemberFormData } from "@/components/forms"

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: MemberFormData) => {
    setError("")
    setLoading(true)

    try {
      const payload = {
        ...formData,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        restingHeartRate: formData.restingHeartRate
          ? Number(formData.restingHeartRate)
          : null,
        maxHeartRate: formData.maxHeartRate
          ? Number(formData.maxHeartRate)
          : null,
        lactateThresholdHeartRate: formData.lactateThresholdHeartRate
          ? Number(formData.lactateThresholdHeartRate)
          : null,
        vo2Max: formData.vo2Max ? Number(formData.vo2Max) : null,
        preferredSupplyTypes:
          formData.preferredSupplyTypes.length > 0
            ? formData.preferredSupplyTypes
            : null,
      }

      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        router.refresh()
        router.push("/members")
      } else {
        setError(data.error || "创建成员失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/members" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ← 返回成员列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">新增成员</h1>
        </div>

        <MemberForm
          onSubmit={handleSubmit}
          mode="create"
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
