"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Save, RotateCcw, CheckCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Define the locations
const locations = ["Student Union", "Rec Center"];

// Interface for inventory items fetched from the backend
interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  created_at: string;
  updated_at: string;
}

// Interface for supply usage in the form
interface SupplyUsage {
  id: string;
  name: string;
  unit: string;
  quantity: number; // Current quantity in inventory
  usage: string; // "N/A" or a number as a string
}

// Interface for decoded JWT token
interface DecodedToken {
  sub?: string; // Standard claim for user ID in Flask-JWT-Extended
}

// Utility function to get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Utility function to decode the JWT token and extract user ID
const getUserIdFromToken = (token: string): string => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    console.log("Decoded JWT token:", decoded); // Debug: Inspect the token payload
    if (!decoded.sub) {
      throw new Error("User ID (sub) not found in token");
    }
    return decoded.sub;
  } catch (err) {
    throw new Error(`Failed to decode JWT token: ${err instanceof Error ? err.message : String(err)}`);
  }
};

// Utility function to make authenticated API requests
const fetchWithAuth = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or revoked token");
    }
    throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
  }

  return response.json();
};

export function DailyLogsForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState("Student Union");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [supplies, setSupplies] = useState<SupplyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch supplies
  const fetchSupplies = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      router.push("/api/auth/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const itemsData: InventoryItem[] = await fetchWithAuth("/backendapi/inventory-items", token);
      const supplyItems = itemsData
        .filter((item) => item.category.toLowerCase() === "supplies")
        .map((item) => ({
          id: item._id,
          name: item.name,
          unit: "units", // Adjust based on actual data if available
          quantity: item.quantity,
          usage: "NA", // Default to "NA"
        }));

      setSupplies(supplyItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory items");
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/api/auth/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch supplies on mount
  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  // Handle change in supply usage
  const handleSupplyChange = (id: string, value: string) => {
    setSupplies((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, usage: value } : item
      )
    );
  };

  // Reset the form and re-fetch supplies
  const resetForm = async () => {
    setDate(new Date());
    setLocation("Student Union");
    setSupplies((prev) =>
      prev.map((item) => ({ ...item, usage: "NA" }))
    );
    setError(null);
    setSuccess(false);
    await fetchSupplies(); // Re-fetch supplies to update quantities
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate form
    if (!date || !location) {
      setError("Please select a date and location");
      setIsSubmitting(false);
      return;
    }

    // Check if at least one supply has a usage value greater than 0
    const hasSupplyUsage = supplies.some(
      (item) => item.usage.toUpperCase() !== "NA" && Number.parseInt(item.usage) > 0
    );
    if (!hasSupplyUsage) {
      setError("Please enter usage for at least one supply item (use a number greater than 0)");
      setIsSubmitting(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError("No authentication token found. Please log in.");
      setIsSubmitting(false);
      router.push("/api/auth/login");
      return;
    }

    try {
      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error("User ID not found in token. Please log in again.");
      }

      // Process each supply item with usage
      for (const item of supplies) {
        if (item.usage.toUpperCase() === "NA" || !item.usage) continue;

        const usageValue = Number.parseInt(item.usage);
        if (isNaN(usageValue) || usageValue <= 0) continue; // Skip invalid or zero values

        const newQuantity = item.quantity - usageValue;

        if (newQuantity < 0) {
          throw new Error(`Insufficient quantity for ${item.name}. Current: ${item.quantity}, Requested: ${usageValue}`);
        }

        // Log inventory usage
        await fetchWithAuth("/backendapi/inventory-usage", token, {
          method: "POST",
          body: JSON.stringify({
            itemId: item.id,
            userId,
            action: "daily-usages",
            timestamp: new Date().toISOString(),
            quantity: usageValue,
          }),
        });
      }

      // Show success message
      setSuccess(true);
      toast({
        title: "Daily Log Submitted",
        description: `Successfully recorded supply usage for ${format(date, "MMMM d, yyyy")}`,
        variant: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit daily log");
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/api/auth/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-purple-900 dark:text-purple-50">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Show confirmation card if submission was successful
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50 p-6">
        <Card className="max-w-md w-full border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Your Log has been submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 dark:text-purple-300 mb-4">
              Your daily supply usage log has been successfully recorded for {format(date || new Date(), "MMMM d, yyyy")}.
            </p>
            <Button
              onClick={resetForm}
              className="bg-purple-700 hover:bg-purple-800 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Log
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the form if not successful
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-purple-900 dark:text-purple-50">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal border-purple-200 dark:border-purple-800"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">
            Location
          </Label>
          <Select value={location || "Student Union"} onValueChange={setLocation}>
            <SelectTrigger id="location" className="border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc, index) => (
                <SelectItem key={loc} value={loc} defaultChecked={index === 0}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Supply Usage</h3>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Please write NA for no usages.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplies.map((item) => (
            <div key={item.id} className="space-y-2">
              <Label htmlFor={item.id} className="text-purple-900 dark:text-purple-50">
                {item.name} ({item.unit}) - Current: {item.quantity}
              </Label>
              <Input
                id={item.id}
                type="text"
                value={item.usage}
                onChange={(e) => handleSupplyChange(item.id, e.target.value)}
                placeholder="Enter usage or NA"
                className="border-purple-200 dark:border-purple-800"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
          disabled={isSubmitting}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Form
        </Button>
        <Button
          type="submit"
          className="bg-purple-700 hover:bg-purple-800 text-white"
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Log"}
        </Button>
      </div>
    </form>
  );
}