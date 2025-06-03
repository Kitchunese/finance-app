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

    const { categoryId, amount, period, startDate, endDate } = await request.json()
    const budgetId = params.id

    await query(
      "UPDATE budgets SET category_id = ?, amount = ?, period = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?",
      [categoryId, amount, period, startDate, endDate, budgetId, decoded.id],
    )

    const budget = await query(
      `
      SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `,
      [budgetId],
    )

    return NextResponse.json(budget[0])
  } catch (error) {
    console.error("Update budget error:", error)
    return NextResponse.json({ error: "Ошибка при обновлении бюджета" }, { status: 500 })
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

    const budgetId = params.id

    await query("DELETE FROM budgets WHERE id = ? AND user_id = ?", [budgetId, decoded.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete budget error:", error)
    return NextResponse.json({ error: "Ошибка при удалении бюджета" }, { status: 500 })
  }
}
