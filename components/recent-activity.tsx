"use client";

import { useState, useEffect } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, RefreshCw } from "lucide-react";
import { Span } from "next/dist/trace";

interface UsageRecord {
  _id: string;
  itemId: string;
  userId: string;
  quantity: number;
  action: string;
  timestamp: string;
}

interface InventoryItem {
  _id: string;
  name: string;
}

interface User {
  name: string;
}

interface Activity {
  id: string;
  user: { name: string; avatar: string };
  action: string;
  quantity: number;
  item: string;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all inventory usage records
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backendapi/inventory-usage`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch usage records: ${response.statusText}`);
        }

        const usageRecords: UsageRecord[] = await response.json();

        // Filter out daily-usages
        const filteredRecords = usageRecords.filter(
          (record) => record.action !== "daily-usages"
        );

        // Fetch item names and user names for each record
        const activitiesPromises = filteredRecords.map(async (record) => {
          // Fetch item name
          let itemName = `Item ${record.itemId}`;
          try {
            const itemResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/backendapi/inventory-items/${record.itemId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (itemResponse.ok) {
              const item: InventoryItem = await itemResponse.json();
              itemName = item.name;
            }
          } catch (err) {
            console.warn(`Failed to fetch item ${record.itemId}:`, err);
          }

          // Fetch user name
          let userName = `User ${record.userId}`;
          try {
            const userResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/backendapi/users/${record.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (userResponse.ok) {
              const user: User = await userResponse.json();
              userName = user.name;
            }
          } catch (err) {
            console.warn(`Failed to fetch user ${record.userId}:`, err);
          }

          const userAvatar = userName.slice(0, 2).toUpperCase();

          // Map action to display text with reordered format for reported actions
          const actionMap: { [key: string]: string } = {
            reportedDamaged: "reported damaged",
            reportedStolen: "reported stolen",
            reportedLost: "reported lost",
            reportedCheckedOut: "checked out",
            reportedReturned: "returned",
          };
          const baseAction = actionMap[record.action] || record.action;

          // Reorder for reported actions: "reported <quantity> <action> item"
          let action = baseAction;
          if (["reported damaged", "reported stolen", "reported lost"].includes(baseAction)) {
            action = `reported ${record.quantity} ${baseAction.split(" ")[1]} ${itemName}`;
          } else {
            action = `${baseAction} ${record.quantity} ${itemName}`;
          }

          // Format timestamp
          const timestamp = record.timestamp
            ? new Date(record.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

          return {
            id: record._id,
            user: { name: userName, avatar: userAvatar },
            action,
            quantity: record.quantity || 1,
            item: itemName,
            timestamp,
          };
        });

        const resolvedActivities = await Promise.all(activitiesPromises);

        // Sort by timestamp (newest first)
        const sortedActivities = resolvedActivities.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setActivities(sortedActivities);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load recent activity.";
        setError(errorMessage);
        console.error("Error fetching usage records:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageRecords();
  }, []);

  if (isLoading) {
    return (
      <div className="text-purple-700 dark:text-purple-300">
        Loading recent activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-purple-700 dark:text-purple-300">
        No recent activity found.
      </div>
    );
  }

  return (
    <div className="space-y-10 mt-5 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
      {activities.slice().reverse().map((activity) => (
      <div className="flex items-center" key={activity.id}>
      <div className="ml-4 space-y-1">
      <p className="text-md font-medium text-purple-900 dark:text-purple-50">
        {activity.user.name} &nbsp;
        <span className="text-md font-medium text-purple-700 dark:text-purple-300">
      {activity.action}
      </span>
      </p>
  
      </div>
      <div className="ml-auto text-xs text-purple-600 dark:text-purple-400 flex items-center">
      {activity.action.includes("checked out") && (
        <ArrowDownIcon className="h-3 w-3 mr-1 text-amber-500" />
      )}
      {activity.action.includes("returned") && (
        <ArrowUpIcon className="h-3 w-3 mr-1 text-green-500" />
      )}
      {(activity.action.includes("reported damaged") ||
        activity.action.includes("reported stolen") ||
        activity.action.includes("reported lost")) && (
        <RefreshCw className="h-3 w-3 mr-1 text-red-500" />
      )}
      {activity.timestamp}
      </div>
      </div>
      ))}
    </div>
  );
}