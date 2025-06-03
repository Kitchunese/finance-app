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
import { Plus, Edit, Trash2, Palette } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  type: "income" | "expense"
  icon: string
  color: string
  is_system: boolean
  user_id: number | null
}

const ICON_OPTIONS = [
  "circle",
  "briefcase",
  "laptop",
  "trending-up",
  "gift",
  "plus-circle",
  "shopping-cart",
  "car",
  "gamepad-2",
  "home",
  "heart",
  "book",
  "shirt",
  "utensils",
  "plane",
  "minus-circle",
]

const COLOR_OPTIONS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
]

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "circle",
    color: "#6b7280",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

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
      } else {
        toast.error("Ошибка при загрузке категорий")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Ошибка при загрузке категорий")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingCategory ? "Категория обновлена" : "Категория создана")
        setIsDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || "Ошибка при сохранении категории")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Ошибка при сохранении категории")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    if (category.is_system) {
      toast.error("Системные категории нельзя редактировать")
      return
    }
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category?.is_system) {
      toast.error("Системные категории нельзя удалить")
      return
    }

    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Категория удалена")
        fetchCategories()
      } else {
        toast.error("Ошибка при удалении категории")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Ошибка при удалении категории")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      icon: "circle",
      color: "#6b7280",
    })
    setEditingCategory(null)
  }

  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  if (loading) {
    return <div className="text-center py-8">Загрузка категорий...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление категориями</h2>
          <p className="text-muted-foreground">Создавайте и управляйте категориями доходов и расходов</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Редактировать категорию" : "Создать новую категорию"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Измените информацию о категории" : "Заполните данные для создания новой категории"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Название категории</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название категории"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Тип категории</Label>
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
                <Label htmlFor="icon">Иконка</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Цвет</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-gray-800" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Сохранение..." : editingCategory ? "Обновить" : "Создать"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Категории доходов</CardTitle>
            <CardDescription>Категории для учета ваших доходов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.is_system && <Badge variant="secondary">Системная</Badge>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!category.is_system && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Категории расходов</CardTitle>
            <CardDescription>Категории для учета ваших расходов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.is_system && <Badge variant="secondary">Системная</Badge>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!category.is_system && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
