"use client"

import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Transaction {
  id: number
  amount: number
  transaction_date: string
  description: string
  category_name: string
  type: "income" | "expense"
  account_name: string
}

export function RecentTransactions({ showAll = false }: { showAll?: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      const limit = showAll ? 50 : 5
      const response = await fetch(`/api/transactions?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка транзакций...</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Транзакции не найдены</div>
  }

  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9 border">
            <div
              className={`flex h-full w-full items-center justify-center rounded-full ${
                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {transaction.type === "income" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.transaction_date).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <span className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : "-"}
              {transaction.amount.toLocaleString()} ₽
            </span>
            <Badge variant="outline">{transaction.category_name}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
