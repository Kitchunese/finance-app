import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

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

    const categories = await query(
      "SELECT * FROM categories WHERE is_system = TRUE OR user_id = ? ORDER BY is_system DESC, name ASC",
      [decoded.id],
    )

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Ошибка при получении категорий" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 })
    }

    const { name, type, icon, color } = await request.json()

    const result = (await query(
      "INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES (?, ?, ?, ?, ?, FALSE)",
      [decoded.id, name, type, icon, color],
    )) as any

    const category = await query("SELECT * FROM categories WHERE id = ?", [result.insertId])

    return NextResponse.json(category[0])
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Ошибка при создании категории" }, { status: 500 })
  }
}
