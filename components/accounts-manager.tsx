"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface Account {
  id: number
  name: string
  type: string
  currency: string
  initial_balance: number
  current_balance: number
  created_at: string
}

interface AccountsManagerProps {
  onUpdate?: () => void
}

export function AccountsManager({ onUpdate }: AccountsManagerProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    currency: "RUB",
    initialBalance: "",
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

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
      } else {
        toast.error("Ошибка при загрузке счетов")
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
      toast.error("Ошибка при загрузке счетов")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : "/api/accounts"
      const method = editingAccount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          currency: formData.currency,
          initialBalance: Number.parseFloat(formData.initialBalance),
        }),
      })

      if (response.ok) {
        toast.success(editingAccount ? "Счет обновлен" : "Счет создан")
        setIsDialogOpen(false)
        resetForm()
        fetchAccounts()
        onUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Ошибка при сохранении счета")
      }
    } catch (error) {
      console.error("Error saving account:", error)
      toast.error("Ошибка при сохранении счета")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      initialBalance: account.initial_balance.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (accountId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот счет?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Счет удален")
        fetchAccounts()
        onUpdate?.()
      } else {
        toast.error("Ошибка при удалении счета")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Ошибка при удалении счета")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "checking",
      currency: "RUB",
      initialBalance: "",
    })
    setEditingAccount(null)
  }

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      checking: "Расчетный",
      savings: "Сберегательный",
      credit: "Кредитный",
      investment: "Инвестиционный",
      cash: "Наличные",
    }
    return types[type] || type
  }

  if (loading && accounts.length === 0) {
    return <div className="text-center py-8">Загрузка счетов...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление счетами</h2>
          <p className="text-muted-foreground">Создавайте и управляйте своими финансовыми счетами</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить счет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Редактировать счет" : "Создать новый счет"}</DialogTitle>
              <DialogDescription>
                {editingAccount ? "Измените информацию о счете" : "Заполните данные для создания нового счета"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Название счета</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Основной счет"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Тип счета</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Расчетный</SelectItem>
                    <SelectItem value="savings">Сберегательный</SelectItem>
                    <SelectItem value="credit">Кредитный</SelectItem>
                    <SelectItem value="investment">Инвестиционный</SelectItem>
                    <SelectItem value="cash">Наличные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB (Рубль)</SelectItem>
                    <SelectItem value="USD">USD (Доллар)</SelectItem>
                    <SelectItem value="EUR">EUR (Евро)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="initialBalance">Начальный баланс</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Сохранение..." : editingAccount ? "Обновить" : "Создать"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {account.current_balance.toLocaleString()} {account.currency}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline">{getAccountTypeLabel(account.type)}</Badge>
                <span className="text-xs text-muted-foreground">
                  Создан: {new Date(account.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет счетов</h3>
            <p className="text-muted-foreground text-center mb-4">
              Создайте свой первый счет для начала управления финансами
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать счет
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
