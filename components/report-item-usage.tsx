"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { jwtDecode } from "jwt-decode";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface for inventory items
interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  condition: string;
}

// Interface for decoded JWT token
interface DecodedToken {
  sub?: string; // Standard claim for user ID in Flask-JWT-Extended
}

interface ReportItemUsageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItems: InventoryItem[];
  onUsageReported?: () => void; // Callback to notify parent component
}

const actions = ["Damaged", "Stolen", "Lost", "CheckedOut", "returned"];
const getToken = () => {
  return localStorage.getItem("token");
};

const getUserIdFromToken = (token: string): string => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    console.log("Decoded JWT token:", decoded);
    if (!decoded.sub) {
      throw new Error("User ID (sub) not found in token");
    }
    return decoded.sub;
  } catch (err) {
    throw new Error(`Failed to decode JWT token: ${err instanceof Error ? err.message : String(err)}`);
  }
};

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
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return response.json();
};

export function ReportItemUsage({ open, onOpenChange, inventoryItems, onUsageReported }: ReportItemUsageProps) {
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = getToken();
    if (!jwtToken) {
      setError("Token not found in localStorage. Please log in again.");
    } else {
      setToken(jwtToken);
    }
  }, []);

  // Filter items to only those whose names start with the search query
  const filteredItems = inventoryItems.filter((item) =>
    searchQuery ? item.name.toLowerCase().startsWith(searchQuery.toLowerCase()) : true
  );

  // Handle item selection
  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItemId(item._id);
    setSearchQuery(""); // Clear search after selection
  };

  const resetForm = () => {
    setSelectedItemId("");
    setSearchQuery("");
    setAction("");
    setQuantity("");
    setCustomReason("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    if (!selectedItemId || !action || !quantity) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    const qty = Number.parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      setIsSubmitting(false);
      return;
    }

    if (action === "other" && !customReason) {
      setError("Please specify the reason for the 'other' action.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userId = getUserIdFromToken(token);

      const usageData = {
        itemId: selectedItemId,
        userId,
        action: action === "other" ? `reported${customReason}` : `reported${action.charAt(0).toUpperCase() + action.slice(1)}`,
        quantity: qty,
        timestamp: new Date().toISOString(),
      };

      console.log("Submitting inventory usage:", usageData);

      const response = await fetchWithAuth(`/api/inventory-usage`, token, {
        method: "POST",
        body: JSON.stringify(usageData),
      });

      console.log("Inventory usage logged:", response);

      toast({
        title: "Usage Reported",
        description: `Successfully reported ${qty} item(s) as ${action}${action === "other" ? ` (${customReason})` : ""}.`,
        variant: "success",
      });

      if (onUsageReported) {
        onUsageReported();
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to report usage. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("Unauthorized")) {
        localStorage.removeItem("token");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected item's name for display
  const selectedItem = selectedItemId
    ? inventoryItems.find((item) => item._id === selectedItemId)
    : null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px] border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-purple-900 dark:text-purple-50">
            Report Item Usage
          </DialogTitle>
          <DialogDescription className="text-purple-700 dark:text-purple-300">
            Report items that were damaged, stolen, lost, or affected by another issue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="itemSearch" className="text-purple-900 dark:text-purple-50">
              Item <span className="text-red-500">*</span>
            </Label>
            <Input
              id="itemSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="border-purple-200 dark:border-purple-800"
              autoComplete="off"
            />
            <ScrollArea className="h-[150px] border border-purple-200 dark:border-purple-800 rounded-md">
              {selectedItem && (
                <div
                  key={selectedItem._id}
                  className="px-4 py-2 bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-50 font-bold"
                >
                  {selectedItem.name} ({selectedItem.quantity} in stock)
                </div>
              )}
              {filteredItems.length > 0 ? (
                filteredItems
                  .filter((item) => item._id !== selectedItemId) // Exclude the selected item from the rest of the list
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer text-purple-900 dark:text-purple-50`}
                      onClick={() => handleItemSelect(item)}
                    >
                      {item.name} ({item.quantity} in stock)
                    </div>
                  ))
              ) : (
                <div className="px-4 py-2 text-purple-700 dark:text-purple-300">
                  No items found
                </div>
              )}
            </ScrollArea>
            {selectedItem && (
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Selected: {selectedItem.name} ({selectedItem.quantity} in stock)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="action" className="text-purple-900 dark:text-purple-50">
              Action <span className="text-red-500">*</span>
            </Label>
            <Select value={action} onValueChange={setAction} required>
              <SelectTrigger id="action" className="border-purple-200 dark:border-purple-800">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((act) => (
                  <SelectItem key={act} value={act}>
                    {act.charAt(0).toUpperCase() + act.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason" className="text-purple-900 dark:text-purple-50">
                Specify Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customReason"
                name="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g., Misplaced"
                className="border-purple-200 dark:border-purple-800"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-purple-900 dark:text-purple-50">
              Quantity Affected <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 2"
              className="border-purple-200 dark:border-purple-800"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Reporting..." : "Report Usage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}