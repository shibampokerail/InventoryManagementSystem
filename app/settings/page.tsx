"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

import { Package, SettingsIcon, Moon, Sun, BellRing, Database, Save, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
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
            <UserNav />
          </div>
        </div>
      </div> 
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">Settings</h2>
          <div className="flex items-center space-x-2">
            <Button
              className="bg-purple-700 hover:bg-purple-800 text-white"
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-purple-100 dark:bg-purple-900">
            <TabsTrigger value="general" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
              <SettingsIcon className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              <Sun className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300"
            >
              <BellRing className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:text-purple-100 dark:data-[state=inactive]:text-purple-300">
              <Database className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">General Settings</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Configure your basic application preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-purple-900 dark:text-purple-50">
                    Language
                  </Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language" className="border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-purple-900 dark:text-purple-50">
                    Timezone
                  </Label>
                  <Select defaultValue="america-chicago">
                    <SelectTrigger id="timezone" className="border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-chicago">America/Chicago (UTC-06:00)</SelectItem>
                      <SelectItem value="america-new_york">America/New_York (UTC-05:00)</SelectItem>
                      <SelectItem value="america-los_angeles">America/Los_Angeles (UTC-08:00)</SelectItem>
                      <SelectItem value="europe-london">Europe/London (UTC+00:00)</SelectItem>
                      <SelectItem value="asia-tokyo">Asia/Tokyo (UTC+09:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Session Settings</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-logout" className="text-purple-900 dark:text-purple-50">
                        Auto Logout
                      </Label>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Automatically log out after period of inactivity
                      </p>
                    </div>
                    <Switch id="auto-logout" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout" className="text-purple-900 dark:text-purple-50">
                      Session Timeout
                    </Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="session-timeout" className="border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Select timeout period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Regional Settings</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Configure regional preferences for date, time, and number formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date-format" className="text-purple-900 dark:text-purple-50">
                    Date Format
                  </Label>
                  <RadioGroup defaultValue="mm-dd-yyyy" className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mm-dd-yyyy" id="mm-dd-yyyy" />
                      <Label htmlFor="mm-dd-yyyy" className="text-purple-900 dark:text-purple-50">
                        MM/DD/YYYY (e.g., 04/15/2023)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dd-mm-yyyy" id="dd-mm-yyyy" />
                      <Label htmlFor="dd-mm-yyyy" className="text-purple-900 dark:text-purple-50">
                        DD/MM/YYYY (e.g., 15/04/2023)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yyyy-mm-dd" id="yyyy-mm-dd" />
                      <Label htmlFor="yyyy-mm-dd" className="text-purple-900 dark:text-purple-50">
                        YYYY-MM-DD (e.g., 2023-04-15)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format" className="text-purple-900 dark:text-purple-50">
                    Time Format
                  </Label>
                  <RadioGroup defaultValue="12h" className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="12h" id="12h" />
                      <Label htmlFor="12h" className="text-purple-900 dark:text-purple-50">
                        12-hour (e.g., 2:30 PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24h" id="24h" />
                      <Label htmlFor="24h" className="text-purple-900 dark:text-purple-50">
                        24-hour (e.g., 14:30)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Theme Settings</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-purple-900 dark:text-purple-50">Color Theme</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-md border cursor-pointer transition-all ${
                        theme === "light"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="h-20 w-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2">
                        <Sun className="h-10 w-10 text-yellow-500" />
                      </div>
                      <span className="text-purple-900 dark:text-purple-50 font-medium">Light</span>
                    </div>

                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-md border cursor-pointer transition-all ${
                        theme === "dark"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="h-20 w-20 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-2">
                        <Moon className="h-10 w-10 text-gray-100" />
                      </div>
                      <span className="text-purple-900 dark:text-purple-50 font-medium">Dark</span>
                    </div>

                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-md border cursor-pointer transition-all ${
                        theme === "system"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                      onClick={() => setTheme("system")}
                    >
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-white to-gray-900 border border-gray-300 flex items-center justify-center mb-2">
                        <div className="flex">
                          <Sun className="h-8 w-8 text-yellow-500" />
                          <Moon className="h-8 w-8 text-gray-100 -ml-2" />
                        </div>
                      </div>
                      <span className="text-purple-900 dark:text-purple-50 font-medium">System</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Accessibility</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reduced-motion" className="text-purple-900 dark:text-purple-50">
                        Reduce Motion
                      </Label>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Minimize animations throughout the interface
                      </p>
                    </div>
                    <Switch id="reduced-motion" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="high-contrast" className="text-purple-900 dark:text-purple-50">
                        High Contrast
                      </Label>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch id="high-contrast" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Notification Preferences</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Email Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-purple-900 dark:text-purple-50">
                        Enable Email Notifications
                      </Label>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  {emailNotifications && (
                    <div className="space-y-2 pl-6 border-l-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-inventory" defaultChecked />
                        <Label htmlFor="email-inventory" className="text-purple-900 dark:text-purple-50">
                          Inventory updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-checkout" defaultChecked />
                        <Label htmlFor="email-checkout" className="text-purple-900 dark:text-purple-50">
                          Item checkouts and returns
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-low-stock" defaultChecked />
                        <Label htmlFor="email-low-stock" className="text-purple-900 dark:text-purple-50">
                          Low stock alerts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-system" />
                        <Label htmlFor="email-system" className="text-purple-900 dark:text-purple-50">
                          System notifications
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Push Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-purple-900 dark:text-purple-50">
                        Enable Push Notifications
                      </Label>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  {pushNotifications && (
                    <div className="space-y-2 pl-6 border-l-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push-inventory" defaultChecked />
                        <Label htmlFor="push-inventory" className="text-purple-900 dark:text-purple-50">
                          Inventory updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push-checkout" defaultChecked />
                        <Label htmlFor="push-checkout" className="text-purple-900 dark:text-purple-50">
                          Item checkouts and returns
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push-low-stock" defaultChecked />
                        <Label htmlFor="push-low-stock" className="text-purple-900 dark:text-purple-50">
                          Low stock alerts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push-system" />
                        <Label htmlFor="push-system" className="text-purple-900 dark:text-purple-50">
                          System notifications
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-frequency" className="text-purple-900 dark:text-purple-50">
                    Notification Frequency
                  </Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger id="notification-frequency" className="border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Advanced Settings</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Configure advanced system settings and data management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Data Management</h3>

                  <div className="space-y-2">
                    <Label htmlFor="data-export" className="text-purple-900 dark:text-purple-50">
                      Export Data
                    </Label>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                      Export your inventory and user data
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        Export as JSON
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                  <div className="space-y-2">
                    <Label htmlFor="data-import" className="text-purple-900 dark:text-purple-50">
                      Import Data
                    </Label>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                      Import inventory data from a file
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input id="data-import" type="file" className="border-purple-200 dark:border-purple-800" />
                      <Button className="bg-purple-700 hover:bg-purple-800 text-white">Upload</Button>
                    </div>
                  </div>

                  <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                  <div className="space-y-2">
                    <Label htmlFor="data-purge" className="text-purple-900 dark:text-purple-50">
                      Data Purge
                    </Label>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                      Permanently delete old data from the system
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="purge-logs" />
                        <Label htmlFor="purge-logs" className="text-purple-900 dark:text-purple-50">
                          Activity logs older than 1 year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="purge-checkout" />
                        <Label htmlFor="purge-checkout" className="text-purple-900 dark:text-purple-50">
                          Completed checkouts older than 2 years
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-2 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Purge Selected Data
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">System</h3>

                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-purple-900 dark:text-purple-50">
                      API Key
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="api-key"
                        value="sk_live_51NxXXXXXXXXXXXXXXXXXXXXX"
                        readOnly
                        className="font-mono border-purple-200 dark:border-purple-800"
                      />
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                      >
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Use this key to access the API. Keep it secret and secure.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url" className="text-purple-900 dark:text-purple-50">
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-server.com/webhook"
                      className="border-purple-200 dark:border-purple-800"
                    />
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Receive real-time updates via webhook
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  Reset to Default
                </Button>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleSaveSettings}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
