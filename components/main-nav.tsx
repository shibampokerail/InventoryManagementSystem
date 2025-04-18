"use client"
import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6 relative w-full", className)} {...props}>
      <div className="flex items-center space-x-4 lg:space-x-6">
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

      <div className="ml-auto">
        <Link
          href="/notifications"
          className={cn(
            "flex items-center justify-center transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:scale-110",
            pathname === "/notifications" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
          )}
          aria-label="Notifications"
        >
          <Bell size={20} /> &nbsp; Notifications
        </Link>
      </div>

        <Link
          href="/slack-bots"
          className={cn(
            "text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 hover:underline hover:scale-110",
            pathname === "/slack-bots" ? "text-purple-900 dark:text-purple-50" : "text-purple-600 dark:text-purple-400",
          )}
        >
          Slack Bot
        </Link>
      </div>
      
      {/* Notification icon positioned on the right */}
      
    </nav>
  )
}