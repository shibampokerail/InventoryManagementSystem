// components/inventory-table.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: string;
  condition: string;
  description: string;
}

export function InventoryTable({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  // Show only the first 7 items for the overview table
  const displayItems = inventoryItems.slice(0, 7);

  return (
    <div className="rounded-md border border-purple-200 dark:border-purple-800">
      <Table>
        <TableHeader className="bg-purple-100 dark:bg-purple-900">
          <TableRow>
            <TableHead className="text-purple-900 dark:text-purple-50">Item</TableHead>
            <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
            <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
            <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
            <TableHead className="text-purple-900 dark:text-purple-50">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayItems.map((item) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}