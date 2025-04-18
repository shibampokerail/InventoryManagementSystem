import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { WebSocketProvider } from "@/context/WebSocketContext";
import { FlaskProvider } from "@/context/FlaskProvider";
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "U&I Services - Truman State University",
  description: "Inventory Management System for U&I Services at Truman State University",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <UserProvider>
        
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <FlaskProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
         </FlaskProvider>
            <Toaster />
        </ThemeProvider>
      </body>
      
      </UserProvider>
    </html>
  )
}
