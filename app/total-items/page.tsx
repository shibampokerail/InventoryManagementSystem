"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/context/inventory-context"
import { ArrowLeft, ArrowUpDown, Package, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function TotalItemsPage() {
  const { inventoryItems } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" }>({
    key: "name",
    direction: "ascending",
  })

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category)))]

  // Filter items by search term and category
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a]
    const bValue = b[sortConfig.key as keyof typeof b]

    // Handle undefined or null values
    if (aValue === undefined || aValue === null) return sortConfig.direction === "ascending" ? -1 : 1
    if (bValue === undefined || bValue === null) return sortConfig.direction === "ascending" ? 1 : -1

    // Compare string values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // Compare number values
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue
    }

    // Default comparison for other types
    return sortConfig.direction === "ascending"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  // Handle sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Get sort direction icon
  const getSortDirectionIcon = (name: string) => {
    if (sortConfig.key === name) {
      return (
        <ArrowUpDown
          className={`ml-1 h-4 w-4 ${sortConfig.direction === "ascending" ? "text-purple-700" : "text-purple-500"}`}
        />
      )
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 text-purple-300" />
  }

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
            <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">
              Total Inventory Items
            </h2>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-purple-900 dark:text-purple-50 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              {filteredItems.length} Items ({filteredItems.reduce((sum, item) => sum + item.quantity, 0)} Total Units)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50">
                  <TableHead className="w-[250px] cursor-pointer" onClick={() => requestSort("name")}>
                    <div className="flex items-center">
                      Item Name
                      {getSortDirectionIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                    <div className="flex items-center">
                      Category
                      {getSortDirectionIcon("category")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => requestSort("quantity")}>
                    <div className="flex items-center justify-end">
                      Quantity
                      {getSortDirectionIcon("quantity")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                    <div className="flex items-center">
                      Status
                      {getSortDirectionIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("location")}>
                    <div className="flex items-center">
                      Location
                      {getSortDirectionIcon("location")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length > 0 ? (
                  sortedItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${
                            item.status === "In Stock"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : item.status === "Low Stock"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                : item.status === "Out of Stock"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {item.status}
                        </div>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
