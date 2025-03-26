"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Define the shape of the user object
type User = {
  id: string
  name: string
  email: string
  role: string
  department: string
} | null

// Define the shape of the auth context
type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if the user is logged in on mount
  useEffect(() => {
    // In a real app, you would verify the token with your backend
    const token = document.cookie.includes("auth_token")

    if (token) {
      // For demo purposes, we'll just set a dummy user
      setUser({
        id: "1",
        name: "Admin User",
        email: "admin@truman.edu",
        role: "admin",
        department: "U&I Services",
      })
    }

    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call to your backend
      // For demo purposes, we'll just check hardcoded credentials
      if (email === "admin@truman.edu" && password === "truman2025") {
        // Set a cookie to simulate authentication
        document.cookie = "auth_token=dummy_token; path=/; max-age=86400"

        setUser({
          id: "1",
          name: "Admin User",
          email,
          role: "admin",
          department: "U&I Services",
        })

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call to your backend
      // For demo purposes, we'll just simulate a successful registration

      // Set a cookie to simulate authentication
      document.cookie = "auth_token=dummy_token; path=/; max-age=86400"

      setUser({
        id: "2",
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
      })

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear the auth cookie
    document.cookie = "auth_token=; path=/; max-age=0"
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

