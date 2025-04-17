"use client";

import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define interfaces for each collection
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  slackId: string;
}

interface Vendor {
  _id: string;
  name: string;
  contact: string;

}
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

interface Order {
  _id: string;
  vendor_id: string;
  items: string;
  quantity: number;
  expectedDelivery: Date;
  status: string;
 
}

interface VendorItem {
  _id: string;
  vendor_id: string;
  item_id: string;
}

interface Notification {
  _id: string;
  message: string;
  type: string;
  recipient: string;
  timestamp: Date

}

interface Log {
  _id: string;
  action: string;
  user_id: string;
  details: any;
  timestamp: Date;
}

interface InventoryUsage {
  _id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  action: string;
  timestamp: Date;
}

interface SlackManagement {
  _id: string;
  bot_token: string;
  app_token: string;
  user_token: string;
  created_at: Date;
  updated_at: Date;
  channel_ids: string[];
}

interface WebSocketContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  vendorItems: VendorItem[];
  setVendorItems: React.Dispatch<React.SetStateAction<VendorItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
  inventoryUsage: InventoryUsage[];
  setInventoryUsage: React.Dispatch<React.SetStateAction<InventoryUsage[]>>;
  slackManagement: SlackManagement[];
  setSlackManagement: React.Dispatch<React.SetStateAction<SlackManagement[]>>;
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorItems, setVendorItems] = useState<VendorItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [inventoryUsage, setInventoryUsage] = useState<InventoryUsage[]>([]);
  const [slackManagement, setSlackManagement] = useState<SlackManagement[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping WebSocket connection.");
      return;
    }

    console.log("Attempting to connect to WebSocket with token:", token);

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/realtime`, {
      path: "/socket.io",
      transports: ["websocket"],
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketInstance.on("connection_status", (data) => {
      console.log("Connection status:", data);
      if (data.status === "error") {
        setError(`WebSocket error: ${data.message}`);
      }
    });

    // Users events
    socketInstance.on("users_insert", (newUser: User) => {
      console.log("New user:", newUser);
      setUsers((prev) => {
        if (prev.some((user) => user._id === newUser._id)) return prev;
        return [...prev, newUser];
      });
      setRoles((prev) => {
        const newRole = newUser.role;
        return prev.includes(newRole) ? prev : [...prev, newRole];
      });
    });

    socketInstance.on("users_update", (updatedUser: User) => {
      console.log("Updated user:", updatedUser);
      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
    });

    socketInstance.on("users_delete", (data: { _id: string }) => {
      console.log("Deleted user:", data._id);
      setUsers((prev) => {
        const updatedUsers = prev.filter((user) => user._id !== data._id);
        setRoles([...new Set(updatedUsers.map((user) => user.role))]);
        return updatedUsers;
      });
    });

    // Vendors events
    socketInstance.on("vendors_insert", (newVendor: Vendor) => {
      console.log("New vendor:", newVendor);
      setVendors((prev) => {
        if (prev.some((vendor) => vendor._id === newVendor._id)) return prev;
        return [...prev, newVendor];
      });
    });

    socketInstance.on("vendors_update", (updatedVendor: Vendor) => {
      console.log("Updated vendor:", updatedVendor);
      setVendors((prev) =>
        prev.map((vendor) => (vendor._id === updatedVendor._id ? updatedVendor : vendor))
      );
    });

    socketInstance.on("vendors_delete", (data: { _id: string }) => {
      console.log("Deleted vendor:", data._id);
      setVendors((prev) => prev.filter((vendor) => vendor._id !== data._id));
    });

    // Inventory items events
    socketInstance.on("inventory_items_insert", (newItem: InventoryItem) => {
      console.log("New inventory item:", newItem);
      setInventoryItems((prev) => {
        if (prev.some((item) => item._id === newItem._id)) return prev;
        return [...prev, newItem];
      });
    });

    socketInstance.on("inventory_items_update", (updatedItem: InventoryItem) => {
      console.log("Updated inventory item:", updatedItem);
      setInventoryItems((prev) =>
        prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
    });

    socketInstance.on("inventory_items_delete", (data: { _id: string }) => {
      console.log("Deleted inventory item:", data._id);
      setInventoryItems((prev) => prev.filter((item) => item._id !== data._id));
    });

    // Orders events
    socketInstance.on("orders_insert", (newOrder: Order) => {
      console.log("New order:", newOrder);
      setOrders((prev) => {
        if (prev.some((order) => order._id === newOrder._id)) return prev;
        return [...prev, newOrder];
      });
    });

    socketInstance.on("orders_update", (updatedOrder: Order) => {
      console.log("Updated order:", updatedOrder);
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    });

    socketInstance.on("orders_delete", (data: { _id: string }) => {
      console.log("Deleted order:", data._id);
      setOrders((prev) => prev.filter((order) => order._id !== data._id));
    });

    // Vendor items events
    socketInstance.on("vendor_items_insert", (newVendorItem: VendorItem) => {
      console.log("New vendor item:", newVendorItem);
      setVendorItems((prev) => {
        if (prev.some((item) => item._id === newVendorItem._id)) return prev;
        return [...prev, newVendorItem];
      });
    });

    socketInstance.on("vendor_items_update", (updatedVendorItem: VendorItem) => {
      console.log("Updated vendor item:", updatedVendorItem);
      setVendorItems((prev) =>
        prev.map((item) => (item._id === updatedVendorItem._id ? updatedVendorItem : item))
      );
    });

    socketInstance.on("vendor_items_delete", (data: { _id: string }) => {
      console.log("Deleted vendor item:", data._id);
      setVendorItems((prev) => prev.filter((item) => item._id !== data._id));
    });

    // Notifications events
    socketInstance.on("notifications_insert", (newNotification: Notification) => {
      console.log("New notification:", newNotification);
      setNotifications((prev) => {
        if (prev.some((notification) => notification._id === newNotification._id)) return prev;
        return [...prev, newNotification];
      });
    });

    socketInstance.on("notifications_update", (updatedNotification: Notification) => {
      console.log("Updated notification:", updatedNotification);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === updatedNotification._id ? updatedNotification : notification
        )
      );
    });

    socketInstance.on("notifications_delete", (data: { _id: string }) => {
      console.log("Deleted notification:", data._id);
      setNotifications((prev) => prev.filter((notification) => notification._id !== data._id));
    });

    // Logs events
    socketInstance.on("logs_insert", (newLog: Log) => {
      console.log("New log:", newLog);
      setLogs((prev) => {
        if (prev.some((log) => log._id === newLog._id)) return prev;
        return [...prev, newLog];
      });
    });

    socketInstance.on("logs_update", (updatedLog: Log) => {
      console.log("Updated log:", updatedLog);
      setLogs((prev) => prev.map((log) => (log._id === updatedLog._id ? updatedLog : log)));
    });

    socketInstance.on("logs_delete", (data: { _id: string }) => {
      console.log("Deleted log:", data._id);
      setLogs((prev) => prev.filter((log) => log._id !== data._id));
    });

    // Inventory usage events
    socketInstance.on("inventory_usage_insert", (newUsage: InventoryUsage) => {
      console.log("New inventory usage:", newUsage);
      setInventoryUsage((prev) => {
        if (prev.some((usage) => usage._id === newUsage._id)) return prev;
        return [...prev, newUsage];
      });
    });

    socketInstance.on("inventory_usage_update", (updatedUsage: InventoryUsage) => {
      console.log("Updated inventory usage:", updatedUsage);
      setInventoryUsage((prev) =>
        prev.map((usage) => (usage._id === updatedUsage._id ? updatedUsage : usage))
      );
    });

    socketInstance.on("inventory_usage_delete", (data: { _id: string }) => {
      console.log("Deleted inventory usage:", data._id);
      setInventoryUsage((prev) => prev.filter((usage) => usage._id !== data._id));
    });

    // Slack management events
    socketInstance.on("slack_management_insert", (newSlack: SlackManagement) => {
      console.log("New slack management:", newSlack);
      setSlackManagement((prev) => {
        if (prev.some((slack) => slack._id === newSlack._id)) return prev;
        return [...prev, newSlack];
      });
    });

    socketInstance.on("slack_management_update", (updatedSlack: SlackManagement) => {
      console.log("Updated slack management:", updatedSlack);
      setSlackManagement((prev) =>
        prev.map((slack) => (slack._id === updatedSlack._id ? updatedSlack : slack))
      );
    });

    socketInstance.on("slack_management_delete", (data: { _id: string }) => {
      console.log("Deleted slack management:", data._id);
      setSlackManagement((prev) => prev.filter((slack) => slack._id !== data._id));
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
        setError(`Failed to connect to real-time updates: ${err.message}. Please refresh the page.`);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [router]);

  return (
    <WebSocketContext.Provider
      value={{
        users,
        setUsers,
        vendors,
        setVendors,
        inventoryItems,
        setInventoryItems,
        orders,
        setOrders,
        vendorItems,
        setVendorItems,
        notifications,
        setNotifications,
        logs,
        setLogs,
        inventoryUsage,
        setInventoryUsage,
        slackManagement,
        setSlackManagement,
        roles,
        setRoles,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};