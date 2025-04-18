"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function WelcomePage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 dark:bg-purple-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-purple-200 dark:border-purple-800 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Package className="h-8 w-8 text-purple-700 dark:text-purple-300" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-50">
              Welcome to the Inventory Management System
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300 mt-2">
              Truman State University U&I Services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert
              variant="default"
              className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Required</AlertTitle>
              <AlertDescription>
                You have not yet been added to the system. Please contact the administrator to get access.
              </AlertDescription>
            </Alert>

            <div className="text-center text-purple-800 dark:text-purple-200 space-y-2">
              <p>Your account is pending approval.</p>
              <p>For immediate assistance, please contact:</p>
              <p className="font-semibold">union@truman.edu</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2">
              <a href="/api/auth/logout"> Logout</a>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-purple-600 dark:text-purple-400">
          © {new Date().getFullYear()} Truman State University. All rights reserved.
        </div>
      </div>
    </div>
  )
}
