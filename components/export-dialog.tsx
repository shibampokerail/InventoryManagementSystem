"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileIcon as FilePdf, FileSpreadsheet, Loader2 } from "lucide-react"
import { exportReportAsPDF, exportReportAsExcel } from "@/lib/export-utils"
import type { UsageData, ItemPopularity, UnavailableItem, InventoryItem } from "@/lib/data-utils"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: string
  timeframe: string
  usageData: UsageData[]
  popularItems: ItemPopularity[]
  unavailableItems: UnavailableItem[]
  lowStockItems: InventoryItem[]
}

export function ExportDialog({
  open,
  onOpenChange,
  reportType,
  timeframe,
  usageData,
  popularItems,
  unavailableItems,
  lowStockItems,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  const handleExportPDF = async () => {
    setIsExporting(true)
    setExportStatus("Generating PDF...")
    try {
      await exportReportAsPDF(reportType, timeframe, usageData, popularItems, unavailableItems, lowStockItems)
      setExportStatus("PDF exported successfully!")
      setTimeout(() => {
        onOpenChange(false)
        setExportStatus(null)
      }, 1500)
    } catch (error) {
      console.error("PDF export error:", error)
      setExportStatus("Error exporting PDF")
      setTimeout(() => {
        setExportStatus(null)
      }, 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    setExportStatus("Generating Excel spreadsheet...")
    try {
      console.log("Starting Excel export with data:", {
        reportType,
        timeframe,
        usageDataCount: usageData.length,
        popularItemsCount: popularItems.length,
        unavailableItemsCount: unavailableItems.length,
        lowStockItemsCount: lowStockItems.length,
      })

      exportReportAsExcel(reportType, timeframe, usageData, popularItems, unavailableItems, lowStockItems)

      setExportStatus("Excel file exported successfully!")
      setTimeout(() => {
        onOpenChange(false)
        setExportStatus(null)
      }, 1500)
    } catch (error) {
      console.error("Excel export error:", error)
      setExportStatus("Error exporting Excel file")
      setTimeout(() => {
        setExportStatus(null)
      }, 3000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Choose your preferred export format</DialogDescription>
        </DialogHeader>

        {exportStatus && (
          <div
            className={`text-center p-2 rounded ${
              exportStatus.includes("Error")
                ? "bg-red-50 text-red-700"
                : exportStatus.includes("success")
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {exportStatus}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex flex-col items-center justify-center h-32 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
          >
            {isExporting && exportStatus?.includes("PDF") ? (
              <Loader2 className="h-10 w-10 text-purple-700 animate-spin" />
            ) : (
              <>
                <FilePdf className="h-10 w-10 text-purple-700 mb-2" />
                <span className="text-sm font-medium">PDF Document</span>
                <span className="text-xs text-purple-700 mt-1">With charts and tables</span>
              </>
            )}
          </Button>
         
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
