"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "",
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.department ||
      !formData.role
    ) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1500)
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
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-purple-700 dark:text-purple-300">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-purple-200 dark:border-purple-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-900 dark:text-purple-50">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@truman.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-purple-200 dark:border-purple-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-purple-900 dark:text-purple-50">
                    Department
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger id="department" className="border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student-affairs">Student Affairs</SelectItem>
                      <SelectItem value="academic-affairs">Academic Affairs</SelectItem>
                      <SelectItem value="athletics">Athletics</SelectItem>
                      <SelectItem value="admissions">Admissions</SelectItem>
                      <SelectItem value="student-org">Student Organization</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-purple-900 dark:text-purple-50">
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger id="role" className="border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="student">Student Worker</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-900 dark:text-purple-50">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-900 dark:text-purple-50">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="border-purple-200 dark:border-purple-800 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1 data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-purple-900 dark:text-purple-50"
                >
                  I agree to the{" "}
                  <Link
                    href="#"
                    className="text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100 underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100 underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-purple-700 dark:text-purple-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-purple-600 dark:text-purple-400">
          © Truman State University. All rights reserved.
        </div>
      </div>
    </div>
  )
}

