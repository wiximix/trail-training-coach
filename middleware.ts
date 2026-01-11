import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 定义需要登录的路径
const protectedPaths = ["/profile", "/members", "/trails", "/predict", "/reviews"]

// 定义认证相关路径（已登录用户不应访问）
const authPaths = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是需要登录的路径
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // 检查是否是认证相关路径
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // 获取 token
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // 如果访问需要登录的路径但没有 token，重定向到登录页
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 如果访问认证路径且已登录，重定向到首页或指定页面
  if (isAuthPath && token) {
    const redirectParam = request.nextUrl.searchParams.get("redirect")
    const redirectUrl = redirectParam ? new URL(redirectParam, request.url) : new URL("/", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
}
