"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, ArrowUpDown, FileDown, Filter, ShoppingCart } from "lucide-react"

const inventoryItems = [
  {
    id: "INV001",
    name: "Folding Tables",
    category: "Furniture",
    quantity: 45,
    status: "In Stock",
    location: "Main Storage",
    lastCheckedOut: "2023-03-15",
    condition: "Good",
    value: "$2,250.00",
  },
  {
    id: "INV002",
    name: "Chairs",
    category: "Furniture",
    quantity: 120,
    status: "In Stock",
    location: "Main Storage",
    lastCheckedOut: "2023-03-10",
    condition: "Good",
    value: "$3,600.00",
  },
  {
    id: "INV003",
    name: "Tissues",
    category: "Supplies",
    quantity: 8,
    status: "Low Stock",
    location: "Supply Closet B",
    lastCheckedOut: "2023-03-18",
    condition: "N/A",
    value: "$24.00",
  },
  {
    id: "INV004",
    name: "Tablecloths",
    category: "Linens",
    quantity: 32,
    status: "In Stock",
    location: "Linen Storage",
    lastCheckedOut: "2023-03-05",
    condition: "Good",
    value: "$640.00",
  },
  {
    id: "INV005",
    name: "Projectors",
    category: "Electronics",
    quantity: 5,
    status: "Partially Checked Out",
    location: "Tech Room",
    lastCheckedOut: "2023-03-20",
    condition: "Excellent",
    value: "$2,500.00",
  },
  {
    id: "INV006",
    name: "Microphones",
    category: "Electronics",
    quantity: 12,
    status: "In Stock",
    location: "Tech Room",
    lastCheckedOut: "2023-03-12",
    condition: "Good",
    value: "$1,200.00",
  },
  {
    id: "INV007",
    name: "Extension Cords",
    category: "Electronics",
    quantity: 18,
    status: "In Stock",
    location: "Supply Closet A",
    lastCheckedOut: "2023-03-08",
    condition: "Fair",
    value: "$270.00",
  },
  {
    id: "INV008",
    name: "Whiteboards",
    category: "Office Equipment",
    quantity: 10,
    status: "In Stock",
    location: "Office Storage",
    lastCheckedOut: "2023-02-28",
    condition: "Good",
    value: "$750.00",
  },
  {
    id: "INV009",
    name: "Podium",
    category: "Furniture",
    quantity: 3,
    status: "In Stock",
    location: "Main Storage",
    lastCheckedOut: "2023-02-15",
    condition: "Excellent",
    value: "$900.00",
  },
  {
    id: "INV010",
    name: "Water Pitchers",
    category: "Food Service",
    quantity: 15,
    status: "In Stock",
    location: "Kitchen Storage",
    lastCheckedOut: "2023-03-17",
    condition: "Good",
    value: "$225.00",
  },
  {
    id: "INV011",
    name: "Serving Trays",
    category: "Food Service",
    quantity: 25,
    status: "In Stock",
    location: "Kitchen Storage",
    lastCheckedOut: "2023-03-17",
    condition: "Good",
    value: "$375.00",
  },
  {
    id: "INV012",
    name: "Portable Speakers",
    category: "Electronics",
    quantity: 4,
    status: "Partially Checked Out",
    location: "Tech Room",
    lastCheckedOut: "2023-03-19",
    condition: "Excellent",
    value: "$800.00",
  },
  {
    id: "INV013",
    name: "Easels",
    category: "Office Equipment",
    quantity: 8,
    status: "In Stock",
    location: "Office Storage",
    lastCheckedOut: "2023-03-01",
    condition: "Good",
    value: "$400.00",
  },
  {
    id: "INV014",
    name: "Clipboards",
    category: "Office Equipment",
    quantity: 20,
    status: "In Stock",
    location: "Office Storage",
    lastCheckedOut: "2023-02-20",
    condition: "Good",
    value: "$100.00",
  },
  {
    id: "INV015",
    name: "Hand Sanitizer",
    category: "Supplies",
    quantity: 6,
    status: "Low Stock",
    location: "Supply Closet B",
    lastCheckedOut: "2023-03-18",
    condition: "N/A",
    value: "$60.00",
  },
]

export function InventoryFullView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter dropdown
  const categories = ["all", ...new Set(inventoryItems.map((item) => item.category))]
  const statuses = ["all", ...new Set(inventoryItems.map((item) => item.status))]

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border-purple-200 dark:border-purple-800"
          />
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex flex-row space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? "All Statuses" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-purple-700 hover:bg-purple-800 text-white">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-purple-200 dark:border-purple-800">
        <Table>
          <TableHeader className="bg-purple-100 dark:bg-purple-900">
            <TableRow>
              <TableHead className="text-purple-900 dark:text-purple-50">ID</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">
                <div className="flex items-center">
                  Item
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Location</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Last Checked Out</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Condition</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Value</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.id}</TableCell>
                <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "destructive" : "outline"
                    }
                    className={
                      item.status === "In Stock"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                        : item.status === "Low Stock"
                          ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.location}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.lastCheckedOut}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.condition}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.value}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Check Out</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-700 dark:text-purple-300">
          Showing <strong>{filteredItems.length}</strong> of <strong>{inventoryItems.length}</strong> items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

