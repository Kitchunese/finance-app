import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Токен не ��редоставлен" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Недействительный токен" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "6months"

    // Получаем общий баланс
    const totalBalance = (await query("SELECT SUM(current_balance) as total FROM accounts WHERE user_id = ?", [
      decoded.id,
    ])) as any[]

    // Получаем доходы и расходы за период
    const monthlyData = (await query(
      `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE user_id = ? 
        AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `,
      [decoded.id],
    )) as any[]

    // Получаем расходы по категориям
    const expensesByCategory = (await query(
      `
      SELECT 
        c.name,
        c.color,
        SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? 
        AND t.type = 'expense'
        AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
      LIMIT 10
    `,
      [decoded.id],
    )) as any[]

    return NextResponse.json({
      totalBalance: totalBalance[0]?.total || 0,
      monthlyData: monthlyData || [],
      expensesByCategory: expensesByCategory || [],
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Ошибка при получении аналитики" }, { status: 500 })
  }
}
