import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProductsPage } from "./ProductsPage"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

const listMocks = vi.hoisted(() => ({
  getProductList: vi.fn(),
  getCategoryList: vi.fn(),
}))

vi.mock("../api/productsApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../api/productsApi")>()
  return { ...mod, getProductList: listMocks.getProductList }
})
vi.mock("../api/categoriesApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../api/categoriesApi")>()
  return { ...mod, getCategoryList: listMocks.getCategoryList }
})

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

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

describe("ProductsPage Structural Test", () => {
  beforeEach(() => {
    listMocks.getProductList.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    })
    listMocks.getCategoryList.mockResolvedValue({ items: [] })
  })

  it("should have Toolbar and Table under the same gap container", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { getByTestId, findByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageTitleProvider>
          <ProductsPage />
        </PageTitleProvider>
      </QueryClientProvider>,
    )

    const toolbar = getByTestId("product-toolbar")
    const table = await findByTestId("product-table")

    const toolbarParent = toolbar.parentElement
    const tableGapAncestor = table.parentElement?.parentElement?.parentElement
    expect(toolbarParent).toBe(tableGapAncestor)
    expect(toolbarParent?.className ?? "").toContain("gap-")
  })
})
