"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6">
      <Link href="/register">
        <Button variant="outline">Регистрация</Button>
      </Link>
      <Link href="/login">
        <Button variant="outline">Вход</Button>
      </Link>
    </nav>
  )
}
