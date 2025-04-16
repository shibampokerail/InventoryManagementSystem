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
import { EditItemForm } from "@/components/edit-item-form"; // Ensure this file exists or update the path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
interface InventoryItem {
  _id: string;
  name: string;
  description: string; // Added description property
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: string;
  condition: string;
}

import { useRef } from "react";

export function InventoryFullView({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  const triggerRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [openDialogItemId, setOpenDialogItemId] = useState<string | null>(null);
  const { toast } = useToast();
  const handleDelete = async (itemId: string, itemName: string) => {
    // Show confirmation prompt
    if (!confirm(`Are you sure you want to delete the item "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      toast({
        title: "Item Deleted",
        description: `${itemName} has been deleted successfully.`,
        variant: "success",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
        variant: "destructive",
      });
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        // Optionally redirect to login page
      }
    }
  };
  const handleDialogClose = (itemId: string) => {
    setOpenDialogItemId(null);
    // Return focus to the dropdown trigger to ensure it remains clickable
    const trigger = triggerRefs.current.get(itemId);
    if (trigger) {
      trigger.focus();
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  // Get unique categories, statuses, and conditions for filter dropdowns
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category || "Uncategorized")))];
  const statuses = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.status || "Unknown")))];
  const conditions = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.condition || "Unknown")))];

// Helper function to format ISO date string
  const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString(); // e.g., "4/16/2025, 6:16:56 AM"
};
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

          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition === "all" ? "All Conditions" : condition}
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
              <TableHead className="text-purple-900 dark:text-purple-50">Min Quantity</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Unit</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Location</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Condition</TableHead>
              <TableHead className="text-purple-900 dark:text-purple-50">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.category || "Uncategorized"}</TableCell>
                <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
                <TableCell className="text-purple-900 dark:text-purple-50">{item.minQuantity}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.unit || "pieces"}</TableCell>
                <TableCell className="text-purple-700 dark:text-purple-300">{item.location}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "AVAILABLE" ? "default" : item.status === "LOW_STOCK" ? "destructive" : "outline"
                    }
                    className={
                      item.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                        : item.status === "LOW_STOCK"
                        ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                    }
                  >
                    {item.status || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.condition === "OK" ? "default" : "destructive"}
                    className={
                      item.condition === "OK"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                    }
                  >
                    {item.condition || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      ref={(el) => {
                        triggerRefs.current.set(item._id, el);
                      }}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Dialog
                      open={openDialogItemId === item._id}
                      onOpenChange={(open) => {
                        if (!open) handleDialogClose(item._id);
                        setOpenDialogItemId(open ? item._id : null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing prematurely
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                        <DialogHeader>
                          <DialogTitle className="text-purple-900 dark:text-purple-50">
                            Edit Inventory Item
                          </DialogTitle>
                          <DialogDescription className="text-purple-700 dark:text-purple-300">
                            Update the details for {item.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <EditItemForm
                          item={item}
                          onSuccess={() => handleDialogClose(item._id)}
                        />
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 dark:text-red-400"
                      onClick={() => handleDelete(item._id, item.name)}
                    >
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