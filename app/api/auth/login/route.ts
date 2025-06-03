import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json()

    const user = await authenticateUser(login, password)

    if (!user) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Ошибка при входе" }, { status: 500 })
  }
}
