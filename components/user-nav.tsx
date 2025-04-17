"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes"
export function UserNav() {
  const router = useRouter();
  const { theme, setTheme } = useTheme()

  // Initialize theme based on system preference or saved preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage");
      } else {
        // Call Flask server to revoke the JWT token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to revoke token on Flask server:", response.statusText);
        } else {
          console.log("Token revoked on Flask server");
        }
      }

      // Clear local storage
      localStorage.removeItem("token");

      // Clear the auth cookie (if any)
      document.cookie = "auth_token=; path=/; max-age=0";

      // Log out from Auth0 and redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="bg-purple-700 hover:bg-purple-800 text-white"
      >
      <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.href = "/api/auth/logout";
              }}
              
            >
              Logout
            </a>
      </Button>
    </div>
  );
}