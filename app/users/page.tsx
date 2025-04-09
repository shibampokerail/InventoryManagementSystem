"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, PlusCircle, Users, UserPlus, MoreHorizontal, Trash2, Edit, Shield, UserCog, Lock } from "lucide-react"

// Sample data for users
const users = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@truman.edu",
    role: "Admin",
    department: "Student Affairs",
    status: "Active",
    lastActive: "2023-04-05T14:30:00",
    avatar: "SJ",
    permissions: ["manage_inventory", "manage_users", "view_reports", "checkout_items"],
    createdAt: "2022-09-15",
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "m.chen@truman.edu",
    role: "Manager",
    department: "Career Services",
    status: "Active",
    lastActive: "2023-04-04T09:15:00",
    avatar: "MC",
    permissions: ["manage_inventory", "view_reports", "checkout_items"],
    createdAt: "2022-10-03",
  },
  {
    id: "user-3",
    name: "Aisha Patel",
    email: "a.patel@truman.edu",
    role: "Staff",
    department: "Academic Affairs",
    status: "Inactive",
    lastActive: "2023-03-28T11:45:00",
    avatar: "AP",
    permissions: ["view_inventory", "checkout_items"],
    createdAt: "2023-01-12",
  },
  {
    id: "user-4",
    name: "James Wilson",
    email: "j.wilson@truman.edu",
    role: "Staff",
    department: "Athletics",
    status: "Active",
    lastActive: "2023-04-05T10:20:00",
    avatar: "JW",
    permissions: ["view_inventory", "checkout_items"],
    createdAt: "2022-11-08",
  },
  {
    id: "user-5",
    name: "Emma Davis",
    email: "e.davis@truman.edu",
    role: "Student Worker",
    department: "Student Affairs",
    status: "Active",
    lastActive: "2023-04-03T16:45:00",
    avatar: "ED",
    permissions: ["view_inventory", "checkout_items"],
    createdAt: "2023-02-20",
  },
  {
    id: "user-6",
    name: "David Kim",
    email: "d.kim@truman.edu",
    role: "Faculty",
    department: "Computer Science",
    status: "Active",
    lastActive: "2023-04-04T13:10:00",
    avatar: "DK",
    permissions: ["view_inventory", "checkout_items"],
    createdAt: "2022-08-30",
  },
  {
    id: "user-7",
    name: "Olivia Martinez",
    email: "o.martinez@truman.edu",
    role: "Manager",
    department: "Admissions",
    status: "Active",
    lastActive: "2023-04-05T09:30:00",
    avatar: "OM",
    permissions: ["manage_inventory", "view_reports", "checkout_items"],
    createdAt: "2022-07-15",
  },
]

// Sample data for user activity logs
const userActivityLogs = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "Sarah Johnson",
    action: "User Login",
    details: "Successful login from 192.168.1.45",
    timestamp: "2023-04-05T14:30:00",
  },
  {
    id: "log-2",
    userId: "user-1",
    userName: "Sarah Johnson",
    action: "Inventory Update",
    details: "Updated quantity for item INV003 (Tissues) from 10 to 8",
    timestamp: "2023-04-05T14:45:00",
  },
  {
    id: "log-3",
    userId: "user-2",
    userName: "Michael Chen",
    action: "User Login",
    details: "Successful login from 192.168.1.72",
    timestamp: "2023-04-04T09:15:00",
  },
  {
    id: "log-4",
    userId: "user-2",
    userName: "Michael Chen",
    action: "Item Checkout",
    details: "Checked out 1 Projector for Career Fair event",
    timestamp: "2023-04-04T09:30:00",
  },
  {
    id: "log-5",
    userId: "user-4",
    userName: "James Wilson",
    action: "User Login",
    details: "Successful login from 192.168.1.103",
    timestamp: "2023-04-05T10:20:00",
  },
  {
    id: "log-6",
    userId: "user-4",
    userName: "James Wilson",
    action: "Item Checkout",
    details: "Checked out 20 Chairs and 5 Folding Tables for Athletics Meeting",
    timestamp: "2023-04-05T10:35:00",
  },
  {
    id: "log-7",
    userId: "user-7",
    userName: "Olivia Martinez",
    action: "User Login",
    details: "Successful login from 192.168.1.89",
    timestamp: "2023-04-05T09:30:00",
  },
  {
    id: "log-8",
    userId: "user-7",
    userName: "Olivia Martinez",
    action: "Report Generated",
    details: "Generated monthly usage report for March 2023",
    timestamp: "2023-04-05T09:45:00",
  },
]

