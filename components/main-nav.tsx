import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/"
        className="text-sm font-medium text-purple-900 transition-colors hover:text-purple-700 dark:text-purple-50 dark:hover:text-purple-300"
      >
        Dashboard
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-50"
      >
        Inventory
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-50"
      >
        Check Out
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-50"
      >
        Reports
      </Link>
      <Link
        href="/"
        className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-50"
      >
        Settings
      </Link>
    </nav>
  )
}

