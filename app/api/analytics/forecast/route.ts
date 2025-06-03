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

    // Получаем исторические данные за последние 3 месяца
    const historicalData = (await query(
      `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE user_id = ? 
        AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `,
      [decoded.id],
    )) as any[]

    // Преобразуем данные для прогноза
    const forecastData = []

    // Добавляем исторические данные
    for (const item of historicalData) {
      const monthName = new Date(item.month + "-01").toLocaleString("ru-RU", { month: "short" })
      const income = Number(item.income)
      const expense = Number(item.expense)
      const savings = income - expense

      forecastData.push({
        month: monthName,
        доходы: income,
        расходы: expense,
        сбережения: savings,
        прогноз_доходов: income,
        прогноз_расходов: expense,
        прогноз_сбережений: savings,
      })
    }

    // Если у нас есть исторические данные, создаем прогноз на следующие 3 месяца
    if (historicalData.length > 0) {
      // Простой прогноз на основе среднего роста
      const lastMonth = historicalData[historicalData.length - 1]
      const lastIncome = Number(lastMonth.income)
      const lastExpense = Number(lastMonth.expense)
      const lastSavings = lastIncome - lastExpense

      // Средний рост дох����дов и расходов (упрощенно)
      const incomeGrowthRate = 1.05 // 5% рост
      const expenseGrowthRate = 1.03 // 3% рост

      // Генерируем прогноз на следующие 3 месяца
      for (let i = 1; i <= 3; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() + i)
        const monthName = date.toLocaleString("ru-RU", { month: "short" })

        const projectedIncome = Math.round(lastIncome * Math.pow(incomeGrowthRate, i))
        const projectedExpense = Math.round(lastExpense * Math.pow(expenseGrowthRate, i))
        const projectedSavings = projectedIncome - projectedExpense

        forecastData.push({
          month: monthName,
          прогноз_доходов: projectedIncome,
          прогноз_расходов: projectedExpense,
          прогноз_сбережений: projectedSavings,
        })
      }
    } else {
      // Если нет исторических данных, возвращаем тестовые данные
      return NextResponse.json({
        forecastData: [
          {
            month: "Авг",
            доходы: 46000,
            расходы: 33000,
            сбережения: 13000,
            прогноз_доходов: 46000,
            прогноз_расходов: 33000,
            прогноз_сбережений: 13000,
          },
          {
            month: "Сен",
            доходы: 47000,
            расходы: 34000,
            сбережения: 13000,
            прогноз_доходов: 47500,
            прогноз_расходов: 34500,
            прогноз_сбережений: 13000,
          },
          {
            month: "Окт",
            доходы: 48000,
            расходы: 35000,
            сбережения: 13000,
            прогноз_доходов: 49000,
            прогноз_расходов: 35500,
            прогноз_сбережений: 13500,
          },
          {
            month: "Ноя",
            прогноз_доходов: 50500,
            прогноз_расходов: 36000,
            прогноз_сбережений: 14500,
          },
          {
            month: "Дек",
            прогноз_доходов: 55000,
            прогноз_расходов: 38000,
            прогноз_сбережений: 17000,
          },
          {
            month: "Янв",
            прогноз_доходов: 52000,
            прогноз_расходов: 37000,
            прогноз_сбережений: 15000,
          },
        ],
      })
    }

    return NextResponse.json({ forecastData })
  } catch (error) {
    console.error("Get forecast error:", error)
    return NextResponse.json({ error: "Ошибка при получении прогноза" }, { status: 500 })
  }
}
