import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import type { UsageData, ItemPopularity, UnavailableItem, InventoryItem } from "./data-utils"

// Function to export report as PDF
export async function exportReportAsPDF(
  reportType: string,
  timeframe: string,
  usageData: UsageData[],
  popularItems: ItemPopularity[],
  unavailableItems: UnavailableItem[],
  lowStockItems: InventoryItem[],
) {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  try {
    // Get the chart element to capture
    const chartElement = document.getElementById("report-chart-container")
    const tableElement = document.getElementById("report-table-container")
    const statsElement = document.getElementById("report-stats-container")

    // Add title
    pdf.setFontSize(20)
    pdf.setTextColor(89, 31, 142) // Purple color
    const title = getReportTitle(reportType, timeframe)
    pdf.text(title, 20, 20)

    // Add date
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28)

    // Add horizontal line
    pdf.setDrawColor(89, 31, 142)
    pdf.line(20, 32, 190, 32)

    let yPosition = 40

    // Add stats if available
    if (statsElement) {
      const statsCanvas = await html2canvas(statsElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Calculate proper aspect ratio
      const statsImgData = statsCanvas.toDataURL("image/png")
      const imgWidth = 170
      const aspectRatio = statsCanvas.height / statsCanvas.width
      const imgHeight = imgWidth * aspectRatio

      pdf.addImage(statsImgData, "PNG", 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 5
    }

    // Add chart if available
    if (chartElement) {
      const chartCanvas = await html2canvas(chartElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Calculate proper aspect ratio
      const chartImgData = chartCanvas.toDataURL("image/png")
      const imgWidth = 170
      const aspectRatio = chartCanvas.height / chartCanvas.width
      const imgHeight = imgWidth * aspectRatio

      // Check if we need a new page for the chart
      if (yPosition + imgHeight > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.addImage(chartImgData, "PNG", 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10
    }

    // Add table if available
    if (tableElement) {
      const tableCanvas = await html2canvas(tableElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Calculate proper aspect ratio
      const tableImgData = tableCanvas.toDataURL("image/png")
      const imgWidth = 170
      const aspectRatio = tableCanvas.height / tableCanvas.width
      const imgHeight = imgWidth * aspectRatio

      // Check if we need a new page for the table
      if (yPosition + imgHeight > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.addImage(tableImgData, "PNG", 20, yPosition, imgWidth, imgHeight)
    }

    // Add footer
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text("Inventory Management System - Generated Report", 20, 287)
      pdf.text(`Page ${i} of ${pageCount}`, 180, 287)
    }

    // Save the PDF
    pdf.save(`inventory-${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("Failed to generate PDF. Please try again.")
  }
}

// Function to export report as Excel
export function exportReportAsExcel(
  reportType: string,
  timeframe: string,
  usageData: UsageData[],
  popularItems: ItemPopularity[],
  unavailableItems: UnavailableItem[],
  lowStockItems: InventoryItem[],
) {
  try {
    console.log("Starting Excel export with data:", {
      reportType,
      timeframe,
      usageDataCount: usageData.length,
      popularItemsCount: popularItems.length,
      unavailableItemsCount: unavailableItems.length,
      lowStockItemsCount: lowStockItems.length,
    })

    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Add title worksheet with better formatting
    const titleData = [
      ["Inventory Management System"],
      [`${getReportTitle(reportType, timeframe)}`],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [],
    ]
    const titleWs = XLSX.utils.aoa_to_sheet(titleData)

    // Apply some styling to the title sheet
    titleWs["!cols"] = [{ wch: 50 }] // Set column width
    XLSX.utils.book_append_sheet(wb, titleWs, "Report Info")

    // Add data based on report type
    if (reportType === "usage") {
      console.log("Processing usage data for Excel export:", usageData)

      // Add usage data worksheet
      const usageSheetData = [
        ["Period", "Checkouts", "Most Popular Item"],
        ...usageData.map((item) => [item.period, item.checkouts, item.popularItem]),
      ]
      const usageWs = XLSX.utils.aoa_to_sheet(usageSheetData)
      usageWs["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 30 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, usageWs, `${timeframe} Usage`)

      // Add popular items worksheet
      const popularItemsData = [
        ["Item", "Category", "Total Checkouts", "Average Duration", "Trend"],
        ...popularItems.map((item) => [item.name, item.category, item.checkouts, item.averageDuration, item.trend]),
      ]
      const popularWs = XLSX.utils.aoa_to_sheet(popularItemsData)
      popularWs["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, popularWs, "Popular Items")

      console.log("Added usage data sheets to Excel workbook")
    } else if (reportType === "alerts") {
      console.log("Processing low stock data for Excel export:", lowStockItems)

      // Add low stock items worksheet
      const lowStockData = [
        ["Item ID", "Name", "Category", "Current Quantity", "Threshold", "Status"],
        ...lowStockItems.map((item) => [
          item._id.substring(item._id.length - 8),
          item.name,
          item.category,
          item.quantity,
          item.minQuantity,
          item.quantity < item.minQuantity * 0.5 ? "Critical" : "Warning",
        ]),
      ]
      const lowStockWs = XLSX.utils.aoa_to_sheet(lowStockData)
      lowStockWs["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, lowStockWs, "Low Stock Items")

      // Add summary worksheet
      const summaryData = [
        ["Critical Items", lowStockItems.filter((item) => item.quantity < item.minQuantity * 0.5).length],
        ["Warning Items", lowStockItems.filter((item) => item.quantity >= item.minQuantity * 0.5).length],
        ["Total Low Stock Items", lowStockItems.length],
        ["Estimated Restock Cost", "$425"],
      ]
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      summaryWs["!cols"] = [{ wch: 25 }, { wch: 10 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

      console.log("Added low stock data sheets to Excel workbook")
    } else if (reportType === "unavailable") {
      console.log("Processing unavailable items data for Excel export:", unavailableItems)

      // Add unavailable items worksheet
      const unavailableData = [
        ["Item Name", "Category", "Quantity", "Reason", "Date"],
        ...unavailableItems.map((item) => [
          item.name,
          item.category,
          item.quantity,
          item.reason === "reportedStolen" ? "Stolen" : item.reason === "reportedLost" ? "Lost" : item.reason,
          item.date,
        ]),
      ]
      const unavailableWs = XLSX.utils.aoa_to_sheet(unavailableData)
      unavailableWs["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, unavailableWs, "Unavailable Items")

      // Add summary worksheet
      const summaryData = [
        ["Missing Items", unavailableItems.filter((item) => item.reason === "Missing").length],
        ["Damaged Items", unavailableItems.filter((item) => item.reason === "Damaged").length],
        ["Stolen Items", unavailableItems.filter((item) => item.reason === "reportedStolen").length],
        ["Lost Items", unavailableItems.filter((item) => item.reason === "reportedLost").length],
        ["Total Unavailable Items", unavailableItems.length],
      ]
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      summaryWs["!cols"] = [{ wch: 25 }, { wch: 10 }] // Set column widths
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

      console.log("Added unavailable items data sheets to Excel workbook")
    }

    console.log("Generating Excel file...")

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    console.log("Excel file generated successfully, saving...")

    // Save the file
    saveAs(blob, `inventory-${reportType}-report-${new Date().toISOString().split("T")[0]}.xlsx`)

    console.log("Excel file saved successfully")
  } catch (error) {
    console.error("Error generating Excel:", error)
    alert("Failed to generate Excel file. Please try again.")
  }
}

// Helper function to get report title
function getReportTitle(reportType: string, timeframe: string): string {
  switch (reportType) {
    case "usage":
      return `${timeframe === "monthly" ? "Monthly" : "Weekly"} Usage & Item Popularity Report`
    case "alerts":
      return "Low Stock Alerts Report"
    case "unavailable":
      return "Unavailable Items Report"
    default:
      return "Inventory Report"
  }
}
