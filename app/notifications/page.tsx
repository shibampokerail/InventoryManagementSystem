"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
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

// Sample notifications data
const notifications = [
  {
    id: "notif-1",
    title: "Low Stock Alert",
    message: "Tissues (INV003) are running low. Current quantity: 8",
    type: "alert",
    read: false,
    timestamp: "2023-04-05T14:30:00",
    actionUrl: "/inventory?id=INV003",
  },
  {
    id: "notif-2",
    title: "Item Checked Out",
    message: "Sarah Johnson checked out 5 Folding Tables for Student Government Meeting",
    type: "info",
    read: false,
    timestamp: "2023-04-05T12:15:00",
    actionUrl: "/checkout?id=CO-2023-042",
  },
  {
    id: "notif-3",
    title: "New User Registered",
    message: "Michael Chen (m.chen@truman.edu) has registered as a new user",
    type: "info",
    read: true,
    timestamp: "2023-04-04T09:15:00",
    actionUrl: "/users?id=user-2",
  },
  {
    id: "notif-4",
    title: "Item Returned",
    message: "Michael Chen returned 1 Projector from Career Fair event",
    type: "success",
    read: true,
    timestamp: "2023-04-04T16:30:00",
    actionUrl: "/checkout?id=CO-2023-041",
  },
  {
    id: "notif-5",
    title: "System Update",
    message: "The system will undergo maintenance on April 10, 2023 from 10:00 PM to 2:00 AM",
    type: "warning",
    read: false,
    timestamp: "2023-04-03T11:00:00",
    actionUrl: "/settings",
  },
  {
    id: "notif-6",
    title: "Report Generated",
    message: "Monthly inventory report for March 2023 has been generated",
    type: "success",
    read: true,
    timestamp: "2023-04-01T08:45:00",
    actionUrl: "/reports?id=RPT-2023-03",
  },
  {
    id: "notif-7",
    title: "New Feature Available",
    message: "Check out the new Slack bot integration for real-time notifications",
    type: "info",
    read: true,
    timestamp: "2023-03-28T14:20:00",
    actionUrl: "/slack-bots",
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Filter notifications based on active tab and search term
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return !notification.read && matchesSearch
    if (activeTab === "alerts") return notification.type === "alert" && matchesSearch
    if (activeTab === "info") return notification.type === "info" && matchesSearch

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

  const handleMarkAsRead = () => {
    // In a real app, this would update the backend
    console.log("Marking as read:", selectedNotifications)
    // Reset selection
    setSelectedNotifications([])
    setSelectAll(false)
  }

  const handleDeleteSelected = () => {
    // In a real app, this would update the backend
    console.log("Deleting:", selectedNotifications)
    // Reset selection
    setSelectedNotifications([])
    setSelectAll(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
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
            <Search />
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
              onClick={() => setSearchTerm("")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              onClick={() => (window.location.href = "/settings/notifications")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList className="bg-purple-100 dark:bg-purple-900">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                <Bell className="mr-2 h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                <Badge className="mr-2 bg-red-500">{unreadCount}</Badge>
                Unread
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                <Info className="mr-2 h-4 w-4" />
                Information
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs border-purple-200 dark:border-purple-800"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              >
                <Filter className="h-4 w-4" />
              </Button>
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
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                        notification.read ? "bg-white dark:bg-purple-950/70" : "bg-purple-50 dark:bg-purple-900/50"
                      } ${
                        selectedNotifications.includes(notification.id)
                          ? "border border-purple-500"
                          : "border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      }`}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                      />
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              notification.read
                                ? "text-purple-900 dark:text-purple-50"
                                : "text-purple-900 dark:text-purple-50 font-semibold"
                            }`}
                          >
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{notification.message}</p>
                        <div className="flex items-center pt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                            asChild
                          >
                            <a href={notification.actionUrl}>View Details</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-purple-100 dark:border-purple-800 pt-4">
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
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
                          <h4 className=" text-purple-900 dark:text-purple-50 font-semibold">
                            {notification.title}
                            <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{notification.message}</p>
                        <div className="flex items-center pt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                            asChild
                          >
                            <a href={notification.actionUrl}>View Details</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              {filteredNotifications.length > 0 && (
                <CardFooter className="flex justify-end border-t border-purple-100 dark:border-purple-800 pt-4">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Alert Notifications</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Important alerts that require your attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">No alerts found</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Everything is running smoothly!</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg ${
                        notification.read ? "bg-white dark:bg-purple-950/70" : "bg-purple-50 dark:bg-purple-900/50"
                      } border border-transparent hover:border-purple-200 dark:hover:border-purple-800`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              notification.read
                                ? "text-purple-900 dark:text-purple-50"
                                : "text-purple-900 dark:text-purple-50 font-semibold"
                            }`}
                          >
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{notification.message}</p>
                        <div className="flex items-center pt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                            asChild
                          >
                            <a href={notification.actionUrl}>View Details</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Information Notifications</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  General information and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Info className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50 mb-1">
                      No information notifications
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Check back later for updates!</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg ${
                        notification.read ? "bg-white dark:bg-purple-950/70" : "bg-purple-50 dark:bg-purple-900/50"
                      } border border-transparent hover:border-purple-200 dark:hover:border-purple-800`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Info className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-medium ${
                              notification.read
                                ? "text-purple-900 dark:text-purple-50"
                                : "text-purple-900 dark:text-purple-50 font-semibold"
                            }`}
                          >
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{notification.message}</p>
                        <div className="flex items-center pt-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                            asChild
                          >
                            <a href={notification.actionUrl}>View Details</a>
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
