// components/inventory-full-view.tsx
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, ArrowUpDown, FileDown, Filter, ShoppingCart } from "lucide-react";

export function InventoryFullView({ inventoryItems }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories and statuses for filter dropdowns
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category || "N/A")))];
  const statuses = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.status || "Unknown")))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by name of item..."
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
              <TableRow key={item._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.category || "N/A"}</TableCell>
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
                    {item.status || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.location}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">
                  {item.last_checked_out ? new Date(item.last_checked_out).toLocaleString() : "N/A"}
                </TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.condition || "N/A"}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">
                  {item.value ? `$${item.value.toFixed(2)}` : "$0.00"}
                </TableCell>
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
  );
}