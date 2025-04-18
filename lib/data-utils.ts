// Utility functions for processing inventory data

// Types for inventory data
export interface InventoryItem {
  _id: string
  name: string
  category: string
  quantity: number
  minQuantity: number
  status: string
  condition: string
  location: string
  unit: string
  description?: string
  updated_at?: string
}

export interface UsageLog {
  _id: string
  action: string
  itemId: string
  quantity: number
  timestamp: string
  userId: string
}

export interface UsageData {
  period: string
  checkouts: number
  popularItem: string
}

export interface ItemPopularity {
  name: string
  checkouts: number
  category: string
  averageDuration?: string
  trend?: string
}

export interface UnavailableItem {
  id: string
  name: string
  category: string
  quantity: number
  reason: string
  date: string
}

// Get month name from date
export function getMonthName(date: Date): string {
  return date.toLocaleString("default", { month: "short" })
}

// Get week range string from date
export function getWeekRange(date: Date): string {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`
}

// Process usage logs to get monthly data
export function processMonthlyUsage(usageLogs: UsageLog[], inventoryItems: InventoryItem[]): UsageData[] {
  console.log("processMonthlyUsage - Input:", {
    usageLogsCount: usageLogs.length,
    inventoryItemsCount: inventoryItems.length,
    sampleUsageLogs: usageLogs.slice(0, 3),
    actions: [...new Set(usageLogs.map((log) => log.action))],
  })

  // Create a map of item IDs to names for quick lookup
  const itemMap = new Map<string, string>()
  inventoryItems.forEach((item) => {
    itemMap.set(item._id, item.name)
  })

  // Filter logs to only include checkout and used actions
  const relevantLogs = usageLogs.filter((log) => log.action === "reportedCheckedOut" || log.action === "daily-usages")
  console.log("processMonthlyUsage - Filtered logs:", {
    relevantLogsCount: relevantLogs.length,
    sampleRelevantLogs: relevantLogs.slice(0, 3),
  })

  // Group logs by month
  const monthlyData = new Map<string, { checkouts: number; items: Map<string, number> }>()

  relevantLogs.forEach((log) => {
    const date = new Date(log.timestamp)
    const monthYear = `${date.getFullYear()}-${date.getMonth()}`
    const monthName = getMonthName(date)

    if (!monthlyData.has(monthName)) {
      monthlyData.set(monthName, {
        checkouts: 0,
        items: new Map<string, number>(),
      })
    }

    const monthData = monthlyData.get(monthName)!
    monthData.checkouts += log.quantity

    const itemName = itemMap.get(log.itemId) || "Unknown Item"
    const currentCount = monthData.items.get(itemName) || 0
    monthData.items.set(itemName, currentCount + log.quantity)
  })

  // Convert to array and find most popular item for each month
  return Array.from(monthlyData.entries())
    .map(([month, data]) => {
      let popularItem = "None"
      let maxCount = 0

      data.items.forEach((count, item) => {
        if (count > maxCount) {
          maxCount = count
          popularItem = item
        }
      })

      return {
        period: month,
        checkouts: data.checkouts,
        popularItem,
      }
    })
    .sort((a, b) => {
      // Sort by month (assuming standard 3-letter abbreviations)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(a.period) - months.indexOf(b.period)
    })
}

// Process usage logs to get weekly data
export function processWeeklyUsage(usageLogs: UsageLog[], inventoryItems: InventoryItem[]): UsageData[] {
  console.log("processWeeklyUsage - Input:", {
    usageLogsCount: usageLogs.length,
    inventoryItemsCount: inventoryItems.length,
    sampleUsageLogs: usageLogs.slice(0, 3),
    actions: [...new Set(usageLogs.map((log) => log.action))],
  })

  // Create a map of item IDs to names for quick lookup
  const itemMap = new Map<string, string>()
  inventoryItems.forEach((item) => {
    itemMap.set(item._id, item.name)
  })

  // Filter logs to only include checkout and used actions
  const relevantLogs = usageLogs.filter((log) => log.action === "reportedCheckedOut" || log.action === "daily-usages")
  console.log("processWeeklyUsage - Filtered logs:", {
    relevantLogsCount: relevantLogs.length,
    sampleRelevantLogs: relevantLogs.slice(0, 3),
  })

  // Group logs by week
  const weeklyData = new Map<string, { checkouts: number; items: Map<string, number> }>()

  relevantLogs.forEach((log) => {
    const date = new Date(log.timestamp)
    const weekRange = getWeekRange(date)

    if (!weeklyData.has(weekRange)) {
      weeklyData.set(weekRange, {
        checkouts: 0,
        items: new Map<string, number>(),
      })
    }

    const weekData = weeklyData.get(weekRange)!
    weekData.checkouts += log.quantity

    const itemName = itemMap.get(log.itemId) || "Unknown Item"
    const currentCount = weekData.items.get(itemName) || 0
    weekData.items.set(itemName, currentCount + log.quantity)
  })

  // Convert to array and find most popular item for each week
  return Array.from(weeklyData.entries())
    .map(([week, data]) => {
      let popularItem = "None"
      let maxCount = 0

      data.items.forEach((count, item) => {
        if (count > maxCount) {
          maxCount = count
          popularItem = item
        }
      })

      return {
        period: week,
        checkouts: data.checkouts,
        popularItem,
      }
    })
    .sort((a, b) => {
      // Sort by week (assuming format DD/MM - DD/MM)
      const aStart = Number.parseInt(a.period.split("/")[0])
      const bStart = Number.parseInt(b.period.split("/")[0])
      return aStart - bStart
    })
}

// Get most popular items overall
export function getMostPopularItems(usageLogs: UsageLog[], inventoryItems: InventoryItem[]): ItemPopularity[] {
  console.log("getMostPopularItems - Input:", {
    usageLogsCount: usageLogs.length,
    inventoryItemsCount: inventoryItems.length,
    sampleUsageLogs: usageLogs.slice(0, 3),
    actions: [...new Set(usageLogs.map((log) => log.action))],
  })

  // Create maps for quick lookups
  const itemMap = new Map<string, InventoryItem>()
  inventoryItems.forEach((item) => {
    itemMap.set(item._id, item)
  })

  // Filter logs to only include checkout and used actions
  const relevantLogs = usageLogs.filter((log) => log.action === "reportedCheckedOut" || log.action === "daily-usages")
  console.log("getMostPopularItems - Filtered logs:", {
    relevantLogsCount: relevantLogs.length,
    sampleRelevantLogs: relevantLogs.slice(0, 3),
  })

  // Count checkouts by item
  const itemCounts = new Map<string, number>()

  relevantLogs.forEach((log) => {
    const itemId = log.itemId
    const currentCount = itemCounts.get(itemId) || 0
    itemCounts.set(itemId, currentCount + log.quantity)
  })

  // Convert to array and sort by popularity
  return Array.from(itemCounts.entries())
    .map(([itemId, count]) => {
      const item = itemMap.get(itemId)
      return {
        name: item ? item.name : "Unknown Item",
        category: item ? item.category : "Unknown",
        checkouts: count,
        trend: Math.random() > 0.3 ? `↑ ${Math.floor(Math.random() * 15)}%` : `↓ ${Math.floor(Math.random() * 10)}%`, // Placeholder
      }
    })
    .sort((a, b) => b.checkouts - a.checkouts)
    .slice(0, 5) // Top 5 items
}

// Get unavailable items (missing or damaged)
export function getUnavailableItems(usageLogs: UsageLog[], inventoryItems: InventoryItem[]): UnavailableItem[] {
  console.log("getUnavailableItems - Input:", {
    usageLogsCount: usageLogs.length,
    inventoryItemsCount: inventoryItems.length,
    sampleUsageLogs: usageLogs.slice(0, 3),
    actions: [...new Set(usageLogs.map((log) => log.action))],
  })

  // Create maps for quick lookups
  const itemMap = new Map<string, InventoryItem>()
  inventoryItems.forEach((item) => {
    itemMap.set(item._id, item)
  })

  // Filter logs to include missing, damaged, stolen, or lost actions
  const unavailableLogs = usageLogs.filter(
    (log) =>
      log.action === "missing" ||
      log.action === "damaged" ||
      log.action === "reportedStolen" ||
      log.action === "reportedLost"||
      log.action === "reportedDamaged"
  )

  
  console.log("getUnavailableItems - Filtered logs:", {
    unavailableLogsCount: unavailableLogs.length,
    sampleUnavailableLogs: unavailableLogs.slice(0, 3),
  })

  // Convert to array of unavailable items
  return unavailableLogs.map((log) => {
    const item = itemMap.get(log.itemId)
    return {
      id: log.itemId,
      name: item ? item.name : "Unknown Item",
      category: item ? item.category : "Unknown",
      quantity: log.quantity,
      reason: log.action,
      date: new Date(log.timestamp).toLocaleDateString(),
    }
  })
}

// Get low stock items
export function getLowStockItems(inventoryItems: InventoryItem[]): InventoryItem[] {
  console.log("getLowStockItems - Input:", {
    inventoryItemsCount: inventoryItems.length,
    sampleItems: inventoryItems.slice(0, 3),
  })

  const lowStock = inventoryItems.filter((item) => item.quantity <= item.minQuantity)
  console.log("getLowStockItems - Filtered items:", {
    lowStockCount: lowStock.length,
    sampleLowStock: lowStock.slice(0, 3),
  })

  return lowStock.sort((a, b) => {
    // Sort by criticality (how far below threshold)
    const aRatio = a.quantity / a.minQuantity
    const bRatio = b.quantity / b.minQuantity
    return aRatio - bRatio
  })
}

export function getItemsByPeriod(
  usageLogs: UsageLog[],
  inventoryItems: InventoryItem[],
  period: string,
  timeframe: string,
): ItemPopularity[] {
  console.log(`Getting items for period: ${period}, timeframe: ${timeframe}`)

  // Create maps for quick lookups
  const itemMap = new Map<string, InventoryItem>()
  inventoryItems.forEach((item) => {
    itemMap.set(item._id, item)
  })

  // Filter logs to only include checkout and used actions
  const relevantLogs = usageLogs.filter((log) => log.action === "reportedCheckedOut" || log.action === "daily-usages")

  // Filter logs by period
  const filteredLogs = relevantLogs.filter((log) => {
    const date = new Date(log.timestamp)

    if (timeframe === "monthly") {
      // For monthly view, check if month matches
      return getMonthName(date) === period
    } else {
      // For weekly view, check if week range matches
      return getWeekRange(date) === period
    }
  })

  console.log(`Found ${filteredLogs.length} logs for period ${period}`)

  // Count checkouts by item
  const itemCounts = new Map<string, number>()
  filteredLogs.forEach((log) => {
    const itemId = log.itemId
    const currentCount = itemCounts.get(itemId) || 0
    itemCounts.set(itemId, currentCount + log.quantity)
  })

  // Convert to array and sort by popularity
  return Array.from(itemCounts.entries())
    .map(([itemId, count]) => {
      const item = itemMap.get(itemId)
      return {
        name: item ? item.name : "Unknown Item",
        category: item ? item.category : "Unknown",
        checkouts: count,
        averageDuration: "2.1 days", // Placeholder - would need more data to calculate
        trend: Math.random() > 0.3 ? `↑ ${Math.floor(Math.random() * 15)}%` : `↓ ${Math.floor(Math.random() * 10)}%`, // Placeholder
      }
    })
    .sort((a, b) => b.checkouts - a.checkouts)
}