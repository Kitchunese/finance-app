"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Filter, Download, Upload, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
  id: number
  account_id: number
  category_id: number
  type: "income" | "expense"
  amount: number
  description: string
  transaction_date: string
  account_name: string
  category_name: string
  category_icon: string
  category_color: string
  created_at: string
}

interface Account {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  type: "income" | "expense"
  icon: string
  color: string
}

interface TransactionsManagerProps {
  onUpdate?: () => void
}

export function TransactionsManager({ onUpdate }: TransactionsManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    startDate: "",
    endDate: "",
    type: "",
  })
  const [formData, setFormData] = useState({
    accountId: "",
    categoryId: "",
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    transactionDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (filters.accountId) params.append("accountId", filters.accountId)
      if (filters.categoryId) params.append("categoryId", filters.categoryId)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        toast.error("Ошибка при загрузке транзакций")
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Ошибка при загрузке транзакций")
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
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
      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : "/api/transactions"
      const method = editingTransaction ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: Number.parseInt(formData.accountId),
          categoryId: Number.parseInt(formData.categoryId),
          type: formData.type,
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
          transactionDate: formData.transactionDate,
        }),
      })

      if (response.ok) {
        toast.success(editingTransaction ? "Транзакция обновлена" : "Транзакция создана")
        setIsDialogOpen(false)
        resetForm()
        fetchTransactions()
        onUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Ошибка при сохранении транзакции")
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast.error("Ошибка при сохранении транзакции")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      accountId: transaction.account_id.toString(),
      categoryId: transaction.category_id.toString(),
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      transactionDate: transaction.transaction_date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (transactionId: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту транзакцию?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Транзакция удалена")
        fetchTransactions()
        onUpdate?.()
      } else {
        toast.error("Ошибка при удалении транзакции")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Ошибка при удалении транзакции")
    }
  }

  const resetForm = () => {
    setFormData({
      accountId: "",
      categoryId: "",
      type: "expense",
      amount: "",
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
    })
    setEditingTransaction(null)
  }

  const filteredCategories = categories.filter((cat) => cat.type === formData.type)

  if (loading && transactions.length === 0) {
    return <div className="text-center py-8">Загрузка транзакций...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление транзакциями</h2>
          <p className="text-muted-foreground">Отслеживайте свои доходы и расходы</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Импорт CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить транзакцию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "Редактировать транзакцию" : "Создать новую транзакцию"}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction
                    ? "Измените информацию о транзакции"
                    : "Заполните данные для создания новой транзакции"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Тип транзакции</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Доход</SelectItem>
                      <SelectItem value="expense">Расход</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountId">Счет</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите счет" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Сумма</Label>
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
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание транзакции"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionDate">Дата</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Сохранение..." : editingTransaction ? "Обновить" : "Создать"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Счет</Label>
              <Select value={filters.accountId} onValueChange={(value) => setFilters({ ...filters, accountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Все счета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все счета</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Категория</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Дата от</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Дата до</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ accountId: "", categoryId: "", startDate: "", endDate: "", type: "" })}
              >
                Сбросить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Транзакции</CardTitle>
          <CardDescription>Всего транзакций: {transactions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{transaction.account_name}</span>
                      <span>•</span>
                      <Badge variant="outline">{transaction.category_name}</Badge>
                      <span>•</span>
                      <span>{new Date(transaction.transaction_date).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {transaction.amount.toLocaleString()} ₽
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Транзакции не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
