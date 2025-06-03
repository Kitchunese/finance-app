import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("Middleware: Processing request for:", request.nextUrl.pathname)

  // Получаем токен из cookies
  const token = request.cookies.get("token")?.value
  console.log("Middleware: Token exists:", !!token)

  // Защищенные маршруты
  const protectedPaths = ["/dashboard"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Публичные маршруты
  const publicPaths = ["/login", "/register"]
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname === path)

  console.log("Middleware: Is protected path:", isProtectedPath, "Is public path:", isPublicPath)

  // Если пользователь пытается получить доступ к защищенному маршруту без токена
  if (isProtectedPath && !token) {
    console.log("Middleware: Redirecting to login - no token for protected path")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Если пользователь авторизован и пытается зайти на страницы входа/регистрации
  if (token && isPublicPath) {
    console.log("Middleware: Redirecting to dashboard - authenticated user on public path")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  console.log("Middleware: Allowing request to proceed")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
