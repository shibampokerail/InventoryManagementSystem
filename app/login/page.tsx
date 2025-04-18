"use client"

import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function IntroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 dark:from-purple-950 dark:to-purple-900 px-4">
      <div className="max-w-2xl text-center p-8 bg-white dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
        <div className="flex justify-center mb-4">
          <Package className="h-12 w-12 text-purple-700 dark:text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-50 mb-4">
          Welcome to the Inventory Management System
        </h1>
        <p className="text-lg text-purple-800 dark:text-purple-200 mb-6">
          of Union and Involvement Services at Truman State University.
        </p>
        <p className="text-md text-purple-700 dark:text-purple-300 mb-8">
          Manage resources, track assets, and stay organized with a secure login powered by Auth0.
        </p>

        <Link href="/authapi/auth/login">
          <Button className="px-8 py-3 text-lg bg-purple-700 hover:bg-purple-800 text-white rounded-full">
            Continue to Login
          </Button>
        </Link>

        <div className="mt-10 text-sm text-purple-600 dark:text-purple-400">
          © {new Date().getFullYear()} Truman State University. All rights reserved.
        </div>
      </div>
    </div>
  )
}
