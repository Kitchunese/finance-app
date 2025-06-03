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

    const { accountId, categoryId, type, amount, description, transactionDate } = await request.json()
    const transactionId = params.id

    // Начинаем транзакцию
    await query("START TRANSACTION")

    try {
      // Получаем старую транзакцию для корректировки баланса
      const oldTransaction = (await query("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [
        transactionId,
        decoded.id,
      ])) as any[]

      if (oldTransaction.length === 0) {
        await query("ROLLBACK")
        return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 })
      }

      const old = oldTransaction[0]

      // Корректируем баланс старого счета (отменяем старую транзакцию)
      const oldBalanceChange = old.type === "income" ? -old.amount : old.amount
      await query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?", [
        oldBalanceChange,
        old.account_id,
      ])

      // Обновляем транзакцию
      await query(
        "UPDATE transactions SET account_id = ?, category_id = ?, type = ?, amount = ?, description = ?, transaction_date = ? WHERE id = ? AND user_id = ?",
        [accountId, categoryId, type, amount, description, transactionDate, transactionId, decoded.id],
      )

      // Применяем новую транзакцию к балансу
      const newBalanceChange = type === "income" ? amount : -amount
      await query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?", [
        newBalanceChange,
        accountId,
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
        [transactionId],
      )

      return NextResponse.json(transaction[0])
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Update transaction error:", error)
    return NextResponse.json({ error: "Ошибка при обновлении транзакции" }, { status: 500 })
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

    const transactionId = params.id

    // Начинаем транзакцию
    await query("START TRANSACTION")

    try {
      // Получаем транзакцию для корректировки баланса
      const transaction = (await query("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [
        transactionId,
        decoded.id,
      ])) as any[]

      if (transaction.length === 0) {
        await query("ROLLBACK")
        return NextResponse.json({ error: "Транзакция не найдена" }, { status: 404 })
      }

      const t = transaction[0]

      // Корректируем баланс счета (отменяем транзакцию)
      const balanceChange = t.type === "income" ? -t.amount : t.amount
      await query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?", [
        balanceChange,
        t.account_id,
      ])

      // Удаляем транзакцию
      await query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [transactionId, decoded.id])

      await query("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ error: "Ошибка при удалении транзакции" }, { status: 500 })
  }
}
