"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import {
  Package,
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  Settings,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useWebSocket } from "@/context/WebSocketContext"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  timestamp: string
  actionUrl: string
}

const fetchWithAuth = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or revoked token")
    }
    throw new Error(`Failed to fetch data ${endpoint}: ${response.statusText}`)
  }

  return response.json()
}

const mapNotification = (dbNotification: any): Notification => {
  const typeMap: { [key: string]: string } = {
    lowStock: "alert",
  }
  const titleMap: { [key: string]: string } = {
    lowStock: "Low Stock Alert",
  }
  const actionUrlMap: { [key: string]: string } = {
    lowStock: "/inventory",
  }

  return {
    id: dbNotification._id,
    title: titleMap[dbNotification.type] || dbNotification.type.charAt(0).toUpperCase() + dbNotification.type.slice(1),
    message: dbNotification.message,
    type: typeMap[dbNotification.type] || "info",
    read: dbNotification.read || false,
    timestamp: dbNotification.timestamp,
    actionUrl: actionUrlMap[dbNotification.type] || "/notifications",
  }
}

const mapOrderToNotification = (order: any): Notification => {
  const title = order.status === "placed" ? "Order Placed" : "Order Received"
  const type = order.status === "placed" ? "orderPlaced" : "orderReceived"
  const message = `${title} for ${order.quantity} ${order.itemName} from ${order.vendorName}.`

  return {
    id: order._id,
    title,
    message,
    type,
    read: true,
    timestamp: order.orderDate,
    actionUrl: `/orders/${order._id}`,
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { socket, error: socketError } = useWebSocket()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [orders, setOrders] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const jwtToken = localStorage.getItem("token")
    if (!jwtToken) {
      router.push("/api/auth/login")
      return
    }
    setToken(jwtToken)
  }, [router])

  const fetchNotifications = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      const data = await fetchWithAuth("/notifications", token)
      const mappedNotifications = data.map(mapNotification)
      setNotifications(mappedNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        router.push("/api/auth/login")
      }
    }
  }

  const fetchOrders = async () => {
    if (!token) return

    try {
      const data = await fetchWithAuth("/orders", token)
      const mappedOrders = data.map(mapOrderToNotification)
      setOrders(mappedOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders")
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        router.push("/api/auth/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchNotifications()
      fetchOrders()
    }
  }, [token])

  useEffect(() => {
    if (!socket) return

    socket.on("notification_created", (newNotification: any) => {
      const mappedNotification = mapNotification(newNotification)
      setNotifications((prev) => [mappedNotification, ...prev])
    })

    return () => {
      socket.off("notification_created")
    }
  }, [socket])

  const handleMarkAsReceived = async (orderId: string) => {
    if (!token) return

    try {
      await fetchWithAuth(`/orders/${orderId}`, token, {
        method: "PUT",
        body: JSON.stringify({ status: "received" }),
      })
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, type: "orderReceived", title: "Order Received" }
            : order
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark order as received")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!token) return

    try {
      await fetchWithAuth(`/orders/${orderId}`, token, {
        method: "DELETE",
      })
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order")
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return !notification.read && matchesSearch
    return matchesSearch
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.message.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "placedOrders") return order.type === "orderPlaced" && matchesSearch
    if (activeTab === "receivedOrders") return order.type === "orderReceived" && matchesSearch
    return matchesSearch
  })

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    } else {
      setSelectedNotifications([])
    }
  }

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, id])
    } else {
      setSelectedNotifications(selectedNotifications.filter((notifId) => notifId !== id))
    }
  }

  const handleMarkAsRead = async () => {
    if (!token || selectedNotifications.length === 0) return

    try {
      await fetchWithAuth("/notifications/mark-read", token, {
        method: "PUT",
        body: JSON.stringify({ ids: selectedNotifications }),
      })
      setNotifications((prev) =>
        prev.map((n) =>
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        )
      )
      setSelectedNotifications([])
      setSelectAll(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notifications as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!token || unreadCount === 0) return

    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      await fetchWithAuth("/notifications/mark-read", token, {
        method: "PUT",
        body: JSON.stringify({ ids: unreadIds }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setSelectedNotifications([])
      setSelectAll(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read")
    }
  }

  const handleDeleteSelected = async () => {
    if (!token || selectedNotifications.length === 0) return

    try {
      await fetchWithAuth("/notifications", token, {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedNotifications }),
      })
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n.id))
      )
      setSelectedNotifications([])
      setSelectAll(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notifications")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "orderPlaced":
        return <Package className="h-5 w-5 text-purple-500" />
      case "orderReceived":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-purple-900 dark:text-purple-50">Loading...</p>
      </div>
    )
  }

  if (error || socketError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-red-500">{error || socketError}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-purple-50 dark:bg-purple-950">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-lg text-purple-900 dark:text-purple-50">U&I Services</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Notifications</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              onClick={() => {
                fetchNotifications()
                fetchOrders()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList className="bg-purple-100 dark:bg-purple-900">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
                <Bell className="mr-2 h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
                <Badge className="mr-2 bg-red-500">{unreadCount}</Badge>
                Inventory Alerts
              </TabsTrigger>
              <TabsTrigger value="placedOrders" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
                <Package className="mr-2 h-4 w-4" />
                Placed Orders
              </TabsTrigger>
              <TabsTrigger value="receivedOrders" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Received Orders
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs border-purple-200 dark:border-purple-800"
              />
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900 dark:text-purple-50">All Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium text-purple-900 dark:text-purple-50 cursor-pointer"
                      >
                        Select All
                      </label>
                    </div>
                    {selectedNotifications.length > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                          onClick={handleMarkAsRead}
                        >
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                          onClick={handleDeleteSelected}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">
                      No notifications found
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {searchTerm ? "Try a different search term" : "You're all caught up!"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                        item.read ? "bg-white dark:bg-purple-950/70" : "bg-purple-50 dark:bg-purple-900/50"
                      } ${
                        selectedNotifications.includes(item.id)
                          ? "border border-purple-500"
                          : "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      }`}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectNotification(item.id, checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                      />
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(item.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              item.read
                                ? "text-purple-900 dark:text-purple-50"
                                : "text-purple-900 dark:text-purple-50 font-semibold"
                            }`}
                          >
                            {item.title}
                            {!item.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-purple-100 dark:border-purple-800 pt-4">
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Showing {filteredNotifications.length} of {notifications.length} items
                </div>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  View All
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Unread Notifications</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  You have {unreadCount} unread notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCheck className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">
                      No unread notifications
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">You're all caught up!</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/50 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-purple-900 dark:text-purple-50 font-semibold">
                            {notification.title}
                            <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{notification.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              {filteredNotifications.length > 0 && (
                <CardFooter className="flex justify-end border-t border-purple-100 dark:border-purple-800 pt-4">
                  <Button
                    className="bg-purple-700 hover:bg-purple-800 text-white"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="placedOrders" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Placed Orders</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Notifications for orders recently placed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">No placed orders</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">No recent order placements!</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-purple-950/70 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Package className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-purple-900 dark:text-purple-50 font-medium">
                            {order.title}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{order.message}</p>
                        <div className="flex items-center space-x-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                            onClick={() => handleMarkAsReceived(order.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Received
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receivedOrders" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Received Orders</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Notifications for orders recently received
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">No received orders</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">No recent order receipts!</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-purple-950/70 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-purple-900 dark:text-purple-50 font-medium">
                            {order.title}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{order.message}</p>
                        <div className="flex items-center space-x-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}