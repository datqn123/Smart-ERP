import { render } from "@testing-library/react"
import { CustomersPage } from "./CustomersPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

vi.mock("../components/CustomerToolbar", () => ({
  CustomerToolbar: () => <div data-testid="customer-toolbar">Toolbar</div>,
}))
vi.mock("../components/CustomerTable", () => ({
  CustomerTable: () => <div data-testid="customer-table">Table</div>,
}))
vi.mock("../components/CustomerDetailDialog", () => ({
  CustomerDetailDialog: () => null,
}))
vi.mock("../components/CustomerForm", () => ({
  CustomerForm: () => null,
}))
vi.mock("@/components/shared/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}))

describe("CustomersPage Structural Test", () => {
  it("should have Toolbar and Table as children of a gap container", () => {
    const { getByTestId } = render(
      <PageTitleProvider>
        <CustomersPage />
      </PageTitleProvider>
    )
    
    const toolbar = getByTestId("customer-toolbar")
    const table = getByTestId("customer-table")
    
    const toolbarParent = toolbar.parentElement
    const tableWrapper = table.parentElement?.parentElement
    const tableGrandParent = tableWrapper?.parentElement
    
    expect(toolbarParent).toBe(tableGrandParent)
    expect(toolbarParent?.className).toContain("gap-")
  })
})
