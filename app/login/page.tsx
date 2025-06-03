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
import styles from "./login.module.css"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      router.replace("/dashboard")
    }
  }, [user, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await login(formData.login, formData.password)

      if (success) {
        toast.success("Вход выполнен успешно!")
        router.replace("/dashboard")
      } else {
        toast.error("Неверный логин или пароль")
      }
    } catch (error) {
      toast.error("Ошибка при входе")
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
          <CardTitle className={styles.cardTitle}>Авторизация</CardTitle>
          <CardDescription>
            Введите свой адрес электронной почты и пароль для доступа к вашей учетной записи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <Label htmlFor="login">Email или логин</Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                placeholder="name@mail.ru"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <Label htmlFor="password">Пароль</Label>
                {/* <Link href="/forgot-password" className={styles.forgotPassword}>
                  Забыли пароль?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
            <div className={styles.registerLink}>
              У вас нет учетной записи?{" "}
              <Link href="/register" className={styles.link}>
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
