"use client"
// API service for inventory management



export async function fetchInventoryItems() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-items`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
      
        
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
      return [];
    }
  }
  
export async function fetchInventoryUsageLogs() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-usage`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
      
        
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
      return [];
    }
  }