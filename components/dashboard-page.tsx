"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetOverview } from "@/components/budget-overview"
import { Forecast } from "@/components/forecast"
import { AccountsManager } from "@/components/accounts-manager"
import { TransactionsManager } from "@/components/transactions-manager"
import { CategoriesManager } from "@/components/categories-manager"
import { toast } from "sonner"

interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
  previousMonthBalance: number
  previousMonthIncome: number
  previousMonthExpenses: number
  previousMonthSavings: number
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    previousMonthBalance: 0,
    previousMonthIncome: 0,
    previousMonthExpenses: 0,
    previousMonthSavings: 0,
  })
  const [loading, setLoading] = useState(true)

  console.log("DashboardPage: Component rendering for user:", user?.login)

  useEffect(() => {
    console.log("DashboardPage: Fetching dashboard stats...")
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      console.log("DashboardPage: Making API call to /api/dashboard/stats")
      const token = localStorage.getItem("token")

      if (!token) {
        console.error("DashboardPage: No token found in localStorage")
        toast.error("Токен авторизации не найден")
        return
      }

      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("DashboardPage: API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("DashboardPage: Stats loaded successfully:", data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error("DashboardPage: API error:", response.status, errorText)
        toast.error("Ошибка при загрузке статистики")
      }
    } catch (error) {
      console.error("DashboardPage: Error fetching dashboard stats:", error)
      toast.error("Ошибка при загрузке статистики")
    } finally {
      console.log("DashboardPage: Stats loading complete")
      setLoading(false)
    }
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? "+" : ""
    return `${sign}${percentage.toFixed(1)}%`
  }

  const handleLogout = () => {
    console.log("DashboardPage: User logging out")
    logout()
    window.location.href = "/"
  }

  if (loading) {
    console.log("DashboardPage: Showing loading state")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  console.log("DashboardPage: Rendering full dashboard")

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Финансовый дашборд</h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBalance.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(calculatePercentageChange(stats.totalBalance, stats.previousMonthBalance))} с прошлого
                месяца
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Расходы</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyExpenses.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(calculatePercentageChange(stats.monthlyExpenses, stats.previousMonthExpenses))} с
                прошлого месяца
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доходы</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyIncome.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(calculatePercentageChange(stats.monthlyIncome, stats.previousMonthIncome))} с прошлого
                месяца
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Экономия</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savings.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(calculatePercentageChange(stats.savings, stats.previousMonthSavings))} с прошлого
                месяца
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="accounts">Счета</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="budget">Бюджет</TabsTrigger>
            <TabsTrigger value="forecast">Прогноз</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Обзор</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Последние транзакции</CardTitle>
                  <CardDescription>Ваши последние финансовые операции</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsManager onUpdate={fetchDashboardStats} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsManager onUpdate={fetchDashboardStats} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetOverview />
          </TabsContent>

          <TabsContent value="forecast">
            <Forecast />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
