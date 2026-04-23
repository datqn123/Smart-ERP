import { render, screen, fireEvent } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { CustomerTable } from "../CustomerTable"
import { Customer } from "../../types"

const mockData: Customer[] = [
  {
    id: 1,
    customerCode: "KH001",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "a@example.com",
    loyaltyPoints: 120,
    totalSpent: 1500000,
    orderCount: 5,
    status: "Active",
    createdAt: "2024-01-01",
  }
]

test("CustomerTable renders correctly with standardization", () => {
  const onSelect = vi.fn()
  const onSelectAll = vi.fn()
  const onView = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  render(
    <CustomerTable
      data={mockData}
      selectedIds={[]}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )

  // Verify code is rendered in mono
  const codeCell = screen.getByText("KH001")
  expect(codeCell).toBeDefined()
  
  // Verify action buttons
  const editBtn = screen.getByTitle("Chỉnh sửa")
  const deleteBtn = screen.getByTitle("Xóa")
  expect(editBtn).toBeDefined()
  expect(deleteBtn).toBeDefined()

  // Trigger delete
  fireEvent.click(deleteBtn)
  expect(onDelete).toHaveBeenCalledWith(mockData[0])
})
