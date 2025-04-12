"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowDownIcon, ArrowUpIcon, RefreshCw } from "lucide-react"
import { useInventory } from "@/context/inventory-context"

export function RecentActivity() {
  const { activities } = useInventory()

  // Show only the first 5 activities
  const displayActivities = activities.slice(0, 5)

  return (
    <div className="space-y-8">
      {displayActivities.map((activity) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="h-9 w-9 border-2 border-purple-200 dark:border-purple-700">
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt={activity.user.name} />
            <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
              {activity.user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-50">{activity.user.name}</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {activity.action} {activity.quantity} {activity.item}
            </p>
          </div>
          <div className="ml-auto text-xs text-purple-600 dark:text-purple-400 flex items-center">
            {activity.action === "checked out" && <ArrowUpIcon className="h-3 w-3 mr-1 text-amber-500" />}
            {activity.action === "returned" && <ArrowDownIcon className="h-3 w-3 mr-1 text-green-500" />}
            {activity.action === "added" && <ArrowDownIcon className="h-3 w-3 mr-1 text-green-500" />}
            {activity.action === "updated count" && <RefreshCw className="h-3 w-3 mr-1 text-blue-500" />}
            {activity.timestamp}
          </div>
        </div>
      ))}
    </div>
  )
}
