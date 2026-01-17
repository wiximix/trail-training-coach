"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrailForm, type TrailFormData } from "@/components/forms"

export default function NewTrailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [error, setError] = useState("")
  const [routeMapKey, setRouteMapKey] = useState("")
  const [routeMapUrl, setRouteMapUrl] = useState("")

  const handleUploadRouteMap = async (file: File) => {
    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setRouteMapKey(data.data.fileKey)
        setRouteMapUrl(data.data.signedUrl)
      } else {
        setError(data.error || "上传失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setUploading(false)
    }
  }

  const handleRecognizeRoute = async () => {
    if (!routeMapUrl) {
      setError("请先上传路书图片")
      return
    }

    setRecognizing(true)
    setError("")

    try {
      const response = await fetch("/api/recognize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: routeMapUrl }),
      })

      const data = await response.json()
      if (!data.success) {
        setError(data.error || "识别失败，请手动输入")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setRecognizing(false)
    }
  }

  const handleSubmit = async (formData: TrailFormData) => {
    setError("")
    setLoading(true)

    try {
      const payload = {
        ...formData,
        routeMapKey: routeMapKey || formData.routeMapKey,
        routeMapUrl: routeMapUrl || formData.routeMapUrl,
      }

      const response = await fetch("/api/trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        router.refresh()
        router.push("/trails")
      } else {
        setError(data.error || "创建赛道失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/trails" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ← 返回赛道列表
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">新增赛道</h1>
        </div>

        <TrailForm
          onSubmit={handleSubmit}
          mode="create"
          loading={loading}
          uploading={uploading}
          recognizing={recognizing}
          error={error}
          onUploadRouteMap={handleUploadRouteMap}
          onRecognizeRoute={handleRecognizeRoute}
          initialData={{
            routeMapKey,
            routeMapUrl,
          }}
        />
      </div>
    </div>
  )
}
