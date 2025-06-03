"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface ForecastData {
  month: string
  доходы?: number
  расходы?: number
  сбережения?: number
  прогноз_доходов: number
  прогноз_расходов: number
  прогноз_сбережений: number
}

export function Forecast() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForecastData()
  }, [])

  const fetchForecastData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/forecast", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setForecastData(data.forecastData || [])
      } else {
        toast.error("Ошибка при загрузке прогноза")
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error)
      // Если API не реализовано, используем тестовые данные
      setForecastData([
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
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка прогноза...</div>
  }

  // Получаем последний месяц прогноза
  const lastMonth = forecastData[forecastData.length - 1]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="income">Доходы</TabsTrigger>
          <TabsTrigger value="expenses">Расходы</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Прогноз доходов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastMonth.прогноз_доходов.toLocaleString()} ₽</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.round(((lastMonth.прогноз_доходов - forecastData[0].доходы!) / forecastData[0].доходы!) * 100)}
                  % к {forecastData[0].month}
                </p>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <Line
                        type="monotone"
                        strokeWidth={2}
                        dataKey="прогноз_доходов"
                        activeDot={{
                          r: 6,
                          style: { fill: "var(--theme-primary)", opacity: 0.25 },
                        }}
                        style={{
                          stroke: "var(--theme-primary)",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Прогноз расходов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastMonth.прогноз_расходов.toLocaleString()} ₽</div>
                <p className="text-xs text-muted-foreground">
                  +
                  {Math.round(
                    ((lastMonth.прогноз_расходов - forecastData[0].расходы!) / forecastData[0].расходы!) * 100,
                  )}
                  % к {forecastData[0].month}
                </p>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <Line
                        type="monotone"
                        strokeWidth={2}
                        dataKey="прогноз_расходов"
                        activeDot={{
                          r: 6,
                          style: { fill: "#f43f5e", opacity: 0.25 },
                        }}
                        style={{
                          stroke: "#f43f5e",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Прогноз сбережений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastMonth.прогноз_сбережений.toLocaleString()} ₽</div>
                <p className="text-xs text-muted-foreground">
                  +
                  {Math.round(
                    ((lastMonth.прогноз_сбережений - forecastData[0].сбережения!) / forecastData[0].сбережения!) * 100,
                  )}
                  % к {forecastData[0].month}
                </p>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <Line
                        type="monotone"
                        strokeWidth={2}
                        dataKey="прогноз_сбережений"
                        activeDot={{
                          r: 6,
                          style: { fill: "#4ade80", opacity: 0.25 },
                        }}
                        style={{
                          stroke: "#4ade80",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Финансовый прогноз на 6 месяцев</CardTitle>
              <CardDescription>
                Прогноз основан на ваших текущих финансовых привычках и исторических данных
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecastData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip formatter={(value) => [`${value} ₽`, undefined]} labelFormatter={(label) => `${label}`} />
                  <Line
                    type="monotone"
                    dataKey="доходы"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="расходы"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="сбережения"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="прогноз_доходов"
                    stroke="#4ade80"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="прогноз_расходов"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="прогноз_сбережений"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Прогноз доходов</CardTitle>
              <CardDescription>Прогноз ваших доходов на ближайшие 6 месяцев</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecastData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip formatter={(value) => [`${value} ₽`, undefined]} labelFormatter={(label) => `${label}`} />
                  <Line
                    type="monotone"
                    dataKey="прогноз_доходов"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Прогноз расходов</CardTitle>
              <CardDescription>Прогноз ваших расходов на ближайшие 6 месяцев</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecastData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip formatter={(value) => [`${value} ₽`, undefined]} labelFormatter={(label) => `${label}`} />
                  <Line
                    type="monotone"
                    dataKey="прогноз_расходов"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Рекомендации по улучшению финансового положения</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-600 mt-1"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Сократите расходы на развлечения на 15% для увеличения сбережений</span>
          </li>
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-600 mt-1"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Увеличьте ежемесячные инвестиции для достижения финансовых целей</span>
          </li>
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-600 mt-1"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Оптимизируйте расходы на транспорт для экономии до 1000 ₽ в месяц</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
