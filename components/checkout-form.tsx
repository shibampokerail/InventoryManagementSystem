// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { CalendarIcon, Plus, Trash2, CheckCircle, RotateCcw } from "lucide-react"
// import { format } from "date-fns"
// import { useInventory } from "@/context/inventory-context"
// import { useToast } from "@/components/ui/use-toast"

// export function CheckoutForm() {
//   const { inventoryItems, checkoutItem, returnItem, checkoutHistory } = useInventory()
//   const { toast } = useToast()

//   const [selectedItems, setSelectedItems] = useState<Array<{ id: string; name: string; quantity: number }>>([])
//   const [selectedItem, setSelectedItem] = useState("")
//   const [quantity, setQuantity] = useState(1)
//   const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(new Date())
//   const [returnDate, setReturnDate] = useState<Date | undefined>(new Date())
//   const [activeTab, setActiveTab] = useState("checkout") // checkout or history
//   const [eventName, setEventName] = useState("")
//   const [department, setDepartment] = useState("")
//   const [location, setLocation] = useState("")
//   const [userName, setUserName] = useState("")
//   const [email, setEmail] = useState("")

//   // Filter to only show available items (quantity > 0)
//   const availableItems = inventoryItems.filter((item) => item.quantity > 0)

//   const handleAddItem = () => {
//     if (!selectedItem) return

//     const itemToAdd = availableItems.find((item) => item.id === selectedItem)
//     if (!itemToAdd) return

//     // Check if we already have this item in our selection
//     const existingItemIndex = selectedItems.findIndex((item) => item.id === selectedItem)

//     if (existingItemIndex >= 0) {
//       // Update quantity if item already exists
//       const updatedItems = [...selectedItems]
//       updatedItems[existingItemIndex].quantity += quantity
//       setSelectedItems(updatedItems)
//     } else {
//       // Add new item
//       setSelectedItems([...selectedItems, { id: itemToAdd.id, name: itemToAdd.name, quantity }])
//     }

//     // Reset selection
//     setSelectedItem("")
//     setQuantity(1)
//   }

//   const handleRemoveItem = (id: string) => {
//     setSelectedItems(selectedItems.filter((item) => item.id !== id))
//   }

//   const handleSubmitCheckout = () => {
//     // Validate form
//     if (!eventName || !department || !location || selectedItems.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields and select at least one item.",
//         variant: "destructive",
//       })
//       return
//     }

//     // Process each selected item
//     selectedItems.forEach((item) => {
//       checkoutItem(item.id, item.quantity, eventName, {
//         requestedBy: userName || "Admin User",
//         department,
//         returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
//         location,
//       })
//     })

//     // Show success message
//     toast({
//       title: "Items Checked Out",
//       description: `${selectedItems.length} item(s) have been checked out for ${eventName}`,
//       variant: "success",
//     })

//     // Reset form
//     setSelectedItems([])
//     setEventName("")
//     setDepartment("")
//     setLocation("")
//     setActiveTab("history") // Switch to history tab to show the new checkout
//   }

//   const handleReturnItems = (checkoutId: string) => {
//     // Find the checkout record
//     const checkout = checkoutHistory.find((c) => c.id === checkoutId)

//     if (checkout) {
//       // In a real app, you would get the actual items from the checkout record
//       // For this demo, we'll return the first item in the checkout
//       if (checkout.items.length > 0) {
//         const firstItem = checkout.items[0]
//         const itemToReturn = inventoryItems.find((item) => item.name === firstItem.name)

//         if (itemToReturn) {
//           returnItem(itemToReturn.id, firstItem.quantity)

//           toast({
//             title: "Items Returned",
//             description: "The items have been successfully returned to inventory.",
//             variant: "success",
//           })
//         }
//       }
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex space-x-4">
//         <Button
//           onClick={() => setActiveTab("checkout")}
//           variant={activeTab === "checkout" ? "default" : "outline"}
//           className={
//             activeTab === "checkout"
//               ? "bg-purple-700 hover:bg-purple-800"
//               : "border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
//           }
//         >
//           New Checkout
//         </Button>
//         <Button
//           onClick={() => setActiveTab("history")}
//           variant={activeTab === "history" ? "default" : "outline"}
//           className={
//             activeTab === "history"
//               ? "bg-purple-700 hover:bg-purple-800"
//               : "border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
//           }
//         >
//           Checkout History
//         </Button>
//       </div>

