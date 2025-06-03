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

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit") || "50"
    const offsetParam = searchParams.get("offset") || "0"
    const accountId = searchParams.get("accountId")
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Преобразуем limit и offset в числа
    const limit = Number.parseInt(limitParam, 10)
    const offset = Number.parseInt(offsetParam, 10)

    let whereClause = "WHERE t.user_id = ?"
    const params: (string | number)[] = [decoded.id]

    if (accountId) {
      whereClause += " AND t.account_id = ?"
      params.push(accountId)
    }

    if (categoryId) {
      whereClause += " AND t.category_id = ?"
      params.push(categoryId)
    }

    if (startDate) {
      whereClause += " AND t.transaction_date >= ?"
      params.push(startDate)
    }

    if (endDate) {
      whereClause += " AND t.transaction_date <= ?"
      params.push(endDate)
    }

    const transactions = await query(
      `
      SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    )

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "Ошибка при получении транзакций" }, { status: 500 })
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

    const { accountId, categoryId, type, amount, description, transactionDate } = await request.json()

    // Начинаем транзакцию
    await query("START TRANSACTION")

    try {
      // Создаем транзакцию
      const result = (await query(
        "INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [decoded.id, accountId, categoryId, type, amount, description, transactionDate],
      )) as any

      // Обновляем баланс счета
      const balanceChange = type === "income" ? amount : -amount
      await query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ? AND user_id = ?", [
        balanceChange,
        accountId,
        decoded.id,
      ])

      await query("COMMIT")

      const transaction = await query(
        `
        SELECT 
          t.*,
          a.name as account_name,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `,
        [result.insertId],
      )

      return NextResponse.json(transaction[0])
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Ошибка при создании транзакции" }, { status: 500 })
  }
}
