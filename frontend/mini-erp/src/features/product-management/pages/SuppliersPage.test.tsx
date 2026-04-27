import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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

vi.mock("../api/suppliersApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../api/suppliersApi")>()
  return {
    ...mod,
    getSupplierList: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
    postSupplier: vi.fn().mockResolvedValue({}),
    getSupplierById: vi.fn().mockResolvedValue(null),
    patchSupplier: vi.fn().mockResolvedValue({}),
    deleteSupplier: vi.fn().mockResolvedValue({ id: 0, deleted: true }),
    postSuppliersBulkDelete: vi.fn().mockResolvedValue({ deletedIds: [], deletedCount: 0 }),
  }
})

describe("SuppliersPage Structural Test", () => {
  it("should have Toolbar and Table under the same gap container", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageTitleProvider>
          <SuppliersPage />
        </PageTitleProvider>
      </QueryClientProvider>,
    )

    const toolbar = getByTestId("supplier-toolbar")
    const table = getByTestId("supplier-table")

    const toolbarParent = toolbar.parentElement
    const tableGapAncestor = table.parentElement?.parentElement?.parentElement

    expect(toolbarParent).toBe(tableGapAncestor)
    expect(toolbarParent?.className ?? "").toContain("gap-")
  })
})
