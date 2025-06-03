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

    const accounts = await query("SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC", [decoded.id])

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json({ error: "Ошибка при получении счетов" }, { status: 500 })
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

    const { name, type, currency, initialBalance } = await request.json()

    const result = (await query(
      "INSERT INTO accounts (user_id, name, type, currency, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?)",
      [decoded.id, name, type, currency, initialBalance, initialBalance],
    )) as any

    const account = await query("SELECT * FROM accounts WHERE id = ?", [result.insertId])

    return NextResponse.json(account[0])
  } catch (error) {
    console.error("Create account error:", error)
    return NextResponse.json({ error: "Ошибка при создании счета" }, { status: 500 })
  }
}
