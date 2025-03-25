import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const inventoryItems = [
  {
    id: "INV001",
    name: "Folding Tables",
    category: "Furniture",
    quantity: 45,
    status: "In Stock",
    location: "Main Storage",
  },
  {
    id: "INV002",
    name: "Chairs",
    category: "Furniture",
    quantity: 120,
    status: "In Stock",
    location: "Main Storage",
  },
  {
    id: "INV003",
    name: "Tissues",
    category: "Supplies",
    quantity: 8,
    status: "Low Stock",
    location: "Supply Closet B",
  },
  {
    id: "INV004",
    name: "Tablecloths",
    category: "Linens",
    quantity: 32,
    status: "In Stock",
    location: "Linen Storage",
  },
  {
    id: "INV005",
    name: "Projectors",
    category: "Electronics",
    quantity: 5,
    status: "Partially Checked Out",
    location: "Tech Room",
  },
  {
    id: "INV006",
    name: "Microphones",
    category: "Electronics",
    quantity: 12,
    status: "In Stock",
    location: "Tech Room",
  },
  {
    id: "INV007",
    name: "Extension Cords",
    category: "Electronics",
    quantity: 18,
    status: "In Stock",
    location: "Supply Closet A",
  },
]

export function InventoryTable() {
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
          {inventoryItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

