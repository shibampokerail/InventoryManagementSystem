"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import { Package, User, Shield, Clock, Upload, Save, Eye, EyeOff } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Sample user data
const userData = {
  name: "Admin User",
  email: "admin@truman.edu",
  role: "Administrator",
  department: "U&I Services",
  phone: "(555) 123-4567",
  bio: "System administrator responsible for inventory management and user access control.",
  joinDate: "September 15, 2022",
  lastLogin: "April 5, 2023 at 2:30 PM",
  avatar: "AD",
}

// Sample login history
const loginHistory = [
  {
    id: "login-1",
    date: "April 5, 2023",
    time: "2:30 PM",
    device: "Chrome on Windows",
    ipAddress: "192.168.1.45",
    status: "Success",
  },
  {
    id: "login-2",
    date: "April 4, 2023",
    time: "9:15 AM",
    device: "Chrome on Windows",
    ipAddress: "192.168.1.45",
    status: "Success",
  },
  {
    id: "login-3",
    date: "April 3, 2023",
    time: "4:45 PM",
    device: "Safari on iPhone",
    ipAddress: "172.20.10.2",
    status: "Success",
  },
  {
    id: "login-4",
    date: "April 2, 2023",
    time: "10:20 AM",
    device: "Chrome on Windows",
    ipAddress: "192.168.1.45",
    status: "Success",
  },
  {
    id: "login-5",
    date: "April 1, 2023",
    time: "8:05 AM",
    device: "Firefox on Windows",
    ipAddress: "192.168.1.45",
    status: "Failed",
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState({ ...userData })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    setIsEditing(false)
    // Update the userData with the new values
  }

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
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">My Profile</h2>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={() => setIsEditing(true)}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="bg-purple-100 dark:bg-purple-900">
            <TabsTrigger value="personal" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <User className="mr-2 h-4 w-4" />
              Personal Information
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
              <Clock className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Profile Information</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  {isEditing ? "Update your personal information" : "View your personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 border-4 border-purple-200 dark:border-purple-700">
                      <AvatarImage src="/placeholder.svg?height=128&width=128" alt={profileData.name} />
                      <AvatarFallback className="text-3xl bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                        {profileData.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
                          Full Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="border-purple-200 dark:border-purple-800"
                          />
                        ) : (
                          <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.name}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-900 dark:text-purple-50">
                          Email Address
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="border-purple-200 dark:border-purple-800"
                          />
                        ) : (
                          <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.email}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-purple-900 dark:text-purple-50">
                          Role
                        </Label>
                        {isEditing ? (
                          <Select disabled defaultValue={profileData.role}>
                            <SelectTrigger className="border-purple-200 dark:border-purple-800">
                              <SelectValue placeholder={profileData.role} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Administrator">Administrator</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-purple-900 dark:text-purple-50 font-medium">
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100">
                              {profileData.role}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-purple-900 dark:text-purple-50">
                          Department
                        </Label>
                        {isEditing ? (
                          <Select defaultValue={profileData.department}>
                            <SelectTrigger className="border-purple-200 dark:border-purple-800">
                              <SelectValue placeholder={profileData.department} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="U&I Services">U&I Services</SelectItem>
                              <SelectItem value="Student Affairs">Student Affairs</SelectItem>
                              <SelectItem value="Academic Affairs">Academic Affairs</SelectItem>
                              <SelectItem value="Athletics">Athletics</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-purple-900 dark:text-purple-50 font-medium">
                            {profileData.department}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-purple-900 dark:text-purple-50">
                          Phone Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="border-purple-200 dark:border-purple-800"
                          />
                        ) : (
                          <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.phone}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joinDate" className="text-purple-900 dark:text-purple-50">
                          Join Date
                        </Label>
                        <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.joinDate}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-purple-900 dark:text-purple-50">
                        Bio
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          className="min-h-[100px] border-purple-200 dark:border-purple-800"
                        />
                      ) : (
                        <div className="text-purple-900 dark:text-purple-50">{profileData.bio}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setProfileData({ ...userData }) // Reset to original data
                    }}
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Change Password</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Update your password to maintain account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-purple-900 dark:text-purple-50">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      className="pr-10 border-purple-200 dark:border-purple-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-purple-900 dark:text-purple-50">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="pr-10 border-purple-200 dark:border-purple-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Password must be at least 8 characters long with a mix of letters, numbers, and symbols.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-purple-900 dark:text-purple-50">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="pr-10 border-purple-200 dark:border-purple-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">Update Password</Button>
              </CardFooter>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">
                      Enable Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Protect your account with an additional security layer using an authenticator app
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Recovery Codes</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Generate backup codes to access your account if you lose your device
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Generate Codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Sessions</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Manage your active sessions and sign out from other devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border border-purple-200 dark:border-purple-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium text-purple-900 dark:text-purple-50">Current Session</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Chrome on Windows • 192.168.1.45</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Active now</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                        Current
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-md border border-purple-200 dark:border-purple-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium text-purple-900 dark:text-purple-50">Safari on iPhone</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">172.20.10.2</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Last active: April 3, 2023</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  Sign Out From All Devices
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Login History</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Recent login activity for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-purple-200 dark:border-purple-800">
                  <Table>
                    <TableHeader className="bg-purple-100 dark:bg-purple-900">
                      <TableRow>
                        <TableHead className="text-purple-900 dark:text-purple-50">Date</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Time</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Device</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">IP Address</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.map((login) => (
                        <TableRow key={login.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                          <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                            {login.date}
                          </TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{login.time}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{login.device}</TableCell>
                          <TableCell className="text-purple-700 dark:text-purple-300">{login.ipAddress}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                login.status === "Success"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                              }
                            >
                              {login.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  View Full History
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Account Activity</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Recent actions performed by your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-800">
                      <User className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-50">Profile Updated</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        You updated your profile information
                      </p>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">April 3, 2023</div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-800">
                      <Shield className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-50">Password Changed</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">You changed your password</p>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">March 28, 2023</div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-800">
                      <Package className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-50">Inventory Updated</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        You updated the quantity for item INV003 (Tissues)
                      </p>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">March 25, 2023</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
