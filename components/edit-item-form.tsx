"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DialogFooter } from "@/components/ui/dialog";

// Categories, locations, conditions, statuses, and units for dropdowns
const categories = ["Furniture", "Electronics", "Office Equipment", "Linens", "Food Service", "Supplies", "Other"];
const locations = [
  "Main Storage",
  "Tech Room",
  "Supply Closet A",
  "Supply Closet B",
  "Linen Storage",
  "Kitchen Storage",
  "Office Storage",
  "Other (Add your own)",
];
const conditions = ["OK", "DAMAGED", "LOST", "STOLEN", "OTHER (Add your own)"];
const statuses = ["AVAILABLE", "LOW STOCK"];
const units = ["pieces", "boxes", "packs", "rolls", "bags", "cases", "other (add your own)"];
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
interface EditItemFormProps {
  item: InventoryItem;
  onSuccess?: () => void;
}

export function EditItemForm({ item, onSuccess }: EditItemFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: item.name,
    category: categories.includes(item.category) ? item.category : "Other",
    customCategory: categories.includes(item.category) ? "" : item.category,
    quantity: item.quantity.toString(),
    minQuantity: item.minQuantity.toString(),
    unit: units.includes(item.unit) ? item.unit : "other (add your own)",
    customUnit: units.includes(item.unit) ? "" : item.unit,
    location: locations.includes(item.location) ? item.location : "Other (Add your own)",
    customLocation: locations.includes(item.location) ? "" : item.location,
    status: item.status,
    condition: conditions.includes(item.condition) ? item.condition : "OTHER (Add your own)",
    customCondition: conditions.includes(item.condition) ? "" : item.condition,
    description: item.description || "",
  });

  const getToken = () => localStorage.getItem("token");

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
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  };

  useEffect(() => {
    const jwtToken = getToken();
    if (!jwtToken) {
      setError("Token not found in localStorage. Please log in again.");
    } else {
      setToken(jwtToken);
    }
    setLoading(false);
  }, []);

  // In EditItemForm component, add debugging to handleInputChange:
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  console.log(`Input changed: ${name} = ${value}`);
  setFormData((prev) => {
    const updated = { ...prev, [name]: value };
    console.log("Updated form data:", updated);
    return updated;
  });
};
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const requiredFields = ["name", "category", "quantity", "minQuantity", "unit", "location", "status", "condition"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const quantity = Number.parseInt(formData.quantity);
    const minQuantity = Number.parseInt(formData.minQuantity);
    if (isNaN(quantity) || quantity < 0 || isNaN(minQuantity) || minQuantity < 0) {
      toast({
        title: "Error",
        description: "Quantity and Minimum Quantity must be non-negative numbers.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedItem = {
        name: formData.name,
        category: formData.category === "Other" ? formData.customCategory : formData.category,
        quantity,
        minQuantity,
        unit: formData.unit === "other (add your own)" ? formData.customUnit : formData.unit,
        location: formData.location === "Other (Add your own)" ? formData.customLocation : formData.location,
        status: formData.status,
        condition: formData.condition === "OTHER (Add your own)" ? formData.customCondition : formData.condition,
        description: formData.description || undefined,
      };

      const response = await fetchWithAuth(`/api/inventory-items/${item._id}`, token, {
        method: "PUT",
        body: JSON.stringify(updatedItem),
      });

      toast({
        title: "Item Updated",
        description: `${formData.name} has been updated successfully.`,
        variant: "success",
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item. Please try again.",
        variant: "destructive",
      });
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        setError("Token is invalid or expired. Please log in again.");
        localStorage.removeItem("token");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-purple-900 dark:text-purple-50">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">Item Name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Folding Table"
            className="border-purple-200 dark:border-purple-800" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-purple-900 dark:text-purple-50">Category <span className="text-red-500">*</span></Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
            <SelectTrigger id="category" className="border-purple-200 dark:border-purple-800"><SelectValue placeholder="Select category" /></SelectTrigger>
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
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-purple-900 dark:text-purple-50">Quantity <span className="text-red-500">*</span></Label>
          <Input id="quantity" name="quantity" type="number" min="0" value={formData.quantity} onChange={handleInputChange} placeholder="e.g., 10"
            className="border-purple-200 dark:border-purple-800" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minQuantity" className="text-purple-900 dark:text-purple-50">Minimum Quantity <span className="text-red-500">*</span></Label>
          <Input id="minQuantity" name="minQuantity" type="number" min="0" value={formData.minQuantity} onChange={handleInputChange} placeholder="e.g., 5"
            className="border-purple-200 dark:border-purple-800" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit" className="text-purple-900 dark:text-purple-50">Unit <span className="text-red-500">*</span></Label>
          <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)} required>
            <SelectTrigger id="unit" className="border-purple-200 dark:border-purple-800"><SelectValue placeholder="Select unit" /></SelectTrigger>
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
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">Location <span className="text-red-500">*</span></Label>
          <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)} required>
            <SelectTrigger id="location" className="border-purple-200 dark:border-purple-800"><SelectValue placeholder="Select location" /></SelectTrigger>
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
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-purple-900 dark:text-purple-50">Status <span className="text-red-500">*</span></Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
            <SelectTrigger id="status" className="border-purple-200 dark:border-purple-800"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-purple-900 dark:text-purple-50">Condition <span className="text-red-500">*</span></Label>
          <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)} required>
            <SelectTrigger id="condition" className="border-purple-200 dark:border-purple-800"><SelectValue placeholder="Select condition" /></SelectTrigger>
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
              required
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-purple-900 dark:text-purple-50">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add any additional details about this item..."
          className="min-h-[100px] border-purple-200 dark:border-purple-800"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSuccess) onSuccess();
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
  );
}