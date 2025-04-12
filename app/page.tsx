"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryTable } from "@/components/inventory-table"
import { RecentActivity } from "@/components/recent-activity"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { MainNav } from "@/components/main-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertTriangle, CheckCircle2, Package } from "lucide-react"
import { InventoryFullView } from "@/components/inventory-full-view"
import { CheckoutForm } from "@/components/checkout-form"
import { ReportsView } from "@/components/reports-view"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddItemForm } from "@/components/add-item-form"
import { useInventory, type CheckoutRecord } from "@/context/inventory-context"
import { useRouter } from "next/navigation"

export default function InventoryDashboard() {
  // Access inventory context to ensure it's available
  const { inventoryItems, checkoutHistory } = useInventory()
  const router = useRouter()

  // Count items for dashboard stats
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventoryItems.filter((item) => item.quantity < 20).length
  const checkedOutItems = inventoryItems.filter((item) => item.status.includes("Checked Out")).length

  // Count upcoming returns (due within 48 hours)
  const currentDate = new Date()
  const futureDate = new Date(currentDate)
  futureDate.setHours(currentDate.getHours() + 48)

  const upcomingReturns = checkoutHistory.filter((checkout: CheckoutRecord) => {
    if (checkout.status !== "Active") return false
    const returnDate = new Date(checkout.returnDate)
    return returnDate <= futureDate && returnDate >= currentDate
  }).length

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
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Inventory Dashboard <a href="/api/auth/logout">Logout</a></h2>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">Add New Inventory Item</DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Fill in the details to add a new item to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <AddItemForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-purple-100 dark:bg-purple-900">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="checkout" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Check Out
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/total-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Total Items
                  </CardTitle>
                  <Package className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{totalItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Across {inventoryItems.length} categories
                  </p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/low-stock-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Low Stock Items
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{lowStockItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Requires attention</p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/checked-out-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Items Checked Out
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-purple-700 dark:text-purple-300"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{checkedOutItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">For current events</p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/upcoming-returns")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Upcoming Returns
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{upcomingReturns}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Due within 48 hours</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-50">Current Inventory</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Overview of available items by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryTable />
                </CardContent>
              </Card>
              <Card className="col-span-3 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-50">Recent Activity</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Latest inventory transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Complete Inventory</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Manage and view all inventory items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryFullView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Check Out Items</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Request items for events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Inventory Reports</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Analytics and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
