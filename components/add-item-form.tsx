"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DialogFooter } from "@/components/ui/dialog"
import { useInventory } from "@/context/inventory-context"

// Sample categories for the dropdown
const categories = ["Furniture", "Electronics", "Office Equipment", "Linens", "Food Service", "Supplies"]

// Sample locations for the dropdown
const locations = [
  "Main Storage",
  "Tech Room",
  "Supply Closet A",
  "Supply Closet B",
  "Linen Storage",
  "Kitchen Storage",
  "Office Storage",
]

// Sample conditions for the dropdown
const conditions = ["Excellent", "Good", "Fair", "Poor", "N/A"]

export function AddItemForm() {
  const { toast } = useToast()
  const { addInventoryItem } = useInventory()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    location: "",
    condition: "",
    value: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.name || !formData.category || !formData.quantity || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Add the new item to inventory
      const newItemId = addInventoryItem({
        name: formData.name,
        category: formData.category,
        quantity: Number.parseInt(formData.quantity),
        location: formData.location,
        condition: formData.condition || undefined,
        value: formData.value ? `$${formData.value}` : undefined,
        lastCheckedOut: new Date().toISOString().split("T")[0],
      })

      // Show success message
      toast({
        title: "Item Added",
        description: `${formData.name} has been added to inventory with ID: ${newItemId}`,
        variant: "success",
      })

      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        location: "",
        condition: "",
        value: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)

      // Close the dialog by simulating an Escape key press
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      })
      document.dispatchEvent(event)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
            Item Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Folding Table"
            className="border-purple-200 dark:border-purple-800"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-purple-900 dark:text-purple-50">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
            <SelectTrigger id="category" className="border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-purple-900 dark:text-purple-50">
            Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="e.g., 10"
            className="border-purple-200 dark:border-purple-800"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-purple-900 dark:text-purple-50">
            Location <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)} required>
            <SelectTrigger id="location" className="border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-purple-900 dark:text-purple-50">
            Condition
          </Label>
          <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
            <SelectTrigger id="condition" className="border-purple-200 dark:border-purple-800">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value" className="text-purple-900 dark:text-purple-50">
            Value ($)
          </Label>
          <Input
            id="value"
            name="value"
            type="text"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="e.g., 50.00"
            className="border-purple-200 dark:border-purple-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-purple-900 dark:text-purple-50">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add any additional details about this item..."
          className="min-h-[100px] border-purple-200 dark:border-purple-800"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Close the dialog by simulating an Escape key press
            const event = new KeyboardEvent("keydown", {
              key: "Escape",
              bubbles: true,
            })
            document.dispatchEvent(event)
          }}
          className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  )
}
