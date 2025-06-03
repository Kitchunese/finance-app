import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const categoryId = params.id

    // Проверяем, что это не системная категория
    const category = (await query("SELECT is_system FROM categories WHERE id = ?", [categoryId])) as any[]
    if (category[0]?.is_system) {
      return NextResponse.json({ error: "Системные категории нельзя редактировать" }, { status: 400 })
    }

    await query("UPDATE categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?", [
      name,
      type,
      icon,
      color,
      categoryId,
      decoded.id,
    ])

    const updatedCategory = await query("SELECT * FROM categories WHERE id = ?", [categoryId])

    return NextResponse.json(updatedCategory[0])
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ error: "Ошибка при обновлении категории" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 })
    }

    const categoryId = params.id

    // Проверяем, что это не системная категория
    const category = (await query("SELECT is_system FROM categories WHERE id = ?", [categoryId])) as any[]
    if (category[0]?.is_system) {
      return NextResponse.json({ error: "Системные категории нельзя удалить" }, { status: 400 })
    }

    // Проверяем, есть ли транзакции с этой категорией
    const transactions = (await query("SELECT COUNT(*) as count FROM transactions WHERE category_id = ?", [
      categoryId,
    ])) as any[]

    if (transactions[0].count > 0) {
      return NextResponse.json({ error: "Нельзя удалить категорию с существующими транзакциями" }, { status: 400 })
    }

    await query("DELETE FROM categories WHERE id = ? AND user_id = ?", [categoryId, decoded.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Ошибка при удалении категории" }, { status: 500 })
  }
}
