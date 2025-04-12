"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/context/inventory-context"
import { AlertTriangle, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LowStockItemsPage() {
  const { inventoryItems } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category)))]

  // Filter for low stock items (less than 20)
  const lowStockItems = inventoryItems.filter((item) => item.quantity < 20)

  // Apply search and category filters
  const filteredItems = lowStockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex min-h-screen flex-col bg-purple-50/50 dark:bg-purple-950/50">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Low Stock Items</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500 dark:text-purple-400" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-full bg-white pl-8 dark:bg-purple-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">Low Stock Inventory</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Items with less than 20 units available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50">
                    <TableHead className="w-[250px]">Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${
                            item.quantity < 10
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {item.quantity < 10 ? "Critical" : "Low Stock"}
                        </div>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
                <AlertTriangle className="h-8 w-8 text-purple-400" />
                <h3 className="text-xl font-medium text-purple-900 dark:text-purple-50">No low stock items</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {searchTerm || categoryFilter !== "all"
                    ? "No items match your search criteria."
                    : "All items are well-stocked."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