// Sample data for roles
const roles = [
  {
    id: "role-1",
    name: "Admin",
    description: "Full access to all system features",
    userCount: 1,
    permissions: ["manage_inventory", "manage_users", "view_reports", "checkout_items", "manage_settings"],
  },
  {
    id: "role-2",
    name: "Manager",
    description: "Can manage inventory and view reports",
    userCount: 2,
    permissions: ["manage_inventory", "view_reports", "checkout_items"],
  },
  {
    id: "role-3",
    name: "Staff",
    description: "Can view inventory and check out items",
    userCount: 2,
    permissions: ["view_inventory", "checkout_items"],
  },
  {
    id: "role-4",
    name: "Student Worker",
    description: "Limited access to inventory and checkout",
    userCount: 1,
    permissions: ["view_inventory", "checkout_items"],
  },
  {
    id: "role-5",
    name: "Faculty",
    description: "Can view inventory and check out items",
    userCount: 1,
    permissions: ["view_inventory", "checkout_items"],
  },
]

export default function UsersPage() {
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddingRole, setIsAddingRole] = useState(false)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewUser((prev) => ({ ...prev, [id]: value }))
  }

  const handleRoleChange = (value: string) => {
    setNewUser((prev) => ({ ...prev, role: value }))
  }

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      // You could add error handling here
      return
    }

    // Create new user object
    const newUserObj = {
      id: `user-${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: "Not Specified",
      status: "Active",
      lastActive: new Date().toISOString(),
      avatar: newUser.name
        .split(" ")
        .map((n) => n[0])
        .join(""),
      permissions: [],
      createdAt: new Date().toISOString(),
    }

    // Add user to the list (in a real app, this would be an API call)
    users.push(newUserObj)

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      role: "",
      password: "",
    })
    setIsAddingUser(false)
  }

  // Filter users based on search term, role filter, and status filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesRole && matchesStatus
  })

  // Filter logs based on selected user
  const filteredLogs = selectedUser ? userActivityLogs.filter((log) => log.userId === selectedUser) : userActivityLogs

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-purple-50 dark:bg-purple-950">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-lg text-purple-900 dark:text-purple-50">U&I Services</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">User Management</h2>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">Add New User</DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Create a new user account and set their permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-purple-900 dark:text-purple-50">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newUser.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right text-purple-900 dark:text-purple-50">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@truman.edu"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newUser.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right text-purple-900 dark:text-purple-50">
                      Role
                    </Label>
                    <Select value={newUser.role} onValueChange={handleRoleChange}>
                      <SelectTrigger id="role" className="col-span-3 border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right text-purple-900 dark:text-purple-50">
                      Status
                    </Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch id="status" defaultChecked />
                      <Label htmlFor="status" className="text-purple-900 dark:text-purple-50">
                        Active
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right text-purple-900 dark:text-purple-50">
                      Password
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="border-purple-200 dark:border-purple-800"
                        value={newUser.password}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Password must be at least 8 characters long with a mix of letters, numbers, and symbols.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingUser(false)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleAddUser}>
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-purple-100 dark:bg-purple-900">
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <UserCog className="mr-2 h-4 w-4" />
              User Activity
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <Shield className="mr-2 h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">User Accounts</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Manage user accounts and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                  <div className="flex flex-1 items-center space-x-2">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm border-purple-200 dark:border-purple-800"
                    />
                  </div>
                  <div className="flex flex-row space-x-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border border-purple-200 dark:border-purple-800">
                  <Table>
                    <TableHeader className="bg-purple-100 dark:bg-purple-900">
                      <TableRow>
                        <TableHead className="text-purple-900 dark:text-purple-50">User</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Email</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Role</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-purple-700 dark:text-purple-300">
                            No users found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                            <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 border-2 border-purple-200 dark:border-purple-700">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                                    {user.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-purple-700 dark:text-purple-300">{user.email}</TableCell>
                            <TableCell className="text-purple-700 dark:text-purple-300">
                              <Badge
                                className={
                                  user.role === "Admin"
                                    ? "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100"
                                    : user.role === "Manager"
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                                      : "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.status === "Active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                                }
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">User Activity Logs</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  View recent user activities and system interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
                  <div className="flex flex-1 items-center space-x-2">
                    <Select
                      value={selectedUser || "all"}
                      onValueChange={(value) => setSelectedUser(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-[200px] border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Filter by user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Export Logs
                  </Button>
                </div>

                <div className="rounded-md border border-purple-200 dark:border-purple-800">
                  <Table>
                    <TableHeader className="bg-purple-100 dark:bg-purple-900">
                      <TableRow>
                        <TableHead className="text-purple-900 dark:text-purple-50">User</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Action</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Details</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-purple-700 dark:text-purple-300">
                            No activity logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                            <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                              {log.userName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  log.action === "User Login"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                                    : log.action === "Inventory Update"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                                      : log.action === "Item Checkout"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                                        : "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100"
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-purple-700 dark:text-purple-300 max-w-xs truncate">
                              {log.details}
                            </TableCell>
                            <TableCell className="text-purple-700 dark:text-purple-300">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-purple-900 dark:text-purple-50">Roles & Permissions</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Manage user roles and their associated permissions
                  </CardDescription>
                </div>
                <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                    <DialogHeader>
                      <DialogTitle className="text-purple-900 dark:text-purple-50">Add New Role</DialogTitle>
                      <DialogDescription className="text-purple-700 dark:text-purple-300">
                        Create a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role-name" className="text-right text-purple-900 dark:text-purple-50">
                          Role Name
                        </Label>
                        <Input
                          id="role-name"
                          placeholder="e.g., Department Manager"
                          className="col-span-3 border-purple-200 dark:border-purple-800"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role-description" className="text-right text-purple-900 dark:text-purple-50">
                          Description
                        </Label>
                        <Input
                          id="role-description"
                          placeholder="Brief description of this role"
                          className="col-span-3 border-purple-200 dark:border-purple-800"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right text-purple-900 dark:text-purple-50 pt-2">Permissions</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-view-inventory" />
                            <Label htmlFor="perm-view-inventory" className="text-purple-900 dark:text-purple-50">
                              View Inventory
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-manage-inventory" />
                            <Label htmlFor="perm-manage-inventory" className="text-purple-900 dark:text-purple-50">
                              Manage Inventory
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-checkout-items" />
                            <Label htmlFor="perm-checkout-items" className="text-purple-900 dark:text-purple-50">
                              Checkout Items
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-view-reports" />
                            <Label htmlFor="perm-view-reports" className="text-purple-900 dark:text-purple-50">
                              View Reports
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-manage-users" />
                            <Label htmlFor="perm-manage-users" className="text-purple-900 dark:text-purple-50">
                              Manage Users
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="perm-manage-settings" />
                            <Label htmlFor="perm-manage-settings" className="text-purple-900 dark:text-purple-50">
                              Manage Settings
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingRole(false)}
                        className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        Cancel
                      </Button>
                      <Button className="bg-purple-700 hover:bg-purple-800 text-white">Add Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-purple-200 dark:border-purple-800">
                  <Table>
                    <TableHeader className="bg-purple-100 dark:bg-purple-900">
                      <TableRow>
                        <TableHead className="text-purple-900 dark:text-purple-50">Role</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Description</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Users</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Permissions</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                          <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4 text-purple-700 dark:text-purple-300" />
                              {role.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{role.description}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{role.userCount}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((permission, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-700"
                                >
                                  {permission.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Role</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>View Users</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">
                  <div className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                    Permission Settings
                  </div>
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Configure global permission settings and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Security Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="two-factor" className="text-purple-900 dark:text-purple-50">
                          Require Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Enforce 2FA for admin and manager roles
                        </p>
                      </div>
                      <Switch id="two-factor" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="password-policy" className="text-purple-900 dark:text-purple-50">
                          Strong Password Policy
                        </Label>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Require complex passwords with minimum 8 characters
                        </p>
                      </div>
                      <Switch id="password-policy" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="session-timeout" className="text-purple-900 dark:text-purple-50">
                          Session Timeout
                        </Label>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Automatically log out inactive users after 30 minutes
                        </p>
                      </div>
                      <Switch id="session-timeout" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
