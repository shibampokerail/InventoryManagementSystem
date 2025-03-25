"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileDown, AlertTriangle, BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart as RePieChart,
  Cell,
} from "recharts"

// Dummy data for usage statistics
const monthlyUsageData = [
  { name: "Jan", checkouts: 45 },
  { name: "Feb", checkouts: 52 },
  { name: "Mar", checkouts: 78 },
  { name: "Apr", checkouts: 65 },
  { name: "May", checkouts: 92 },
  { name: "Jun", checkouts: 58 },
  { name: "Jul", checkouts: 49 },
  { name: "Aug", checkouts: 83 },
  { name: "Sep", checkouts: 75 },
  { name: "Oct", checkouts: 62 },
  { name: "Nov", checkouts: 70 },
  { name: "Dec", checkouts: 55 },
]

// Dummy data for item popularity
const popularItemsData = [
  { name: "Chairs", checkouts: 245 },
  { name: "Folding Tables", checkouts: 187 },
  { name: "Tablecloths", checkouts: 142 },
  { name: "Projectors", checkouts: 98 },
  { name: "Microphones", checkouts: 76 },
]

// Dummy data for department usage
const departmentUsageData = [
  { name: "Student Affairs", value: 35 },
  { name: "Academic Affairs", value: 25 },
  { name: "Athletics", value: 15 },
  { name: "Student Organizations", value: 20 },
  { name: "Admissions", value: 5 },
]

// Dummy data for low stock alerts
const lowStockItems = [
  { id: "INV003", name: "Tissues", category: "Supplies", quantity: 8, threshold: 20, status: "Critical" },
  { id: "INV015", name: "Hand Sanitizer", category: "Supplies", quantity: 6, threshold: 15, status: "Critical" },
  { id: "INV005", name: "Projectors", category: "Electronics", quantity: 5, threshold: 8, status: "Warning" },
  { id: "INV012", name: "Portable Speakers", category: "Electronics", quantity: 4, threshold: 6, status: "Warning" },
  { id: "INV009", name: "Podium", category: "Furniture", quantity: 3, threshold: 5, status: "Warning" },
]

// Dummy data for inventory value
const inventoryValueData = [
  { category: "Furniture", value: 6750 },
  { category: "Electronics", value: 4770 },
  { category: "Office Equipment", value: 1250 },
  { category: "Linens", value: 640 },
  { category: "Food Service", value: 600 },
  { category: "Supplies", value: 84 },
]

// Colors for pie chart
const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"]

export function ReportsView() {
  const [reportType, setReportType] = useState("usage")

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[240px] border-purple-200 dark:border-purple-800">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage">Usage Statistics</SelectItem>
            <SelectItem value="popularity">Item Popularity</SelectItem>
            <SelectItem value="departments">Department Usage</SelectItem>
            <SelectItem value="alerts">Low Stock Alerts</SelectItem>
            <SelectItem value="value">Inventory Value</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-purple-700 hover:bg-purple-800 text-white">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {reportType === "usage" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                Monthly Usage Statistics
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Number of checkouts per month over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUsageData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f3e8ff",
                      borderColor: "#d8b4fe",
                      borderRadius: "6px",
                      color: "#6b21a8",
                    }}
                  />
                  <Bar dataKey="checkouts" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Checkouts" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Total Checkouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">784</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Past 12 months</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Average Per Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">65.3</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Past 12 months</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Busiest Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">May</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">92 checkouts</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Current Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">78</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">+26.8% from last month</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "popularity" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                Most Popular Items
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Items with the highest number of checkouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularItemsData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" scale="band" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f3e8ff",
                      borderColor: "#d8b4fe",
                      borderRadius: "6px",
                      color: "#6b21a8",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="checkouts" fill="#8b5cf6" name="Total Checkouts" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <Table>
                <TableHeader className="bg-purple-100 dark:bg-purple-900">
                  <TableRow>
                    <TableHead className="text-purple-900 dark:text-purple-50">Item</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Total Checkouts</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Average Duration</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Popularity Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Chairs</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">245</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">2.3 days</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">↑ 12%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Folding Tables</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">187</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">2.5 days</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">↑ 8%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Tablecloths</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">142</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">1.8 days</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">↑ 5%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Projectors</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">98</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">1.2 days</TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">↓ 3%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Microphones</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">76</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">1.5 days</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">↑ 2%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "departments" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <PieChart className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                Department Usage
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Distribution of checkouts by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={departmentUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f3e8ff",
                        border: "1px solid #d8b4fe",
                        borderRadius: "6px",
                        color: "#6b21a8",
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <Table>
                  <TableHeader className="bg-purple-100 dark:bg-purple-900">
                    <TableRow>
                      <TableHead className="text-purple-900 dark:text-purple-50">Department</TableHead>
                      <TableHead className="text-purple-900 dark:text-purple-50">Checkouts</TableHead>
                      <TableHead className="text-purple-900 dark:text-purple-50">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">Student Affairs</TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">274</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">35%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                        Academic Affairs
                      </TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">196</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">25%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                        Student Organizations
                      </TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">157</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">20%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">Athletics</TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">118</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">15%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-purple-900 dark:text-purple-50">Admissions</TableCell>
                      <TableCell className="text-purple-900 dark:text-purple-50">39</TableCell>
                      <TableCell className="text-purple-700 dark:text-purple-300">5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-purple-900 dark:text-purple-50">Key Insights</h4>
                  <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                    <li>• Student Affairs has the highest usage at 35% of all checkouts</li>
                    <li>• Academic departments account for 25% of inventory usage</li>
                    <li>• Student organizations show increasing usage trends (up 12% from last year)</li>
                    <li>• Athletics usage peaks during fall and spring semesters</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "alerts" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Items that need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-purple-100 dark:bg-purple-900">
                <TableRow>
                  <TableHead className="text-purple-900 dark:text-purple-50">Item ID</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Name</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Current Quantity</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Threshold</TableHead>
                  <TableHead className="text-purple-900 dark:text-purple-50">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">{item.id}</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">{item.name}</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">{item.category}</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">{item.quantity}</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">{item.threshold}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.status === "Critical"
                            ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Critical Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">2</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Warning Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Should be restocked soon</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Estimated Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-50">$425</div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">To restock all low items</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "value" && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-700 dark:text-purple-300" />
                Inventory Value
              </div>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Total value of inventory by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryValueData}>
                  <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f3e8ff",
                      borderColor: "#d8b4fe",
                      borderRadius: "6px",
                      color: "#6b21a8",
                    }}
                    formatter={(value) => [`$${value}`, "Value"]}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <Table>
                <TableHeader className="bg-purple-100 dark:bg-purple-900">
                  <TableRow>
                    <TableHead className="text-purple-900 dark:text-purple-50">Category</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Total Value</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Item Count</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Avg. Value Per Item</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Furniture</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$6,750.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">168</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$40.18</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Electronics</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$4,770.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">39</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$122.31</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Office Equipment</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$1,250.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">38</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$32.89</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Linens</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$640.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">32</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$20.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Food Service</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$600.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">40</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$15.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-purple-900 dark:text-purple-50">Supplies</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$84.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">14</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$6.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell className="text-purple-900 dark:text-purple-50">Total</TableCell>
                    <TableCell className="text-purple-900 dark:text-purple-50">$14,094.00</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">331</TableCell>
                    <TableCell className="text-purple-700 dark:text-purple-300">$42.58</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

