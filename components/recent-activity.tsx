// components/recent-activity.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowDownIcon, ArrowUpIcon, RefreshCw } from "lucide-react";

interface CheckoutRecord {
  _id: string;
  status: string;
  created_at?: string;
  user_name?: string;
  user_id?: string;
  quantity?: number;
  item_name?: string;
  item_id?: string;
}

interface RecentActivityProps {
  checkoutHistory: CheckoutRecord[];
}

export function RecentActivity({ checkoutHistory }: RecentActivityProps) {
  // Map checkoutHistory (from database via Flask) to match the expected activity structure
  const activities = checkoutHistory.map((record) => {
    // Determine the action type based on the record
    const action =
      record.status === "returned"
        ? "returned"
        : record.status === "added"
        ? "added"
        : record.status === "updated"
        ? "updated count"
        : "checked out"; // Default to "checked out" for active checkouts

    // Format the timestamp (using created_at from the database)
    const timestamp = record.created_at
      ? new Date(record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A";

    // Mock user data (since the database might not store full user details directly)
    const user = {
      name: record.user_name || `User ${record.user_id || "Unknown"}`, // Use user_name if stored, else fallback
      avatar: record.user_id ? record.user_id.slice(0, 2).toUpperCase() : "UN", // Generate initials
    };

    return {
      id: record._id,
      user,
      action,
      quantity: record.quantity || 1,
      item: record.item_name || `Item ${record.item_id || "Unknown"}`, // Use item_name if stored, else fallback
      timestamp,
    };
  });

  // Show only the first 5 activities
  const displayActivities = activities.slice(0, 5);

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
  );
}