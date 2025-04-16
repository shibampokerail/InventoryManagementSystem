"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Save, RotateCcw, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the supply items
const supplyItems = [
  { id: "toilet-paper", name: "Toilet Paper", unit: "rolls" },
  { id: "tissues", name: "Tissues", unit: "boxes" },
  { id: "paper-towels", name: "Paper Towels", unit: "rolls" },
  { id: "hand-soap", name: "Hand Soap", unit: "bottles" },
  { id: "hand-sanitizer", name: "Hand Sanitizer", unit: "bottles" },
  { id: "cleaning-wipes", name: "Cleaning Wipes", unit: "packs" },
  { id: "trash-bags", name: "Trash Bags", unit: "bags" },
  { id: "dish-soap", name: "Dish Soap", unit: "bottles" },
]

// Define the locations
const locations = [
  "Main Building - 1st Floor",
  "Main Building - 2nd Floor",
  "Main Building - 3rd Floor",
  "Student Center",
  "Library",
  "Cafeteria",
  "Gymnasium",
  "Administration Building",
]

export function DailyLogsForm() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize supply usage with all items set to 0
  const [supplyUsage, setSupplyUsage] = useState<Record<string, number>>(
    supplyItems.reduce(
      (acc, item) => {
        acc[item.id] = 0
        return acc
      },
      {} as Record<string, number>,
    ),
  )

  const handleSupplyChange = (id: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setSupplyUsage((prev) => ({
      ...prev,
      [id]: numValue,
    }))
  }

  const resetForm = () => {
    setDate(new Date())
    setLocation("")
    setNotes("")
    setSupplyUsage(
      supplyItems.reduce(
        (acc, item) => {
          acc[item.id] = 0
          return acc
        },
        {} as Record<string, number>,
      ),
    )
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    // Validate form
    if (!date || !location) {
      setError("Please select a date and location")
      setIsSubmitting(false)
      return
    }

    // Check if at least one supply has a value greater than 0
    const hasSupplyUsage = Object.values(supplyUsage).some((value) => value > 0)
    if (!hasSupplyUsage) {
      setError("Please enter usage for at least one supply item")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare data for the Flask server
      const formData = {
        date: format(date, "yyyy-MM-dd"),
        location,
        supplies: supplyUsage,
        notes,
      }

      // Send data to Flask server
      const response = await fetch("http://your-flask-server.com/api/daily-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // For demo purposes, we'll simulate a successful response
      // In a real app, you would check the response status and handle accordingly
      // if (!response.ok) {
      //   throw new Error("Failed to submit daily log")
      // }

      // const data = await response.json()

      // Show success message
      setSuccess(true)
      toast({
        title: "Daily Log Submitted",
        description: `Successfully recorded supply usage for ${format(date, "MMMM d, yyyy")}`,
        variant: "success",
      })

      // Optional: Reset form after successful submission
      // resetForm()
    } catch (err) {
      // In a real app, this would handle actual errors from the server
      // For demo, we'll simulate success and just log the error
      console.error("Error submitting daily log:", err)

      // Uncomment this in a real app to show error messages
      // setError(err instanceof Error ? err.message : "Failed to submit daily log")

      // For demo purposes, we'll still show success
      setSuccess(true)
      toast({
        title: "Daily Log Submitted",
        description: `Successfully recorded supply usage for ${format(date, "MMMM d, yyyy")}`,
        variant: "success",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Daily supply log has been successfully recorded.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-purple-900 dark:text-purple-50">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal border-purple-200 dark:border-purple-800"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">
            Location
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger id="location" className="border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-purple-900 dark:text-purple-50">Supply Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplyItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <Label htmlFor={item.id} className="text-purple-900 dark:text-purple-50">
                {item.name} ({item.unit})
              </Label>
              <Input
                id={item.id}
                type="number"
                min="0"
                value={supplyUsage[item.id]}
                onChange={(e) => handleSupplyChange(item.id, e.target.value)}
                className="border-purple-200 dark:border-purple-800"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-purple-900 dark:text-purple-50">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information about today's supply usage..."
          className="min-h-[100px] border-purple-200 dark:border-purple-800"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
          disabled={isSubmitting}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Form
        </Button>
        <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Log"}
        </Button>
      </div>
    </form>
  )
}
