"use client"

import { useState, useEffect } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface MonthlyData {
  month: string
  доходы: number
  расходы: number
}

const chartConfig = {
  доходы: {
    label: "Доходы",
    color: "hsl(var(--chart-1))",
  },
  расходы: {
    label: "Расходы",
    color: "hsl(var(--chart-2))",
  },
}

export function Overview() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Токен не найден")
        setLoading(false)
        return
      }

      const response = await fetch("/api/analytics/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Overview data:", result)

      // Форматируем данные для графика
      const formattedData =
        result.monthlyData?.map((item: any) => ({
          month: formatMonth(item.month),
          доходы: Number(item.income) || 0,
          расходы: Number(item.expense) || 0,
        })) || []

      setData(formattedData)
    } catch (error) {
      console.error("Error fetching overview data:", error)
      setError("Ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return ""

    const [year, month] = monthStr.split("-")
    const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

    const monthIndex = Number.parseInt(month) - 1
    return `${monthNames[monthIndex]} ${year}`
  }

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка данных...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <div className="text-muted-foreground">Нет данных для отображения</div>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: any, name: string) => [`${Number(value).toLocaleString()} ₽`, name]}
          />
          <Bar dataKey="доходы" fill="var(--color-доходы)" radius={[4, 4, 0, 0]} name="Доходы" />
          <Bar dataKey="расходы" fill="var(--color-расходы)" radius={[4, 4, 0, 0]} name="Расходы" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
