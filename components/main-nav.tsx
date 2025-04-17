"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
          pathname === "/" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
          pathname === "/users" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
        )}
      >
         All Users
      </Link>
      <Link
        href="/slack-bots"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
          pathname === "/slack-bots" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
        )}
      >
        Slack Bots
      </Link>
      <Link
        href="/profile"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
          pathname === "/profile" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
        )}
      >
        Your Profile
      </Link>
      {/* <Link
        href="/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300",
          pathname === "/settings" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
        )}
      >
        Settings
      </Link> */}
      <Link
        href="/notifications"
        className={cn(
          "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
          pathname === "/notifications"
            ? "text-purple-900 dark:text-purple-50"
            : "text-purple-600 dark:text-purple-400",
        )}
      >
        Notifications
      </Link>
    </nav>
  )
}
