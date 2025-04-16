// app/dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryTable } from "@/components/inventory-table";
import { RecentActivity } from "@/components/recent-activity";
import { DailyLogsForm } from "@/components/daily-logs-form";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { InventoryFullView } from "@/components/inventory-full-view";
import { CheckoutForm } from "@/components/checkout-form";
import { ReportsView } from "@/components/reports-view";
import { io, Socket } from "socket.io-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddItemForm } from "@/components/add-item-form";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

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


// Utility function to get the JWT token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
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
    throw new Error(`Failed to fetch data ${endpoint}: ${response.statusText}`);
  }

  return response.json();
};

export default function InventoryDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useUser();

  // State for fetched data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [checkoutHistory, setCheckoutHistory] = useState([]);
  const [stats, setStats] = useState({
    total_items: 0,
    low_stock: 0,
    items_checked_out: 0,
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Step 1: Authenticate with Auth0 and get the JWT token from Flask
  useEffect(() => {
    const authenticate = async () => {
      try {
        // Check if Auth0 is still loading or if there's an error
        if (authLoading) return;
        if (authError) {
          throw new Error("Auth0 authentication failed");
        }

        // Redirect to login if user is not authenticated
        if (!user) {
          router.push("/api/auth/login");
          return;
        }

        // Get the user's email from Auth0
        const email = user.email;
        if (!email) {
          throw new Error("User email not found in Auth0 profile");
        }

        // Check if a token already exists in localStorage
        let jwtToken = getToken();
        if (!jwtToken) {
          // Send the email to the Flask server to get a JWT token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate with Flask server");
          }

          const data = await response.json();
          jwtToken = data.access_token;

          if (!jwtToken) {
            throw new Error("No JWT token received from Flask server");
          }

          // Store the JWT token in localStorage
          localStorage.setItem("token", jwtToken);
        }

        setToken(jwtToken);
      } catch (err) {
        if (err instanceof Error) {
          if (err instanceof Error) {
            if (err instanceof Error) {
              if (err instanceof Error) {
                if (err instanceof Error) {
                  setError(err.message);
                } else {
                  setError("An unknown error occurred");
                }
              } else {
                setError("An unknown error occurred");
              }
            } else {
              setError("An unknown error occurred");
            }
          } else {
            setError("An unknown error occurred");
          }
        } else {
          setError("An unknown error occurred");
        }
        if (err instanceof Error && (err.message.includes("Auth0") || err.message.includes("email"))) {
          router.push("/api/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [user, authLoading, authError, router]);

  // Step 2: Fetch data using the JWT token
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return; // Wait until the token is available

      try {
        setLoading(true);
        setError(null);

        // Fetch inventory items
        const itemsData = await fetchWithAuth("/api/inventory-items", token);
        setInventoryItems(itemsData);

        // Fetch checkout history (inventory usage)
        const usageData = await fetchWithAuth("/api/inventory-usage", token);
        setCheckoutHistory(usageData);

        // Fetch stats
        const statsData = await fetchWithAuth("/api/stats", token);
        setStats(statsData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        if (err instanceof Error && err.message.includes("Unauthorized")) {
          localStorage.removeItem("token");
          router.push("/api/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

 // Step 3: Set up WebSocket connection for real-time updates
 useEffect(() => {
  if (!token) return;

  const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/realtime`, {
    path: "/socket.io",
    transports: ["websocket"],
    query: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socketInstance.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socketInstance.on("connection_status", (data) => {
    console.log("Connection status:", data);
  });

  // Listen for inventory_items insert events
  socketInstance.on("inventory_items_insert", (newItem: InventoryItem) => {
    console.log("New inventory item:", newItem);
    setInventoryItems((prev) => {
      if (prev.some((item) => item._id === newItem._id)) return prev;
      return [...prev, newItem];
    });
  });

  // Listen for inventory_items update events
  socketInstance.on("inventory_items_update", (updatedItem: InventoryItem) => {
    console.log("Updated inventory item:", updatedItem);
    setInventoryItems((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  });

  // Listen for inventory_items delete events
  socketInstance.on("inventory_items_delete", (data: { _id: string }) => {
    console.log("Deleted inventory item:", data._id);
    setInventoryItems((prev) => prev.filter((item) => item._id !== data._id));
  });

  socketInstance.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  socketInstance.on("connect_error", (err) => {
    console.error("WebSocket connection error:", err.message);
    if (err.message.includes("Invalid token")) {
      console.log("Invalid token detected, redirecting to login...");
      localStorage.removeItem("token");
      router.push("/api/auth/login");
    } else {
      setError("Failed to connect to real-time updates. Please refresh the page.");
    }
  });

  setSocket(socketInstance);

  // Cleanup on unmount
  return () => {
    socketInstance.disconnect();
  };
}, [token, router]);

// Step 4: Update stats whenever inventoryItems changes
useEffect(() => {
  const totalItems = inventoryItems.length;
  const lowStock = inventoryItems.filter((item) => item.quantity < item.minQuantity).length;
  const itemsCheckedOut = inventoryItems.reduce(
    (sum, item) => sum + (item.checked_out || 0),
    0
  );
  setStats({
    total_items: totalItems,
    low_stock: lowStock,
    items_checked_out: itemsCheckedOut,
  });
}, [inventoryItems]);

// Calculate dashboard stats
const totalItems = stats.total_items || 0;
const lowStockItems = stats.low_stock || 0;
const checkedOutItems = stats.items_checked_out || 0;

// Count upcoming returns (due within 48 hours)
const currentDate = new Date();
const futureDate = new Date(currentDate);
futureDate.setHours(currentDate.getHours() + 48);

const upcomingReturns = checkoutHistory.filter(
  (checkout: { return_date?: string; created_at: string }) => {
    const returnDate = new Date(checkout.return_date || checkout.created_at);
    return returnDate <= futureDate && returnDate >= currentDate;
  }
).length;

// Handle loading and error states
if (loading || authLoading) {
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
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">
            Inventory Dashboard{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.href = "/api/auth/logout";
              }}
              className="text-purple-700 dark:text-purple-300 hover:underline"
            >
              Logout
            </a>
          </h2>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">
                    Add New Inventory Item
                  </DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Fill in the details to add a new item to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <AddItemForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-purple-100 dark:bg-purple-900">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="daily-logs"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              Daily Logs
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="checkout"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              Check Out
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/total-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Total Items
                  </CardTitle>
                  <Package className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{totalItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Across {inventoryItems.length} categories
                  </p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/low-stock-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Low Stock Items
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{lowStockItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Requires attention</p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/checked-out-items")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Items Checked Out
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-purple-700 dark:text-purple-300"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{checkedOutItems}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">For current events</p>
                </CardContent>
              </Card>
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                onClick={() => router.push("/upcoming-returns")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Upcoming Returns
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">{upcomingReturns}</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Due within 48 hours</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-50">Current Inventory</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Overview of available items by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryTable inventoryItems={inventoryItems} />
                </CardContent>
              </Card>
              <Card className="col-span-3 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-50">Recent Activity</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Latest inventory transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity checkoutHistory={checkoutHistory} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily-logs" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Daily Supply Logs</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Track the consumption of supplies across different locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyLogsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Complete Inventory</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Manage and view all inventory items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryFullView inventoryItems={inventoryItems} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Check Out Items</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Request items for events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutForm inventoryItems={inventoryItems} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Inventory Reports</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Analytics and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsView inventoryItems={inventoryItems} checkoutHistory={checkoutHistory} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}