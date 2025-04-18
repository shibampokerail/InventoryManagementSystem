// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { useInventory, type CheckoutRecord } from "@/context/inventory-context"
// import { ArrowLeft, Calendar, Package, Search, User } from "lucide-react"
// import Link from "next/link"
// import { useState } from "react"

// export default function UpcomingReturnsPage() {
//   const { checkoutHistory } = useInventory()
//   const [searchTerm, setSearchTerm] = useState("")

//   // Get current date and date 48 hours from now
//   const currentDate = new Date()
//   const futureDate = new Date(currentDate)
//   futureDate.setHours(currentDate.getHours() + 48)

//   // Filter for active checkouts with return dates within the next 48 hours
//   const upcomingReturns = checkoutHistory.filter((checkout: CheckoutRecord) => {
//     if (checkout.status !== "Active") return false

//     const returnDate = new Date(checkout.returnDate)
//     return returnDate <= futureDate && returnDate >= currentDate
//   })

//   // Filter by search term
//   const filteredReturns = upcomingReturns.filter((checkout: CheckoutRecord) => {
//     const searchLower = searchTerm.toLowerCase()
//     return (
//       checkout.event.toLowerCase().includes(searchLower) ||
//       checkout.requestedBy.toLowerCase().includes(searchLower) ||
//       checkout.department.toLowerCase().includes(searchLower) ||
//       checkout.items.some((item: { name: string; quantity: number }) => item.name.toLowerCase().includes(searchLower))
//     )
//   })

//   return (
//     <div className="flex min-h-screen flex-col bg-purple-50/50 dark:bg-purple-950/50">
//       <div className="flex-1 space-y-4 p-8 pt-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <Link href="/">
//               <Button variant="outline" size="icon" className="h-8 w-8">
//                 <ArrowLeft className="h-4 w-4" />
//               </Button>
//             </Link>
//             <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Upcoming Returns</h2>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="relative w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500 dark:text-purple-400" />
//               <Input
//                 type="search"
//                 placeholder="Search returns..."
//                 className="w-full bg-white pl-8 dark:bg-purple-900"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-4">
//           {filteredReturns.length > 0 ? (
//             filteredReturns.map((checkout: CheckoutRecord) => (
//               <Card key={checkout.id} className="border-purple-200 dark:border-purple-800">
//                 <CardHeader className="pb-2">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-xl text-purple-900 dark:text-purple-50">{checkout.event}</CardTitle>
//                     <div className="flex items-center space-x-2 text-sm font-medium text-purple-700 dark:text-purple-300">
//                       <Calendar className="h-4 w-4" />
//                       <span>Due: {checkout.returnDate}</span>
//                     </div>
//                   </div>
//                   <CardDescription className="flex items-center space-x-1 text-purple-700 dark:text-purple-300">
//                     <User className="h-3.5 w-3.5" />
//                     <span>
//                       {checkout.requestedBy} • {checkout.department}
//                     </span>
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <h4 className="font-medium text-purple-900 dark:text-purple-50">Items to be returned:</h4>
//                     <div className="grid gap-2">
//                       {checkout.items.map((item: { name: string; quantity: number }, index: number) => (
//                         <div
//                           key={index}
//                           className="flex items-center justify-between rounded-md bg-purple-100 p-2 dark:bg-purple-900"
//                         >
//                           <div className="flex items-center space-x-2">
//                             <Package className="h-4 w-4 text-purple-700 dark:text-purple-300" />
//                             <span className="font-medium text-purple-900 dark:text-purple-50">{item.name}</span>
//                           </div>
//                           <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
//                             Qty: {item.quantity}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="mt-4 flex justify-end">
//                       <Button className="bg-purple-700 hover:bg-purple-800 text-white">Process Return</Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           ) : (
//             <Card className="border-purple-200 dark:border-purple-800">
//               <CardContent className="flex h-40 flex-col items-center justify-center space-y-2 text-center">
//                 <Calendar className="h-8 w-8 text-purple-400" />
//                 <h3 className="text-xl font-medium text-purple-900 dark:text-purple-50">No upcoming returns</h3>
//                 <p className="text-sm text-purple-700 dark:text-purple-300">
//                   {searchTerm
//                     ? "No returns match your search criteria."
//                     : "There are no items due for return in the next 48 hours."}
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
