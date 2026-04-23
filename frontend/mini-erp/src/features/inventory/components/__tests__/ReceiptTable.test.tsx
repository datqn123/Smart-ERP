/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ReceiptTable } from "../ReceiptTable"
import { mockStockReceipts } from "../../mockData"
import { formatCurrency, formatDate } from "../../utils"

describe("ReceiptTable", () => {
  const mockOnAction = vi.fn()

  it("should render essential columns defined in SRS", () => {
    render(<ReceiptTable receipts={mockStockReceipts.slice(0, 1)} onAction={mockOnAction} />)
    
    expect(screen.getByText(/Mã phiếu/i)).toBeInTheDocument()
    expect(screen.getByText(/Nhà cung cấp/i)).toBeInTheDocument()
    expect(screen.getByText(/Tổng tiền/i)).toBeInTheDocument()
    expect(screen.getByText(/Trạng thái/i)).toBeInTheDocument()
  })

  it("should render the correct number of rows", () => {
    const data = mockStockReceipts.slice(0, 5)
    render(<ReceiptTable receipts={data} onAction={mockOnAction} />)
    
    const rows = screen.getAllByRole("row")
    // +1 for the header row
    expect(rows.length).toBe(6)
  })

  it("should display correct data for a receipt row", () => {
    const receipt = mockStockReceipts[0]
    render(<ReceiptTable receipts={[receipt]} onAction={mockOnAction} />)
    
    expect(screen.getByText(receipt.receiptCode)).toBeInTheDocument()
    expect(screen.getByText(receipt.supplierName)).toBeInTheDocument()
    expect(screen.getByText(formatDate(receipt.receiptDate))).toBeInTheDocument()
    expect(screen.getByText(receipt.staffName)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(formatCurrency(receipt.totalAmount).replace(/\s/g, '.*')))).toBeInTheDocument()
  })

  it("should call onAction when 'Xem chi tiết' button is clicked", () => {
    render(<ReceiptTable receipts={[mockStockReceipts[0]]} onAction={mockOnAction} />)
    
    const actionBtn = screen.getByTestId("view-detail-btn")
    fireEvent.click(actionBtn)
    
    expect(mockOnAction).toHaveBeenCalledWith(mockStockReceipts[0])
  })
})
