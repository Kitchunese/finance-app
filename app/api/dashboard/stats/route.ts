import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Dashboard stats API: Request received")

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.log("Dashboard stats API: No token provided")
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Dashboard stats API: Invalid token")
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 })
    }

    console.log("Dashboard stats API: Token valid for user:", decoded.id)

    // Получаем общий баланс всех счетов
    const totalBalanceResult = (await query("SELECT SUM(current_balance) as total FROM accounts WHERE user_id = ?", [
      decoded.id,
    ])) as any[]
    const totalBalance = totalBalanceResult[0]?.total || 0

    // Получаем доходы и расходы за текущий месяц
    const currentMonthResult = (await query(
      `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      WHERE user_id = ? 
        AND YEAR(transaction_date) = YEAR(CURDATE()) 
        AND MONTH(transaction_date) = MONTH(CURDATE())
    `,
      [decoded.id],
    )) as any[]

    const monthlyIncome = currentMonthResult[0]?.income || 0
    const monthlyExpenses = currentMonthResult[0]?.expenses || 0
    const savings = monthlyIncome - monthlyExpenses

    // Получаем данные за предыдущий месяц для сравнения
    const previousMonthResult = (await query(
      `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      WHERE user_id = ? 
        AND YEAR(transaction_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND MONTH(transaction_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `,
      [decoded.id],
    )) as any[]

    const previousMonthIncome = previousMonthResult[0]?.income || 0
    const previousMonthExpenses = previousMonthResult[0]?.expenses || 0
    const previousMonthSavings = previousMonthIncome - previousMonthExpenses

    const stats = {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savings,
      previousMonthBalance: totalBalance, // Упрощение - в реальности нужно хранить исторические данные
      previousMonthIncome,
      previousMonthExpenses,
      previousMonthSavings,
    }

    console.log("Dashboard stats API: Returning stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Ошибка при получении статистики" }, { status: 500 })
  }
}
