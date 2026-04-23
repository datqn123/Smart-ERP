/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ReceiptDetailPanel } from "../ReceiptDetailPanel"
import { mockStockReceipts } from "../../mockData"
import { formatCurrency } from "../../utils"

describe("ReceiptDetailPanel", () => {
  const mockOnClose = vi.fn()
  const mockReceipt = mockStockReceipts[0]

  it("should not render when isOpen is false", () => {
    render(<ReceiptDetailPanel receipt={mockReceipt} isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByText(new RegExp(mockReceipt.receiptCode, "i"))).not.toBeInTheDocument()
  })

  it("should render receipt details when open", () => {
    render(<ReceiptDetailPanel receipt={mockReceipt} isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText(new RegExp(`Phiếu nhập: ${mockReceipt.receiptCode}`, "i"))).toBeInTheDocument()
    expect(screen.getByText(mockReceipt.supplierName)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(formatCurrency(mockReceipt.totalAmount).replace(/\s/g, '.*')))).toBeInTheDocument()
    
    // Check for detail items
    mockReceipt.details.forEach(item => {
      expect(screen.getByText(item.productName)).toBeInTheDocument()
    })
  })

  it("should display approval buttons only if canApprove is true and status is Pending", () => {
    const pendingReceipt = mockStockReceipts.find(r => r.status === "Pending")!
    
    const { rerender } = render(
      <ReceiptDetailPanel receipt={pendingReceipt} isOpen={true} onClose={mockOnClose} canApprove={false} />
    )
    expect(screen.queryByTestId("approve-btn")).not.toBeInTheDocument()

    rerender(
      <ReceiptDetailPanel receipt={pendingReceipt} isOpen={true} onClose={mockOnClose} canApprove={true} />
    )
    expect(screen.getByTestId("approve-btn")).toBeInTheDocument()
    expect(screen.getByTestId("reject-btn")).toBeInTheDocument()
  })

  it("should call onClose when clicking close button", () => {
    render(<ReceiptDetailPanel receipt={mockReceipt} isOpen={true} onClose={mockOnClose} />)
    
    // Shadcn SheetClose has a span with text "Close" inside sr-only
    const closeBtn = screen.getByText(/close/i)
    fireEvent.click(closeBtn)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})
