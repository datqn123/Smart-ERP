import { render } from "@testing-library/react"
import { SuppliersPage } from "./SuppliersPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

vi.mock("../components/SupplierToolbar", () => ({
  SupplierToolbar: () => <div data-testid="supplier-toolbar">Toolbar</div>,
}))
vi.mock("../components/SupplierTable", () => ({
  SupplierTable: () => <div data-testid="supplier-table">Table</div>,
}))
vi.mock("../components/SupplierDetailDialog", () => ({
  SupplierDetailDialog: () => null,
}))
vi.mock("../components/SupplierForm", () => ({
  SupplierForm: () => null,
}))
vi.mock("@/components/shared/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}))

describe("SuppliersPage Structural Test", () => {
  it("should have Toolbar and Table as children of a gap container", () => {
    const { getByTestId } = render(
      <PageTitleProvider>
        <SuppliersPage />
      </PageTitleProvider>
    )
    
    const toolbar = getByTestId("supplier-toolbar")
    const table = getByTestId("supplier-table")
    
    const toolbarParent = toolbar.parentElement
    const tableWrapper = table.parentElement?.parentElement
    const tableGrandParent = tableWrapper?.parentElement
    
    expect(toolbarParent).toBe(tableGrandParent)
    expect(toolbarParent?.className).toContain("gap-")
  })
})
