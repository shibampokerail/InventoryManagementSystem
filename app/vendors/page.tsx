"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Vendor, VendorItem } from "@/types/vendors";
import { InventoryItem } from "@/types/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Package, Truck, Box } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/context/WebSocketContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Utility function to get the JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Utility function to make authenticated API requests
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
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
    }
    if (response.status === 403) {
      throw new Error("Forbidden: You do not have permission to perform this action.");
    }
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return response.json();
};

export default function VendorsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { vendors, setVendors, inventoryItems, setInventoryItems, vendorItems, setVendorItems, error: wsError } = useWebSocket();
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [isAssigningItems, setIsAssigningItems] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemsToUnassign, setItemsToUnassign] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorItemsCache, setVendorItemsCache] = useState<{ [vendorId: string]: InventoryItem[] }>({});
  const [activeVendorTab, setActiveVendorTab] = useState<string | null>(null);
  const [isVendorItemsLoading, setIsVendorItemsLoading] = useState(false);

  const [newVendor, setNewVendor] = useState({
    name: "",
    contact: "",
    phone: "",
  });

  // Fetch vendors, inventory items, and vendor items on mount
  const fetchData = async () => {
    try {
      const [vendorsData, inventoryData, vendorItemsData] = await Promise.all([
        fetchWithAuth("/api/vendors"),
        fetchWithAuth("/api/inventory-items"),
        fetchWithAuth("/api/vendor-items"),
      ]);

      if (!Array.isArray(vendorsData)) {
        throw new Error("Vendors API response is not an array");
      }
      const validVendors = vendorsData.filter(
        (vendor) => vendor && typeof vendor === "object" && vendor._id && vendor.name && vendor.contact
      );
      setVendors(validVendors);

      if (!Array.isArray(inventoryData)) {
        throw new Error("Inventory Items API response is not an array");
      }
      const validItems = inventoryData.filter(
        (item) => item && typeof item === "object" && item._id && item.name && item.category
      );
      setInventoryItems(validItems);

      if (!Array.isArray(vendorItemsData)) {
        throw new Error("Vendor Items API response is not an array");
      }
      setVendorItems(vendorItemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data. Please try again.");
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/api/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch items for a specific vendor
  const fetchItemsByVendor = async (vendorId: string) => {
    if (vendorItemsCache[vendorId]) {
      console.log(`Returning cached items for vendor ${vendorId}`);
      return vendorItemsCache[vendorId];
    }
    try {
      setIsVendorItemsLoading(true);
      console.log(`Fetching items for vendor ${vendorId}`);
      const items = await fetchWithAuth(`/api/vendors/${vendorId}/items`);
      if (!Array.isArray(items)) {
        throw new Error("Items API response is not an array");
      }
      const validItems = items.filter(
        (item) => item && typeof item === "object" && item._id && item.name && item.category
      );
      setVendorItemsCache((prev) => {
        console.log(`Caching ${validItems.length} items for vendor ${vendorId}`);
        return { ...prev, [vendorId]: validItems };
      });
      return validItems;
    } catch (err) {
      console.error(`Failed to fetch items for vendor ${vendorId}:`, err);
      return [];
    } finally {
      setIsVendorItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Set initial active vendor for dropdown
  useEffect(() => {
    if (vendors.length > 0 && !activeVendorTab) {
      setActiveVendorTab(vendors[0]._id);
      fetchItemsByVendor(vendors[0]._id);
    }
  }, [vendors]);

  // Refresh vendorItemsCache when vendorItems changes via WebSocket
  useEffect(() => {
    if (activeVendorTab) {
      console.log(`vendorItems updated, refreshing cache for vendor ${activeVendorTab}`);
      setVendorItemsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[activeVendorTab]; // Invalidate cache
        return newCache;
      });
      fetchItemsByVendor(activeVendorTab);
    }
  }, [vendorItems, activeVendorTab]);

  // Handle input changes for add/edit forms
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (isEditingVendor && editingVendor) {
      setEditingVendor((prev) => (prev ? { ...prev, [id]: value } : null));
    } else {
      setNewVendor((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Handle adding a new vendor
  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.contact || !newVendor.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const vendorData = {
        name: newVendor.name,
        contact: newVendor.contact,
        phone: newVendor.phone,
      };

      await fetchWithAuth("/api/vendors", {
        method: "POST",
        body: JSON.stringify(vendorData),
      });

      setSearchTerm("");
      toast({
        title: "Vendor Added",
        description: `${newVendor.name} has been added successfully.`,
        variant: "success",
      });

      setNewVendor({
        name: "",
        contact: "",
        phone: "",
      });
      setIsAddingVendor(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing a vendor
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsEditingVendor(true);
  };

  // Handle updating a vendor
  const handleUpdateVendor = async () => {
    if (!editingVendor || !editingVendor.name || !editingVendor.contact || !editingVendor.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedVendorData = {
        name: editingVendor.name,
        contact: editingVendor.contact,
        phone: editingVendor.phone,
      };

      await fetchWithAuth(`/api/vendors/${editingVendor._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedVendorData),
      });

      setSearchTerm("");
      toast({
        title: "Vendor Updated",
        description: `${editingVendor.name} has been updated successfully.`,
        variant: "success",
      });

      setEditingVendor(null);
      setIsEditingVendor(false);
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a vendor
  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await fetchWithAuth(`/api/vendors/${vendorId}`, {
        method: "DELETE",
      });

      toast({
        title: "Vendor Deleted",
        description: "The vendor has been deleted successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open dialog to assign items to a vendor
  const handleAssignItems = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    try {
      // Fetch latest vendorItems to ensure accuracy
      const vendorItemsData = await fetchWithAuth(`/api/vendor-items?vendorId=${vendor._id}`);
      if (!Array.isArray(vendorItemsData)) {
        throw new Error("Vendor Items API response is not an array");
      }
      setVendorItems(vendorItemsData);
      const assignedItemIds = vendorItemsData
        .filter((vi: VendorItem) => vi.vendorId === vendor._id)
        .map((vi: VendorItem) => vi.itemId);
      console.log(`Initializing selectedItems for vendor ${vendor._id}:`, assignedItemIds);
      setSelectedItems(assignedItemIds);
      setItemsToUnassign([]);
      setSelectAll(false);
      setCategoryFilter("all");
      setIsAssigningItems(true);
    } catch (err) {
      console.error("Failed to fetch vendor items:", err);
      toast({
        title: "Error",
        description: "Failed to load assigned items. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSelectedItems((prev) =>
      prev.filter((itemId) =>
        filteredInventoryItems.some(
          (item) => item._id === itemId && (value === "all" || item.category === value)
        )
      )
    );
    setSelectAll(false);
  };

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setItemsToUnassign([]);
      setSelectAll(false);
    } else {
      const filteredItemIds = filteredInventoryItems.map((item) => item._id);
      setSelectedItems(filteredItemIds);
      setItemsToUnassign([]); // Clear unassign list when selecting all
      setSelectAll(true);
    }
  };

  // Handle individual item selection
  const handleItemSelect = useCallback(
    (itemId: string) => {
      const isCurrentlyAssigned = vendorItems.some(
        (vi) => vi.vendorId === selectedVendor?._id && vi.itemId === itemId
      );

      setSelectedItems((prev) => {
        if (prev.includes(itemId)) {
          console.log(`Deselecting item: ${itemId}`);
          const newSelection = prev.filter((id) => id !== itemId);
          if (isCurrentlyAssigned) {
            const vendorItem = vendorItems.find(
              (vi) => vi.vendorId === selectedVendor?._id && vi.itemId === itemId
            );
            if (vendorItem) {
              const vendorItemId = vendorItem._id;
              console.log(`Marking for unassignment: ${vendorItemId}`);
              setItemsToUnassign((prevUnassign) => {
                if (prevUnassign.includes(vendorItemId)) {
                  console.log(`vendorItemId ${vendorItemId} already in itemsToUnassign`);
                  return prevUnassign;
                }
                return [...prevUnassign, vendorItemId];
              });
            }
          }
          setSelectAll(false);
          return newSelection;
        } else {
          console.log(`Selecting item: ${itemId}`);
          const newSelection = [...prev, itemId];
          if (isCurrentlyAssigned) {
            const vendorItem = vendorItems.find(
              (vi) => vi.vendorId === selectedVendor?._id && vi.itemId === itemId
            );
            if (vendorItem) {
              const vendorItemId = vendorItem._id;
              console.log(`Removing from unassignment: ${vendorItemId}`);
              setItemsToUnassign((prevUnassign) => prevUnassign.filter((id) => id !== vendorItemId));
            }
          }
          const filteredItemIds = filteredInventoryItems.map((item) => item._id);
          if (newSelection.length === filteredItemIds.length) {
            setSelectAll(true);
          }
          return newSelection;
        }
      });
    },
    [selectedVendor, vendorItems]
  );

  // Assign and unassign items to/from the vendor
  const handleAssignItemsToVendor = async () => {
    if (!selectedVendor) {
      toast({
        title: "Error",
        description: "No vendor selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingAssignedItemIds = vendorItems
        .filter((vi) => vi.vendorId === selectedVendor._id)
        .map((vi) => vi.itemId);
      const itemsToAssign = selectedItems.filter((itemId) => !existingAssignedItemIds.includes(itemId));

      console.log(`Items to assign: ${itemsToAssign.length}, Items to unassign: ${itemsToUnassign.length}`);
      console.log("itemsToUnassign:", itemsToUnassign);

      const assignPromises = itemsToAssign.map((itemId) =>
        fetchWithAuth("/api/vendor-items", {
          method: "POST",
          body: JSON.stringify({
            vendorId: selectedVendor._id,
            itemId: itemId,
          }),
        })
      );

      const uniqueItemsToUnassign = Array.from(new Set(itemsToUnassign));
      const unassignPromises = uniqueItemsToUnassign.map((vendorItemId) =>
        fetchWithAuth(`/api/vendor-items/${vendorItemId}`, {
          method: "DELETE",
        })
      );

      await Promise.all([...assignPromises, ...unassignPromises]);

      toast({
        title: "Items Updated",
        description: `Assigned ${itemsToAssign.length} item(s) and unassigned ${uniqueItemsToUnassign.length} item(s) for ${selectedVendor.name}.`,
        variant: "success",
      });

      // Clear and refetch cache for the selected vendor
      setVendorItemsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[selectedVendor._id];
        console.log(`Cleared cache for vendor ${selectedVendor._id}`);
        return newCache;
      });
      await fetchItemsByVendor(selectedVendor._id);

      setIsAssigningItems(false);
      setSelectedItems([]);
      setItemsToUnassign([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Assignment error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update item assignments. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      if (!vendor || !vendor.name || !vendor.contact) {
        console.warn("Invalid vendor object:", vendor);
        return false;
      }
      if (!searchTerm.trim()) return true;
      const matchesSearch =
        (vendor.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (vendor.contact?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [vendors, searchTerm]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(inventoryItems.map((item) => item.category))).filter(Boolean);
    return ["all", ...uniqueCategories];
  }, [inventoryItems]);

  // Filter inventory items based on category
  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      if (!item || !item.name || !item.category) {
        console.warn("Invalid inventory item:", item);
        return false;
      }
      return categoryFilter === "all" || item.category === categoryFilter;
    });
  }, [inventoryItems, categoryFilter]);

  // Handle vendor selection for dropdown
  const handleVendorSelect = async (vendorId: string) => {
    setActiveVendorTab(vendorId);
    await fetchItemsByVendor(vendorId);
  };

  if (loading) return <div className="text-purple-900 dark:text-purple-50 p-8">Loading...</div>;
  if (error || wsError) return <div className="text-red-500 p-8">{error || wsError}</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-purple-50 dark:bg-purple-950">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-lg text-purple-900 dark:text-purple-50">U&I Services</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Vendor Management</h2>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddingVendor} onOpenChange={setIsAddingVendor}>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <Truck className="mr-2 h-4 w-4" />
                  Add Approved Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">Add Approved Vendor</DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Add a new approved vendor to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-purple-900 dark:text-purple-50">
                      Vendor Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Tech Gadgets Ltd."
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newVendor.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right text-purple-900 dark:text-purple-50">
                      Contact Email
                    </Label>
                    <Input
                      id="contact"
                      type="email"
                      placeholder="sales@techgadgets.com"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newVendor.contact}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right text-purple-900 dark:text-purple-50">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="443"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newVendor.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingVendor(false)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleAddVendor}>
                    Add Vendor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">Approved Vendors</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Manage approved vendors and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
              <div className="flex flex-1 items-center space-x-2">
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm border-purple-200 dark:border-purple-800"
                />
              </div>
            </div>

            <div className="rounded-md border border-purple-200 dark:border-purple-800">
              <Table>
                <TableHeader className="bg-purple-100 dark:bg-purple-900">
                  <TableRow>
                    <TableHead className="text-purple-900 dark:text-purple-50">Vendor Name</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Contact Email</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Phone</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-purple-700 dark:text-purple-300">
                        No vendors found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                        <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                          {vendor.name}
                        </TableCell>
                        <TableCell className="text-purple-700 dark:text-purple-300">{vendor.contact}</TableCell>
                        <TableCell className="text-purple-700 dark:text-purple-300">{vendor.phone}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                              onClick={() => handleEditVendor(vendor)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                              onClick={() => handleAssignItems(vendor)}
                            >
                              Assign Items
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
                              onClick={() => handleDeleteVendor(vendor._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Showing <strong>{filteredVendors.length}</strong> of <strong>{vendors.length}</strong> vendors
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
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">Items by Vendor</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              View inventory items provided by each vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-4 text-purple-700 dark:text-purple-300">
                No vendors available
              </div>
            ) : (
              <div>
                <Select value={activeVendorTab || vendors[0]._id} onValueChange={handleVendorSelect}>
                  <SelectTrigger className="w-[300px] border-purple-200 dark:border-purple-800 mb-4">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isVendorItemsLoading ? (
                  <div className="text-center py-4 text-purple-700 dark:text-purple-300">
                    Loading items...
                  </div>
                ) : (
                  <div className="rounded-md border border-purple-200 dark:border-purple-800">
                    <Table>
                      <TableHeader className="bg-purple-100 dark:bg-purple-900">
                        <TableRow>
                          <TableHead className="text-purple-900 dark:text-purple-50">Item Name</TableHead>
                          <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                          <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
                          <TableHead className="text-purple-900 dark:text-purple-50">Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(vendorItemsCache[activeVendorTab || vendors[0]._id] || []).length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-4 text-purple-700 dark:text-purple-300"
                            >
                              No items assigned to this vendor
                            </TableCell>
                          </TableRow>
                        ) : (
                          (vendorItemsCache[activeVendorTab || vendors[0]._id] || []).map((item) => (
                            <TableRow
                              key={item._id}
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/50"
                            >
                              <TableCell className="text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                              <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                              <TableCell className="text-purple-700 dark:text-purple-300">{item.quantity}</TableCell>
                              <TableCell className="text-purple-700 dark:text-purple-300">{item.location}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Vendor Dialog */}
        <Dialog open={isEditingVendor} onOpenChange={setIsEditingVendor}>
          <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
            <DialogHeader>
              <DialogTitle className="text-purple-900 dark:text-purple-50">Edit Vendor</DialogTitle>
              <DialogDescription className="text-purple-700 dark:text-purple-300">
                Update the vendor’s information
              </DialogDescription>
            </DialogHeader>
            {editingVendor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-purple-900 dark:text-purple-50">
                    Vendor Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Tech Gadgets Ltd."
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingVendor.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact" className="text-right text-purple-900 dark:text-purple-50">
                    Contact Email
                  </Label>
                  <Input
                    id="contact"
                    type="email"
                    placeholder="sales@techgadgets.com"
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingVendor.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right text-purple-900 dark:text-purple-50">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="443"
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingVendor.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditingVendor(false)}
                className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              >
                Cancel
              </Button>
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleUpdateVendor}>
                Update Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Items Dialog */}
        <Dialog open={isAssigningItems} onOpenChange={setIsAssigningItems}>
          <DialogContent className="sm:max-w-[700px] border-purple-200 dark:border-purple-800">
            <DialogHeader>
              <DialogTitle className="text-purple-900 dark:text-purple-50">
                Assign Items to {selectedVendor?.name}
              </DialogTitle>
              <DialogDescription className="text-purple-700 dark:text-purple-300">
                Select or deselect inventory items to assign or unassign them from this vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[200px] border-purple-200 dark:border-purple-800">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="border-purple-200 dark:border-purple-800"
                  />
                  <Label htmlFor="select-all" className="text-purple-900 dark:text-purple-50">
                    Select All
                  </Label>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto border rounded-md border-purple-200 dark:border-purple-800">
                <Table>
                  <TableHeader className="bg-purple-100 dark:bg-purple-900 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="text-purple-900 dark:text-purple-50">Item Name</TableHead>
                      <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                      <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-purple-700 dark:text-purple-300">
                          No items found for this category
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventoryItems.map((item) => (
                        <TableRow
                          key={item._id}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item._id)}
                              onCheckedChange={() => handleItemSelect(item._id)}
                              className="border-purple-200 dark:border-purple-800"
                            />
                          </TableCell>
                          <TableCell className="text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{item.quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Selected: <strong>{selectedItems.length}</strong> item(s) | To unassign:{" "}
                <strong>{itemsToUnassign.length}</strong> item(s)
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssigningItems(false)}
                className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              >
                Cancel
              </Button>
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleAssignItemsToVendor}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}