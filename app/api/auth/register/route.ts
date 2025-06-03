import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, login, password } = await request.json()

    // Проверка существования пользователя
    const existingUsers = (await query("SELECT id FROM users WHERE email = ? OR login = ?", [email, login])) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким email или логином уже существует" }, { status: 400 })
    }

    // Создание пользователя
    const user = await createUser({
      first_name: firstName,
      last_name: lastName,
      email,
      login,
      password,
    })

    // Создание стандартного счета
    await query(
      "INSERT INTO accounts (user_id, name, type, currency, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, "Основной счет", "checking", "RUB", 0, 0],
    )

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Ошибка при регистрации" }, { status: 500 })
  }
}
