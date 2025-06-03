"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  login: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Функция для получения токена из cookies
  const getTokenFromCookies = () => {
    if (typeof document === "undefined") return null

    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "token") {
        return value
      }
    }
    return null
  }

  // Загружаем данные пользователя при инициализации
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthProvider: Initializing auth...")
      try {
        let savedToken = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        // Если нет токена в localStorage, проверяем cookies
        if (!savedToken) {
          savedToken = getTokenFromCookies()
          console.log("AuthProvider: Token from cookies:", !!savedToken)
        }

        console.log("AuthProvider: Saved token exists:", !!savedToken)
        console.log("AuthProvider: Saved user exists:", !!savedUser)

        if (savedToken) {
          // Если есть токен, но нет пользователя, попробуем получить данные пользователя
          if (!savedUser) {
            console.log("AuthProvider: Token exists but no user data, fetching user info...")
            try {
              const response = await fetch("/api/auth/me", {
                headers: {
                  Authorization: `Bearer ${savedToken}`,
                },
              })

              if (response.ok) {
                const userData = await response.json()
                console.log("AuthProvider: User data fetched from API:", userData.login)
                setUser(userData)
                setToken(savedToken)

                // Сохраняем в localStorage
                localStorage.setItem("token", savedToken)
                localStorage.setItem("user", JSON.stringify(userData))

                // Обновляем cookie
                document.cookie = `token=${savedToken}; path=/; max-age=604800`
              } else {
                console.log("AuthProvider: Failed to fetch user data, clearing token")
                // Токен недействителен, очищаем
                localStorage.removeItem("token")
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
              }
            } catch (error) {
              console.error("AuthProvider: Error fetching user data:", error)
            }
          } else {
            // Есть и токен и пользователь
            const parsedUser = JSON.parse(savedUser)
            setToken(savedToken)
            setUser(parsedUser)
            console.log("AuthProvider: User loaded from localStorage:", parsedUser.login)

            // Обновляем cookie
            document.cookie = `token=${savedToken}; path=/; max-age=604800`
          }
        } else {
          console.log("AuthProvider: No saved auth data found")
        }
      } catch (error) {
        console.error("AuthProvider: Failed to parse user from localStorage:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      } finally {
        console.log("AuthProvider: Auth initialization complete")
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (loginField: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Attempting login for:", loginField)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginField, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("AuthProvider: Login successful for:", data.user.login)

        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Сохраняем токен в cookies для middleware
        document.cookie = `token=${data.token}; path=/; max-age=604800` // 7 дней

        return true
      } else {
        console.log("AuthProvider: Login failed with status:", response.status)
        return false
      }
    } catch (error) {
      console.error("AuthProvider: Login error:", error)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    console.log("AuthProvider: Attempting registration for:", userData.email)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("AuthProvider: Registration successful for:", data.user.login)

        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Сохраняем токен в cookies для middleware
        document.cookie = `token=${data.token}; path=/; max-age=604800` // 7 дней

        return true
      } else {
        console.log("AuthProvider: Registration failed with status:", response.status)
        return false
      }
    } catch (error) {
      console.error("AuthProvider: Registration error:", error)
      return false
    }
  }

  const logout = () => {
    console.log("AuthProvider: Logging out user")
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Удаляем токен из cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  console.log("AuthProvider: Current state - user:", !!user, "loading:", loading)

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
