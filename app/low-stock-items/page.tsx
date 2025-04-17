"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowLeft, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: string;
  condition: string;
}

interface Vendor {
  _id: string;
  name: string;
}

interface OrderFormData {
  vendor: string;
  quantity: string;
  orderDate: string;
  expectedDelivery: string;
  status: string;
}

export default function LowStockItemsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialogItemId, setOpenDialogItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    vendor: "",
    quantity: "",
    orderDate: "",
    expectedDelivery: "",
    status: "placed",
  });

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch with authentication
  const fetchWithAuth = async (endpoint: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
      if (response.status === 403) throw new Error("Forbidden: You do not have permission to perform this action.");
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  };

  // Fetch inventory items and vendors on mount
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const data = await fetchWithAuth("/api/inventory-items");
        setInventoryItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch inventory items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchVendors = async () => {
      try {
        const data = await fetchWithAuth("/api/vendors");
        setVendors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vendors. Please try again.");
      }
    };

    Promise.all([fetchInventoryItems(), fetchVendors()]);
  }, []);

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category)))];

  // Filter for low stock items (less than 20)
  const lowStockItems = inventoryItems.filter((item) => item.quantity < 20);

  // Apply search and category filters
  const filteredItems = lowStockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to create an order
  const handleSubmitOrder = async (item: InventoryItem) => {
    const requiredFields = ["vendor", "quantity", "orderDate", "expectedDelivery", "status"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof OrderFormData]);
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const quantity = Number.parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        itemId: item._id,
        vendorId: formData.vendor, // Send vendorId to backend
        quantity,
        orderDate: formData.orderDate,
        expectedDelivery: formData.expectedDelivery,
        status: formData.status,
      };

      await fetchWithAuth("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      toast({
        title: "Order Placed",
        description: `Order for ${item.name} has been ${formData.status} successfully.`,
        variant: "success",
      });

      setOpenDialogItemId(null);
      setFormData({
        vendor: "",
        quantity: "",
        orderDate: "",
        expectedDelivery: "",
        status: "placed",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  if (loading) return <div className="text-purple-900 dark:text-purple-50 p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

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
              Items with less than their Minimum units are listed here
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id} className="hover:bg-purple-100/50 dark:hover:bg-purple-900/50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${
                            item.quantity < item.minQuantity
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {item.quantity < item.minQuantity ? "Critical" : "Low Stock"}
                        </div>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Dialog
                          open={openDialogItemId === item._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setOpenDialogItemId(null);
                              setFormData({
                                vendor: "",
                                quantity: "",
                                orderDate: "",
                                expectedDelivery: "",
                                status: "placed",
                              });
                            } else {
                              setOpenDialogItemId(item._id);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Mark as Ordered
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] border-purple-200 dark:border-purple-800">
                            <DialogHeader>
                              <DialogTitle className="text-purple-900 dark:text-purple-50">Place Order for {item.name}</DialogTitle>
                              <DialogDescription className="text-purple-700 dark:text-purple-300">
                                Fill in the details to place an order for this item.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="vendor" className="text-right text-purple-900 dark:text-purple-50">
                                  Vendor <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.vendor}
                                  onValueChange={(value) => handleSelectChange("vendor", value)}
                                  required
                                >
                                  <SelectTrigger id="vendor" className="col-span-3 border-purple-200 dark:border-purple-800">
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map((vendor) => (
                                      <SelectItem key={vendor._id} value={vendor._id}>
                                        {vendor.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right text-purple-900 dark:text-purple-50">
                                  Quantity <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="quantity"
                                  name="quantity"
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={formData.quantity}
                                  onChange={handleInputChange}
                                  placeholder="e.g., 50"
                                  className="col-span-3 border-purple-200 dark:border-purple-800"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="orderDate" className="text-right text-purple-900 dark:text-purple-50">
                                  Order Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="orderDate"
                                  name="orderDate"
                                  type="date"
                                  value={formData.orderDate}
                                  onChange={handleInputChange}
                                  className="col-span-3 border-purple-200 dark:border-purple-800"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expectedDelivery" className="text-right text-purple-900 dark:text-purple-50">
                                  Expected Delivery <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="expectedDelivery"
                                  name="expectedDelivery"
                                  type="date"
                                  value={formData.expectedDelivery}
                                  onChange={handleInputChange}
                                  className="col-span-3 border-purple-200 dark:border-purple-800"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right text-purple-900 dark:text-purple-50">
                                  Status <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.status}
                                  onValueChange={(value) => handleSelectChange("status", value)}
                                  required
                                >
                                  <SelectTrigger id="status" className="col-span-3 border-purple-200 dark:border-purple-800">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="placed">Placed</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenDialogItemId(null)}
                                className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleSubmitOrder(item)}
                                className="bg-purple-700 hover:bg-purple-800 text-white"
                              >
                                Place Order
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
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
  );
}