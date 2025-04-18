"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, AlertTriangle, Calendar, AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  processMonthlyUsage,
  processWeeklyUsage,
  getMostPopularItems,
  getUnavailableItems,
  getLowStockItems,
  type InventoryItem,
  type UsageLog,
  type UsageData,
  type ItemPopularity,
  type UnavailableItem,
} from "@/lib/data-utils"

// API functions moved directly into the component file
async function fetchInventoryItems() {
  const token = localStorage.getItem("token")
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-items`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch inventory items:", error)
    return []
  }
}

async function fetchInventoryUsageLogs() {
  const token = localStorage.getItem("token")
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-usage`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch inventory usage logs:", error)
    return []
  }
}

export function ReportsView() {
  const [reportType, setReportType] = useState("usage")
  const [timeframe, setTimeframe] = useState("monthly")
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [popularItems, setPopularItems] = useState<ItemPopularity[]>([])
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [items, logs] = await Promise.all([fetchInventoryItems(), fetchInventoryUsageLogs()])
        console.log(items,logs)
        setInventoryItems(items)
        setUsageLogs(logs)

        // Process data
        const monthlyData = processMonthlyUsage(logs, items)
        const weeklyData = processWeeklyUsage(logs, items)
        const popular = getMostPopularItems(logs, items)
        const unavailable = getUnavailableItems(logs, items)
        const lowStock = getLowStockItems(items)

        setUsageData(timeframe === "monthly" ? monthlyData : weeklyData)
        setPopularItems(popular)
        setUnavailableItems(unavailable)
        setLowStockItems(lowStock)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load inventory data. Please try again later.")
        setLoading(false)
      }
    }

    // Only fetch data on the client side where localStorage is available
    if (typeof window !== "undefined") {
      fetchData()
    }
  }, [timeframe])

  // Update usage data when timeframe changes
  useEffect(() => {
    if (usageLogs.length > 0 && inventoryItems.length > 0) {
      setUsageData(
        timeframe === "monthly"
          ? processMonthlyUsage(usageLogs, inventoryItems)
          : processWeeklyUsage(usageLogs, inventoryItems),
      )
    }
  }, [timeframe, usageLogs, inventoryItems])

  // Calculate totals and stats
  const totalCheckouts = usageData.reduce((sum, item) => sum + item.checkouts, 0)
  const avgCheckouts = totalCheckouts / (usageData.length || 1)

  let busiestPeriod = { period: "N/A", checkouts: 0 }
  if (usageData.length > 0) {
    busiestPeriod = usageData.reduce((max, item) => (item.checkouts > max.checkouts ? item : max), usageData[0])
  }

  let mostPopularItem = { name: "N/A", checkouts: 0 }
  if (popularItems.length > 0) {
    mostPopularItem = popularItems[0]
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-purple-700">Loading report data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p>{error}</p>
          <Button
            className="mt-4 bg-purple-700 hover:bg-purple-800 text-white"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[240px] border-purple-200 dark:border-purple-800">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage">Usage & Popularity</SelectItem>
            <SelectItem value="alerts">Low Stock Alerts</SelectItem>
            <SelectItem value="unavailable">Unavailable Items</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-purple-700 hover:bg-purple-800 text-white">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {reportType === "usage" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-purple-900 dark:text-purple-50">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                    {timeframe === "monthly" ? "Monthly" : "Weekly"} Usage & Item Popularity
                  </div>
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Number of checkouts with most popular items
                </CardDescription>
              </div>

              <Tabs value={timeframe} onValueChange={setTimeframe} className="mt-2 sm:mt-0">
                <TabsList className="bg-purple-100 dark:bg-purple-900">
                  <TabsTrigger
                    value="monthly"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="weekly"
                    className="data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  >
                    Weekly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <XAxis dataKey="period" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f3e8ff",
                      borderColor: "#d8b4fe",
                      borderRadius: "6px",
                      color: "#6b21a8",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-md border border-purple-200 dark:border-purple-700 shadow-md">
                            <p className="font-bold text-purple-900 dark:text-purple-50 mb-1">
                              {payload[0].payload.period}
                            </p>
                            <p className="text-purple-700 dark:text-purple-300">Checkouts: {payload[0].value}</p>
                            <p className="text-purple-900 dark:text-purple-50 font-medium mt-2">
                              Most Popular: {payload[0].payload.popularItem}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="checkouts" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Checkouts" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Total Checkouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{totalCheckouts}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {timeframe === "monthly" ? "Past year" : "Past weeks"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Average Per {timeframe === "monthly" ? "Month" : "Week"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                    {avgCheckouts.toFixed(1)}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {timeframe === "monthly" ? "Past year" : "Past weeks"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Busiest {timeframe === "monthly" ? "Month" : "Week"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{busiestPeriod.period}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">{busiestPeriod.checkouts} checkouts</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Most Popular Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{mostPopularItem.name}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {mostPopularItem.checkouts} total checkouts
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-4">Top 5 Most Popular Items</h3>
              <Table>
                <TableHeader className="bg-purple-100 dark:bg-purple-900">
                  <TableRow>
                    <TableHead className="text-purple-900 dark:text-purple-50">Item</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Total Checkouts</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Average Duration</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Popularity Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">{item.checkouts}</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">{item.averageDuration}</TableCell>
                      <TableCell
                        className={
                          item.trend?.includes("↑")
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {item.trend}
                      </TableCell>
                    </TableRow>
                  ))}
                  {popularItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-purple-700 dark:text-purple-300">
                        No usage data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "alerts" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Items that need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-purple-100 dark:bg-purple-900">
                <TableRow>
                  <TableHead className="text-purple-900 dark:text-purple-50">Item ID</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Name</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Current Quantity</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Threshold</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => {
                  const isCritical = item.quantity < item.minQuantity * 0.5
                  return (
                    <TableRow key={item._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                        {item._id.substring(item._id.length - 8)}
                      </TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">{item.minQuantity}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isCritical
                              ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                          }
                        >
                          {isCritical ? "Critical" : "Warning"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {lowStockItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-purple-700 dark:text-purple-300">
                      No low stock items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Critical Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {lowStockItems.filter((item) => item.quantity < item.minQuantity * 0.5).length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Warning Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {lowStockItems.filter((item) => item.quantity >= item.minQuantity * 0.5).length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Should be restocked soon</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Estimated Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">$425</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">To restock all low items</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "unavailable" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Unavailable Items
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Items that are missing, damaged, stolen, or lost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-purple-100 dark:bg-purple-900">
                <TableRow>
                  <TableHead className="text-purple-900 dark:text-purple-50">Item Name</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Reason</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unavailableItems.map((item, index) => (
                  <TableRow key={index} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.reason === "Missing" ||
                          item.reason === "reportedStolen" ||
                          item.reason === "reportedLost"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                        }
                      >
                        {item.reason === "reportedStolen"
                          ? "Stolen"
                          : item.reason === "reportedLost"
                            ? "Lost"
                            : item.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">{item.date}</TableCell>
                  </TableRow>
                ))}
                {unavailableItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-purple-700 dark:text-purple-300">
                      No unavailable items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Missing Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {unavailableItems.filter((item) => item.reason === "Missing").length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Total:{" "}
                    {unavailableItems
                      .filter((item) => item.reason === "Missing")
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Damaged Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {unavailableItems.filter((item) => item.reason === "Damaged").length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Total:{" "}
                    {unavailableItems
                      .filter((item) => item.reason === "Damaged")
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Stolen Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {unavailableItems.filter((item) => item.reason === "reportedStolen").length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Total:{" "}
                    {unavailableItems
                      .filter((item) => item.reason === "reportedStolen")
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Lost Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {unavailableItems.filter((item) => item.reason === "reportedLost").length}
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Total:{" "}
                    {unavailableItems
                      .filter((item) => item.reason === "reportedLost")
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