//       {activeTab === "checkout" ? (
//         <div className="grid gap-6 md:grid-cols-2">
//           <div>
//             <Card className="border-purple-200 dark:border-purple-800">
//               <CardHeader>
//                 <CardTitle className="text-purple-900 dark:text-purple-50">Request Information</CardTitle>
//                 <CardDescription className="text-purple-700 dark:text-purple-300">
//                   Provide details about your event
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
//                     Your Name
//                   </Label>
//                   <Input
//                     id="name"
//                     placeholder="Enter your name"
//                     className="border-purple-200 dark:border-purple-800"
//                     value={userName}
//                     onChange={(e) => setUserName(e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-purple-900 dark:text-purple-50">
//                     Email
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="your.email@truman.edu"
//                     className="border-purple-200 dark:border-purple-800"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="department" className="text-purple-900 dark:text-purple-50">
//                     Department
//                   </Label>
//                   <Select value={department} onValueChange={setDepartment}>
//                     <SelectTrigger id="department" className="border-purple-200 dark:border-purple-800">
//                       <SelectValue placeholder="Select department" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="student-affairs">Student Affairs</SelectItem>
//                       <SelectItem value="academic-affairs">Academic Affairs</SelectItem>
//                       <SelectItem value="athletics">Athletics</SelectItem>
//                       <SelectItem value="admissions">Admissions</SelectItem>
//                       <SelectItem value="student-org">Student Organization</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="event" className="text-purple-900 dark:text-purple-50">
//                     Event Name
//                   </Label>
//                   <Input
//                     id="event"
//                     placeholder="Name of your event"
//                     className="border-purple-200 dark:border-purple-800"
//                     value={eventName}
//                     onChange={(e) => setEventName(e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">
//                     Event Location
//                   </Label>
//                   <Input
//                     id="location"
//                     placeholder="Where will the event be held?"
//                     className="border-purple-200 dark:border-purple-800"
//                     value={location}
//                     onChange={(e) => setLocation(e.target.value)}
//                   />
//                 </div>

//                 <div className="grid gap-4 grid-cols-2">
//                   <div className="space-y-2">
//                     <Label htmlFor="checkout-date" className="text-purple-900 dark:text-purple-50">
//                       Checkout Date
//                     </Label>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="w-full justify-start text-left font-normal border-purple-200 dark:border-purple-800"
//                         >
//                           <CalendarIcon className="mr-2 h-4 w-4" />
//                           {checkoutDate ? format(checkoutDate, "PPP") : <span>Pick a date</span>}
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0">
//                         <Calendar mode="single" selected={checkoutDate} onSelect={setCheckoutDate} initialFocus />
//                       </PopoverContent>
//                     </Popover>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="return-date" className="text-purple-900 dark:text-purple-50">
//                       Return Date
//                     </Label>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="w-full justify-start text-left font-normal border-purple-200 dark:border-purple-800"
//                         >
//                           <CalendarIcon className="mr-2 h-4 w-4" />
//                           {returnDate ? format(returnDate, "PPP") : <span>Pick a date</span>}
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0">
//                         <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
//                       </PopoverContent>
//                     </Popover>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="notes" className="text-purple-900 dark:text-purple-50">
//                     Additional Notes
//                   </Label>
//                   <Textarea
//                     id="notes"
//                     placeholder="Any special requirements or instructions"
//                     className="min-h-[100px] border-purple-200 dark:border-purple-800"
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div>
//             <Card className="border-purple-200 dark:border-purple-800">
//               <CardHeader>
//                 <CardTitle className="text-purple-900 dark:text-purple-50">Select Items</CardTitle>
//                 <CardDescription className="text-purple-700 dark:text-purple-300">
//                   Choose items you need for your event
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex space-x-2">
//                   <Select value={selectedItem} onValueChange={setSelectedItem}>
//                     <SelectTrigger className="flex-1 border-purple-200 dark:border-purple-800">
//                       <SelectValue placeholder="Select an item" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {availableItems.map((item) => (
//                         <SelectItem key={item.id} value={item.id}>
//                           {item.name} ({item.quantity} available)
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   <Input
//                     type="number"
//                     min="1"
//                     value={quantity}
//                     onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
//                     className="w-20 border-purple-200 dark:border-purple-800"
//                   />

