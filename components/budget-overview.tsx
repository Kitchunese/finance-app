"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Budget {
  id: number
  category_id: number
  amount: number
  period: string
  start_date: string
  end_date: string
  category_name: string
  category_icon: string
  category_color: string
  spent: number
}

interface Category {
  id: number
  name: string
  type: string
  icon: string
  color: string
}

const formatCurrency = (amount: number) => {
  if (isNaN(amount) || amount === null || amount === undefined) return "0"
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function BudgetOverview() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    period: "month",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [])

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/budgets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      } else {
        toast.error("Ошибка при загрузке бюджетов")
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
      toast.error("Ошибка при загрузке бюджетов")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/categories?type=expense", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Фильтруем только категории расходов
        const expenseCategories = data.filter((cat: Category) => cat.type === "expense")
        setCategories(expenseCategories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : "/api/budgets"
      const method = editingBudget ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: Number.parseInt(formData.categoryId),
          amount: Number.parseFloat(formData.amount),
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (response.ok) {
        toast.success(editingBudget ? "Бюджет обновлен" : "Бюджет создан")
        setIsDialogOpen(false)
        resetForm()
        fetchBudgets()
      } else {
        const error = await response.json()
        toast.error(error.error || "Ошибка при сохранении бюджета")
      }
    } catch (error) {
      console.error("Error saving budget:", error)
      toast.error("Ошибка при сохранении бюджета")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      categoryId: budget.category_id.toString(),
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (budgetId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот бюджет?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Бюджет удален")
        fetchBudgets()
      } else {
        toast.error("Ошибка при удалении бюджета")
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast.error("Ошибка при удалении бюджета")
    }
  }

  const resetForm = () => {
    setFormData({
      categoryId: "",
      amount: "",
      period: "month",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
    })
    setEditingBudget(null)
  }

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, budget) => {
      const amount = Number(budget.amount) || 0
      return sum + amount
    }, 0)
  }

  const calculateTotalSpent = () => {
    return budgets.reduce((sum, budget) => {
      const spent = Number(budget.spent) || 0
      return sum + spent
    }, 0)
  }

  const calculatePercentage = (spent: number, allocated: number) => {
    if (!allocated || allocated === 0 || isNaN(allocated) || isNaN(spent)) return 0
    const percentage = (spent / allocated) * 100
    return Math.min(Math.round(percentage), 100)
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      week: "Неделя",
      month: "Месяц",
      year: "Год",
    }
    return labels[period] || period
  }

  if (loading && budgets.length === 0) {
    return <div className="text-center py-8">Загрузка бюджетов...</div>
  }

  const totalBudget = calculateTotalBudget()
  const totalSpent = calculateTotalSpent()
  const totalRemaining = totalBudget - totalSpent
  const totalPercentage = calculatePercentage(totalSpent, totalBudget)
  const displayPercentage = isNaN(totalPercentage) ? 0 : totalPercentage

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление бюджетом</h2>
          <p className="text-muted-foreground">Создавайте и отслеживайте бюджеты по категориям</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить бюджет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Редактировать бюджет" : "Создать новый бюджет"}</DialogTitle>
              <DialogDescription>
                {editingBudget ? "Измените информацию о бюджете" : "Заполните данные для создания нового бюджета"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Категория</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Сумма бюджета</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="period">Период</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Сохранение..." : editingBudget ? "Обновить" : "Создать"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Общий бюджет</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Общий прогресс</span>
                <span className="text-sm">
                  {formatCurrency(totalSpent)} ₽ / {formatCurrency(totalBudget)} ₽
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={displayPercentage} className="h-2" />
                <span className="text-xs w-12 text-right">{displayPercentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Бюджет</p>
                <p className="text-xl font-bold">{formatCurrency(totalBudget)} ₽</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Потрачено</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalSpent)} ₽</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Осталось</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalRemaining)} ₽</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Бюджеты по категориям</h3>

        {budgets.length === 0 && !loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет бюджетов</h3>
              <p className="text-muted-foreground text-center mb-4">
                Создайте свой первый бюджет для начала контроля расходов
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Создать бюджет
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.category_color || "#6b7280" }}
                    ></div>
                    <h4 className="font-medium">{budget.category_name}</h4>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {getPeriodLabel(budget.period)}: {new Date(budget.start_date).toLocaleDateString("ru-RU")} -{" "}
                      {new Date(budget.end_date).toLocaleDateString("ru-RU")}
                    </span>
                    <span>
                      {formatCurrency(budget.spent)} ₽ / {formatCurrency(budget.amount)} ₽
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={calculatePercentage(budget.spent, budget.amount)}
                      className="h-2"
                      style={{ backgroundColor: `${budget.category_color}40` }}
                    />
                    <span className="text-xs w-12 text-right">{calculatePercentage(budget.spent, budget.amount)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
