import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
  it("should have Toolbar and Table under the same gap container", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageTitleProvider>
          <ProductsPage />
        </PageTitleProvider>
      </QueryClientProvider>,
    )

    const toolbar = getByTestId("product-toolbar")
    const table = getByTestId("product-table")

    const toolbarParent = toolbar.parentElement
    const tableGapAncestor = table.parentElement?.parentElement?.parentElement

    expect(toolbarParent).toBe(tableGapAncestor)
    expect(toolbarParent?.className ?? "").toContain("gap-")
  })
})
