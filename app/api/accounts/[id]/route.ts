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

    const { name, type, currency, initialBalance } = await request.json()
    const accountId = params.id

    await query(
      "UPDATE accounts SET name = ?, type = ?, currency = ?, initial_balance = ? WHERE id = ? AND user_id = ?",
      [name, type, currency, initialBalance, accountId, decoded.id],
    )

    const account = await query("SELECT * FROM accounts WHERE id = ? AND user_id = ?", [accountId, decoded.id])

    return NextResponse.json(account[0])
  } catch (error) {
    console.error("Update account error:", error)
    return NextResponse.json({ error: "Ошибка при обновлении счета" }, { status: 500 })
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

    const accountId = params.id

    // Проверяем, есть ли транзакции для этого счета
    const transactions = (await query("SELECT COUNT(*) as count FROM transactions WHERE account_id = ?", [
      accountId,
    ])) as any[]

    if (transactions[0].count > 0) {
      return NextResponse.json({ error: "Нельзя удалить счет с существующими транзакциями" }, { status: 400 })
    }

    await query("DELETE FROM accounts WHERE id = ? AND user_id = ?", [accountId, decoded.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Ошибка при удалении счета" }, { status: 500 })
  }
}
