import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowDownIcon, ArrowUpIcon, RefreshCw } from "lucide-react"

const activities = [
  {
    id: "act1",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@truman.edu",
      avatar: "SJ",
    },
    action: "checked out",
    item: "Folding Tables",
    quantity: 5,
    timestamp: "2 hours ago",
  },
  {
    id: "act2",
    user: {
      name: "Michael Chen",
      email: "m.chen@truman.edu",
      avatar: "MC",
    },
    action: "returned",
    item: "Projector",
    quantity: 1,
    timestamp: "3 hours ago",
  },
  {
    id: "act3",
    user: {
      name: "Aisha Patel",
      email: "a.patel@truman.edu",
      avatar: "AP",
    },
    action: "added",
    item: "Tissues",
    quantity: 20,
    timestamp: "Yesterday",
  },
  {
    id: "act4",
    user: {
      name: "James Wilson",
      email: "j.wilson@truman.edu",
      avatar: "JW",
    },
    action: "checked out",
    item: "Microphones",
    quantity: 2,
    timestamp: "Yesterday",
  },
  {
    id: "act5",
    user: {
      name: "Emma Davis",
      email: "e.davis@truman.edu",
      avatar: "ED",
    },
    action: "updated count",
    item: "Chairs",
    quantity: 120,
    timestamp: "2 days ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
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

