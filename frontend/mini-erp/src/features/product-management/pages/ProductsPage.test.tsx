import { render } from "@testing-library/react"
import { ProductsPage } from "./ProductsPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

// Mock components to simplify the DOM
vi.mock("../components/ProductToolbar", () => ({
  ProductToolbar: () => <div data-testid="product-toolbar">Toolbar</div>,
}))
vi.mock("../components/ProductTable", () => ({
  ProductTable: () => <div data-testid="product-table">Table</div>,
}))
vi.mock("../components/ProductDetailDialog", () => ({
  ProductDetailDialog: () => null,
}))
vi.mock("../components/ProductForm", () => ({
  ProductForm: () => null,
}))
vi.mock("@/components/shared/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}))

describe("ProductsPage Structural Test", () => {
  it("should have Toolbar and Table as direct siblings of a gap container", () => {
    const { getByTestId } = render(
      <PageTitleProvider>
        <ProductsPage />
      </PageTitleProvider>
    )
    
    const toolbar = getByTestId("product-toolbar")
    const table = getByTestId("product-table")
    
    // Check if they are direct children of the SAME container
    const toolbarParent = toolbar.parentElement
    // Table is inside div.flex-1.overflow-y-auto -> div.shadow-md -> main
    const tableWrapper = table.parentElement?.parentElement
    const tableGrandParent = tableWrapper?.parentElement
    
    expect(toolbarParent).toBe(tableGrandParent)
    
    const parentClass = toolbarParent?.className || ""
    expect(parentClass).toContain("gap-")
  })
})
