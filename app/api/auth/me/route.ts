import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 })
    }

    // Получаем актуальные данные пользователя из базы
    const users = (await query("SELECT id, first_name, last_name, email, login, is_admin FROM users WHERE id = ?", [
      decoded.id,
    ])) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Get user info error:", error)
    return NextResponse.json({ error: "Ошибка при получении данных пользователя" }, { status: 500 })
  }
}
