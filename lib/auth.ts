import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  login: string
  is_admin: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      login: user.login,
      is_admin: user.is_admin,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function createUser(userData: {
  first_name: string
  last_name: string
  email: string
  login: string
  password: string
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)

  const result = (await query(
    "INSERT INTO users (first_name, last_name, email, login, password_hash) VALUES (?, ?, ?, ?, ?)",
    [userData.first_name, userData.last_name, userData.email, userData.login, hashedPassword],
  )) as any

  const user = (await query("SELECT id, first_name, last_name, email, login, is_admin FROM users WHERE id = ?", [
    result.insertId,
  ])) as User[]

  return user[0]
}

export async function authenticateUser(login: string, password: string): Promise<User | null> {
  const users = (await query("SELECT * FROM users WHERE login = ? OR email = ?", [login, login])) as any[]

  if (users.length === 0) return null

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) return null

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    login: user.login,
    is_admin: user.is_admin,
  }
}
