"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Define types for our inventory items and activities
export type InventoryItem = {
  id: string
  name: string
  category: string
  quantity: number
  status: string
  location: string
  condition?: string
  value?: string
  lastCheckedOut?: string
}

export type ActivityItem = {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  action: string
  item: string
  quantity: number
  timestamp: string
}

type InventoryContextType = {
  inventoryItems: InventoryItem[]
  activities: ActivityItem[]
  addInventoryItem: (item: Omit<InventoryItem, "id" | "status">) => string
  checkoutItem: (itemId: string, quantity: number, eventName: string) => void
  returnItem: (itemId: string, quantity: number) => void
  updateItemCount: (itemId: string, quantity: number) => void
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Sample initial inventory data
const initialInventoryItems: InventoryItem[] = [
  {
    id: "INV001",
    name: "Folding Tables",
    category: "Furniture",
    quantity: 45,
    status: "In Stock",
    location: "Main Storage",
  },
  {
    id: "INV002",
    name: "Chairs",
    category: "Furniture",
    quantity: 120,
    status: "In Stock",
    location: "Main Storage",
  },
  {
    id: "INV003",
    name: "Tissues",
    category: "Supplies",
    quantity: 8,
    status: "Low Stock",
    location: "Supply Closet B",
  },
  {
    id: "INV004",
    name: "Tablecloths",
    category: "Linens",
    quantity: 32,
    status: "In Stock",
    location: "Linen Storage",
  },
  {
    id: "INV005",
    name: "Projectors",
    category: "Electronics",
    quantity: 5,
    status: "Partially Checked Out",
    location: "Tech Room",
  },
  {
    id: "INV006",
    name: "Microphones",
    category: "Electronics",
    quantity: 12,
    status: "In Stock",
    location: "Tech Room",
  },
  {
    id: "INV007",
    name: "Extension Cords",
    category: "Electronics",
    quantity: 18,
    status: "In Stock",
    location: "Supply Closet A",
  },
]

// Sample initial activity data
const initialActivities: ActivityItem[] = [
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

// Create the provider component
export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems)
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)

  // Function to add a new inventory item
  const addInventoryItem = (item: Omit<InventoryItem, "id" | "status">) => {
    // Generate a new ID
    const newId = `INV${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Determine status based on quantity
    const status = item.quantity < 10 ? "Low Stock" : "In Stock"

    // Create the new item
    const newItem: InventoryItem = {
      ...item,
      id: newId,
      status,
    }

    // Add to inventory
    setInventoryItems((prev) => [newItem, ...prev])

    // Add activity
    const newActivity: ActivityItem = {
      id: `act${Date.now()}`,
      user: {
        name: "Admin User", // Assuming current user
        email: "admin@truman.edu",
        avatar: "AD",
      },
      action: "added",
      item: item.name,
      quantity: item.quantity,
      timestamp: "Just now",
    }

    setActivities((prev) => [newActivity, ...prev])

    return newId
  }

  // Function to checkout an item
  const checkoutItem = (itemId: string, quantity: number, eventName: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity - quantity)
          let newStatus = "In Stock"
          if (newQuantity === 0) {
            newStatus = "Out of Stock"
          } else if (newQuantity < 10) {
            newStatus = "Low Stock"
          } else if (newQuantity < item.quantity) {
            newStatus = "Partially Checked Out"
          }

          return {
            ...item,
            quantity: newQuantity,
            status: newStatus,
            lastCheckedOut: new Date().toISOString().split("T")[0],
          }
        }
        return item
      }),
    )

    // Find the item name
    const itemName = inventoryItems.find((item) => item.id === itemId)?.name || "Unknown Item"

    // Add activity
    const newActivity: ActivityItem = {
      id: `act${Date.now()}`,
      user: {
        name: "Admin User", // Assuming current user
        email: "admin@truman.edu",
        avatar: "AD",
      },
      action: "checked out",
      item: itemName,
      quantity,
      timestamp: "Just now",
    }

    setActivities((prev) => [newActivity, ...prev])
  }

  // Function to return an item
  const returnItem = (itemId: string, quantity: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + quantity
          let newStatus = "In Stock"
          if (newQuantity < 10) {
            newStatus = "Low Stock"
          }

          return {
            ...item,
            quantity: newQuantity,
            status: newStatus,
          }
        }
        return item
      }),
    )

    // Find the item name
    const itemName = inventoryItems.find((item) => item.id === itemId)?.name || "Unknown Item"

    // Add activity
    const newActivity: ActivityItem = {
      id: `act${Date.now()}`,
      user: {
        name: "Admin User", // Assuming current user
        email: "admin@truman.edu",
        avatar: "AD",
      },
      action: "returned",
      item: itemName,
      quantity,
      timestamp: "Just now",
    }

    setActivities((prev) => [newActivity, ...prev])
  }

  // Function to update item count
  const updateItemCount = (itemId: string, quantity: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let newStatus = "In Stock"
          if (quantity === 0) {
            newStatus = "Out of Stock"
          } else if (quantity < 10) {
            newStatus = "Low Stock"
          }

          return {
            ...item,
            quantity,
            status: newStatus,
          }
        }
        return item
      }),
    )

    // Find the item name
    const itemName = inventoryItems.find((item) => item.id === itemId)?.name || "Unknown Item"

    // Add activity
    const newActivity: ActivityItem = {
      id: `act${Date.now()}`,
      user: {
        name: "Admin User", // Assuming current user
        email: "admin@truman.edu",
        avatar: "AD",
      },
      action: "updated count",
      item: itemName,
      quantity,
      timestamp: "Just now",
    }

    setActivities((prev) => [newActivity, ...prev])
  }

  return (
    <InventoryContext.Provider
      value={{
        inventoryItems,
        activities,
        addInventoryItem,
        checkoutItem,
        returnItem,
        updateItemCount,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

// Custom hook to use the inventory context
export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
