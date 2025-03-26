"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Package, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Demo credentials for easy testing
      if (email === "admin@truman.edu" && password === "truman2025") {
        // Set a cookie to simulate authentication
        document.cookie = "auth_token=dummy_token; path=/; max-age=86400"

        // Set login success state
        setLoginSuccess(true)

        // Force redirect to dashboard after a short delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = "/"
        }, 500)
      } else {
        setError("Invalid email or password")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Package className="h-10 w-10 text-purple-700 dark:text-purple-300 mr-2" />
          <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-50">U&I Services</h1>
        </div>

        <Card className="border-purple-200 dark:border-purple-800 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-purple-900 dark:text-purple-50">
              Sign in
            </CardTitle>
            <CardDescription className="text-center text-purple-700 dark:text-purple-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginSuccess ? (
              <div className="p-4 rounded-md bg-green-50 text-green-600 text-sm dark:bg-green-900/30 dark:text-green-300">
                Login successful! Redirecting to dashboard...
                <div className="mt-4">
                  <Link
                    href="/"
                    className="block w-full text-center py-2 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-md"
                  >
                    Click here if not redirected
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm dark:bg-red-900/30 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-900 dark:text-purple-50">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@truman.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-purple-200 dark:border-purple-800"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-purple-900 dark:text-purple-50">
                      Password
                    </Label>
                    <Link
                      href="#"
                      className="text-sm text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-purple-200 dark:border-purple-800 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-purple-900 dark:text-purple-50"
                  >
                    Remember me
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-purple-700 dark:text-purple-300">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
              >
                Sign up
              </Link>
            </div>

            <div className="text-xs text-center text-purple-600 dark:text-purple-400">
              By signing in, you agree to our{" "}
              <Link href="#" className="underline hover:text-purple-900 dark:hover:text-purple-100">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-purple-900 dark:hover:text-purple-100">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-purple-600 dark:text-purple-400">
          © {new Date().getFullYear()} Truman State University. All rights reserved.
        </div>
      </div>
    </div>
  )
}

