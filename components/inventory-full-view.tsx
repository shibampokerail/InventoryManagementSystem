"use client";

import { useState, useRef, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, ArrowUpDown, FileText } from "lucide-react";
import { ReportItemUsage } from "@/components/report-item-usage";
import { useWebSocket } from "@/context/WebSocketContext";

const categories = ["Furniture", "Electronics", "Office Equipment", "Linens", "Food Service", "Supplies", "Other"];
const locations = [
  "Main Office",
  "Tech Closet 2nd Floor",
  "Janitors Closet 1st",
  "Janitors Closet 2nd",
  "Janitors Closet 3rd",
  "Activites Storage",
  "Geo Storage",
  "Bops Storage",
  "Technical Room",
  "Other (Add your own)",
];
const conditions = ["OK", "DAMAGED", "LOST", "STOLEN", "OTHER (Add your own)"];
const statuses = ["AVAILABLE", "LOW STOCK"];
const units = ["pieces", "boxes", "packs", "rolls", "bags", "cases", "other (add your own)"];

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

interface InventoryFullViewProps {
  inventoryItems?: InventoryItem[]; // Optional prop, fallback if context is empty
}

export function InventoryFullView({ inventoryItems: propInventoryItems }: InventoryFullViewProps) {
  const { inventoryItems: contextInventoryItems, isConnected } = useWebSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showReportUsageDialog, setShowReportUsageDialog] = useState(false);
  const { toast } = useToast();

  // Use context inventoryItems if available, else fall back to prop
  const inventoryItems = contextInventoryItems.length > 0 ? contextInventoryItems : propInventoryItems || [];

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    customCategory: "",
    quantity: "",
    minQuantity: "",
    unit: "",
    customUnit: "",
    location: "",
    customLocation: "",
    status: "",
    condition: "",
    customCondition: "",
    description: "",
  });

  const itemToEdit = inventoryItems && editingItemId
    ? inventoryItems.find(item => item._id === editingItemId)
    : null;

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name,
        category: categories.includes(itemToEdit.category) ? itemToEdit.category : "Other",
        customCategory: categories.includes(itemToEdit.category) ? "" : itemToEdit.category,
        quantity: itemToEdit.quantity.toString(),
        minQuantity: itemToEdit.minQuantity.toString(),
        unit: units.includes(itemToEdit.unit) ? itemToEdit.unit : "other (add your own)",
        customUnit: units.includes(itemToEdit.unit) ? "" : itemToEdit.unit,
        location: locations.includes(itemToEdit.location) ? itemToEdit.location : "Other (Add your own)",
        customLocation: locations.includes(itemToEdit.location) ? "" : itemToEdit.location,
        status: itemToEdit.status,
        condition: conditions.includes(itemToEdit.condition) ? itemToEdit.condition : "OTHER (Add your own)",
        customCondition: conditions.includes(itemToEdit.condition) ? "" : itemToEdit.condition,
        description: itemToEdit.description || "",
      });
    }

    const jwtToken = localStorage.getItem("token");
    if (!jwtToken) {
      setFormError("Token not found in localStorage. Please log in again.");
    } else {
      setToken(jwtToken);
    }
  }, [itemToEdit]);

  useEffect(() => {
    console.log("Dialog state changed: editingItemId =", editingItemId);
    const overlays = document.querySelectorAll('[data-radix-portal], [data-radix-overlay]');
    console.log("Overlays in DOM:", overlays.length, overlays);
  }, [editingItemId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const overlays = document.querySelectorAll('[data-radix-portal], [data-radix-overlay]');
      if (overlays.length > 0 && !editingItemId && !showReportUsageDialog) {
        console.warn("Lingering overlays detected, removing them...");
        overlays.forEach((overlay) => overlay.remove());
        containerRef.current?.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [editingItemId, showReportUsageDialog]);

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete the item "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backendapi/inventory-items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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
      }
    }
  };

  const handleOpenEditDialog = (itemId: string) => {
    console.log("Opening edit dialog for item:", itemId);
    setEditingItemId(itemId);
  };

  const handleCloseEditDialog = () => {
    console.log("Closing edit dialog");
    setEditingItemId(null);
    setFormError(null);
    setTimeout(() => {
      containerRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Updated form data:", updated);
      return updated;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select changed: ${name} = ${value}`);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Updated form data:", updated);
      return updated;
    });
  };

  const resetForm = () => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name,
        category: categories.includes(itemToEdit.category) ? itemToEdit.category : "Other",
        customCategory: categories.includes(itemToEdit.category) ? "" : itemToEdit.category,
        quantity: itemToEdit.quantity.toString(),
        minQuantity: itemToEdit.minQuantity.toString(),
        unit: units.includes(itemToEdit.unit) ? itemToEdit.unit : "other (add your own)",
        customUnit: units.includes(itemToEdit.unit) ? "" : itemToEdit.unit,
        location: locations.includes(itemToEdit.location) ? itemToEdit.location : "Other (Add your own)",
        customLocation: locations.includes(itemToEdit.location) ? "" : itemToEdit.location,
        status: itemToEdit.status,
        condition: conditions.includes(itemToEdit.condition) ? itemToEdit.condition : "OTHER (Add your own)",
        customCondition: conditions.includes(itemToEdit.condition) ? "" : itemToEdit.condition,
        description: itemToEdit.description || "",
      });
    }
  };

  const fetchWithAuth = async (endpoint: string, token: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized: Invalid or revoked token");
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      const errorMessage = "Authentication token not found. Please log in again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFormError(errorMessage);
      return;
    }

    setIsSubmitting(true);

    const requiredFields = ["name", "category", "quantity", "minQuantity", "unit", "location", "status", "condition"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      const errorMessage = `Please fill in all required fields: ${missingFields.join(", ")}`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFormError(errorMessage);
      setIsSubmitting(false);
      return;
    }

    const quantity = Number.parseInt(formData.quantity);
    const minQuantity = Number.parseInt(formData.minQuantity);
    if (isNaN(quantity) || quantity < 0 || isNaN(minQuantity) || minQuantity < 0) {
      const errorMessage = "Quantity and Minimum Quantity must be non-negative numbers.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFormError(errorMessage);
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedItem = {
        _id: itemToEdit?._id,
        name: formData.name,
        category: formData.category === "Other" ? formData.customCategory : formData.category,
        quantity,
        minQuantity,
        unit: formData.unit === "other (add your own)" ? formData.customUnit : formData.unit,
        location: formData.location === "Other (Add your own)" ? formData.customLocation : formData.location,
        status: formData.status,
        condition: formData.condition === "OTHER (Add your own)" ? formData.customCondition : formData.condition,
        description: formData.description || "",
        updated_at: new Date().toISOString(),
      };

      console.log("Submitting updated item:", updatedItem);

      const response = await fetchWithAuth(`/backendapi/inventory-items/${itemToEdit?._id}`, token, {
        method: "PUT",
        body: JSON.stringify(updatedItem),
      });

      console.log("Update successful:", response);

      toast({
        title: "Item Updated",
        description: `${formData.name} has been updated successfully.`,
        variant: "success",
      });

      handleCloseEditDialog();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update item. Please try again.";
      console.error("Update failed:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFormError(errorMessage);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        setFormError("Token is invalid or expired. Please log in again.");
        localStorage.removeItem("token");
      }
    } finally {
      setIsSubmitting(false);
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

  const uniqueCategories = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.category || "Uncategorized")))];
  const uniqueStatuses = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.status || "Unknown")))];
  const uniqueConditions = ["all", ...Array.from(new Set(inventoryItems.map((item) => item.condition || "Unknown")))];

  return (
    <div ref={containerRef} tabIndex={-1} className="space-y-4">
      {!isConnected && (
        <div className="text-yellow-600 dark:text-yellow-400">
          Connecting to real-time updates...
        </div>
      )}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border-purple-200 dark:border-purple-800"
          />
        </div>
        <div className="flex flex-row space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map((category) => (
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
              {uniqueStatuses.map((status) => (
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
              {uniqueConditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition === "all" ? "All Conditions" : condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-purple-700 hover:bg-purple-800 text-white"
            onClick={() => setShowReportUsageDialog(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Report Usage
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
                      item.status === "AVAILABLE" ? "default" : item.status === "LOW STOCK" ? "destructive" : "outline"
                    }
                    className={
                      item.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                        : item.status === "LOW STOCK"
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
                <TableCell className="flex space-x-2">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-purple-700 dark:text-purple-300"
                    onClick={() => handleOpenEditDialog(item._id)}
                    title="Edit item"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                    onClick={() => handleDelete(item._id, item.name)}
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      {editingItemId && (
        <Dialog
          open={!!editingItemId}
          onOpenChange={(open) => {
            console.log("Edit dialog onOpenChange:", open);
            if (!open) {
              handleCloseEditDialog();
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-950">
            {itemToEdit ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">
                    Edit Inventory Item
                  </DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Update the details for {itemToEdit.name}. Make sure all required fields are filled.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
                        Item Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Folding Table"
                        className="border-purple-200 dark:border-purple-800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-purple-900 dark:text-purple-50">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
                        <SelectTrigger id="category" className="border-purple-200 dark:border-purple-800">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.category === "Other" && (
                        <Input
                          id="customCategory"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleInputChange}
                          placeholder="Specify category"
                          className="border-purple-200 dark:border-purple-800"
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-purple-900 dark:text-purple-50">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="e.g., 10"
                        className="border-purple-200 dark:border-purple-800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minQuantity" className="text-purple-900 dark:text-purple-50">
                        Minimum Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minQuantity"
                        name="minQuantity"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.minQuantity}
                        onChange={handleInputChange}
                        placeholder="e.g., 5"
                        className="border-purple-200 dark:border-purple-800"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-purple-900 dark:text-purple-50">
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)} required>
                        <SelectTrigger id="unit" className="border-purple-200 dark:border-purple-800">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.unit === "other (add your own)" && (
                        <Input
                          id="customUnit"
                          name="customUnit"
                          value={formData.customUnit}
                          onChange={handleInputChange}
                          placeholder="Specify unit"
                          className="border-purple-200 dark:border-purple-800"
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)} required>
                        <SelectTrigger id="location" className="border-purple-200 dark:border-purple-800">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.location === "Other (Add your own)" && (
                        <Input
                          id="customLocation"
                          name="customLocation"
                          value={formData.customLocation}
                          onChange={handleInputChange}
                          placeholder="Specify location"
                          className="border-purple-200 dark:border-purple-800"
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-purple-900 dark:text-purple-50">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                        <SelectTrigger id="status" className="border-purple-200 dark:border-purple-800">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-purple-900 dark:text-purple-50">
                        Condition <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)} required>
                        <SelectTrigger id="condition" className="border-purple-200 dark:border-purple-800">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.condition === "OTHER (Add your own)" && (
                        <Input
                          id="customCondition"
                          name="customCondition"
                          value={formData.customCondition}
                          onChange={handleInputChange}
                          placeholder="Specify condition"
                          className="border-purple-200 dark:border-purple-800"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-purple-900 dark:text-purple-50">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
    value={formData.description}
                      onChange={handleInputChange}
                      placeholder={formData.description || "Add any additional details about this item..."}
                      className="min-h-[100px] border-purple-200 dark:border-purple-800"
                    />
                  </div>

                  {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        handleCloseEditDialog();
                      }}
                      className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            ) : (
              <DialogHeader>
                <DialogTitle className="text-purple-900 dark:text-purple-50">Loading...</DialogTitle>
                <DialogDescription className="text-purple-700 dark:text-purple-300">
                  Loading item details or item not found.
                </DialogDescription>
              </DialogHeader>
            )}
          </DialogContent>
        </Dialog>
      )}

      <ReportItemUsage
        open={showReportUsageDialog}
        onOpenChange={setShowReportUsageDialog}
        inventoryItems={inventoryItems}
      />
    </div>
  );
}