//                   <Button onClick={handleAddItem} className="bg-purple-700 hover:bg-purple-800">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 <div className="rounded-md border border-purple-200 dark:border-purple-800">
//                   <Table>
//                     <TableHeader className="bg-purple-100 dark:bg-purple-900">
//                       <TableRow>
//                         <TableHead className="text-purple-900 dark:text-purple-50">Item</TableHead>
//                         <TableHead className="text-purple-900 dark:text-purple-50">Quantity</TableHead>
//                         <TableHead className="text-purple-900 dark:text-purple-50 w-[100px]">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {selectedItems.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={3} className="text-center text-purple-700 dark:text-purple-300 py-4">
//                             No items selected yet
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         selectedItems.map((item) => (
//                           <TableRow key={item.id}>
//                             <TableCell className="font-medium text-purple-900 dark:text-purple-50">
//                               {item.name}
//                             </TableCell>
//                             <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
//                             <TableCell>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => handleRemoveItem(item.id)}
//                                 className="h-8 w-8 p-0 text-red-500"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={handleSubmitCheckout}>
//                   Submit Request
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       ) : (
//         <Card className="border-purple-200 dark:border-purple-800">
//           <CardHeader>
//             <CardTitle className="text-purple-900 dark:text-purple-50">Recent Checkouts</CardTitle>
//             <CardDescription className="text-purple-700 dark:text-purple-300">
//               View and manage your current and past checkouts
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {checkoutHistory.length === 0 ? (
//                 <div className="text-center py-8 text-purple-700 dark:text-purple-300">
//                   No checkout history found. Start by checking out some items.
//                 </div>
//               ) : (
//                 checkoutHistory.map((checkout) => (
//                   <div key={checkout.id} className="rounded-lg border border-purple-200 p-4 dark:border-purple-800">
//                     <div className="flex items-center justify-between mb-4">
//                       <div>
//                         <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">{checkout.event}</h3>
//                         <p className="text-sm text-purple-700 dark:text-purple-300">
//                           {checkout.requestedBy} • {checkout.department}
//                         </p>
//                       </div>
//                       <Badge
//                         className={
//                           checkout.status === "Active"
//                             ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
//                             : "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
//                         }
//                       >
//                         {checkout.status}
//                       </Badge>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <p className="text-sm font-medium text-purple-900 dark:text-purple-50">Checkout Date</p>
//                         <p className="text-sm text-purple-700 dark:text-purple-300">{checkout.checkoutDate}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-purple-900 dark:text-purple-50">Return Date</p>
//                         <p className="text-sm text-purple-700 dark:text-purple-300">{checkout.returnDate}</p>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <p className="text-sm font-medium text-purple-900 dark:text-purple-50 mb-2">Items</p>
//                       <ul className="space-y-1">
//                         {checkout.items.map((item, index) => (
//                           <li key={index} className="text-sm text-purple-700 dark:text-purple-300">
//                             {item.quantity} × {item.name}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     <div className="flex justify-end">
//                       {checkout.status === "Active" ? (
//                         <Button
//                           variant="outline"
//                           className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
//                           onClick={() => handleReturnItems(checkout.id)}
//                         >
//                           <RotateCcw className="mr-2 h-4 w-4" />
//                           Return Items
//                         </Button>
//                       ) : (
//                         <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
//                           <CheckCircle className="mr-2 h-4 w-4" />
//                           Returned
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }
