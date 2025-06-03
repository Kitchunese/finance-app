"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import styles from "./register.module.css"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    login: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { register, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      router.push("/dashboard")
    }
  }, [user, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await register(formData)
      if (success) {
        toast.success("Регистрация успешна!")
        router.push("/dashboard")
      } else {
        toast.error("Ошибка при регистрации")
      }
    } catch (error) {
      toast.error("Ошибка при регистрации")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Создайте аккаунт</CardTitle>
          <CardDescription>Введите свои данные для создания учетной записи</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Иван"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Иванов"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@mail.ru"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <Label htmlFor="password">Пароль</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <p className={styles.passwordHint}>Длина пароля должна составлять не менее 8 символов</p>
            </div>
            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
            <div className={styles.loginLink}>
              У вас уже есть учетная запись?{" "}
              <Link href="/login" className={styles.link}>
                Войти
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
