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

    const budgets = (await query(
      `
      SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id 
        AND t.type = 'expense'
        AND t.transaction_date BETWEEN b.start_date AND b.end_date
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `,
      [decoded.id],
    )) as any[]

    return NextResponse.json(budgets || [])
  } catch (error) {
    console.error("Get budgets error:", error)
    return NextResponse.json({ error: "Ошибка при получении бюджетов" }, { status: 500 })
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

    const { categoryId, amount, period, startDate, endDate } = await request.json()

    const result = (await query(
      "INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
      [decoded.id, categoryId, amount, period, startDate, endDate],
    )) as any

    const budget = (await query(
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
      [result.insertId],
    )) as any[]

    return NextResponse.json(budget[0] || null)
  } catch (error) {
    console.error("Create budget error:", error)
    return NextResponse.json({ error: "Ошибка при создании бюджета" }, { status: 500 })
  }
}
