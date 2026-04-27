import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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

vi.mock("../api/customersApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../api/customersApi")>()
  return {
    ...mod,
    getCustomerList: vi.fn().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
    deleteCustomer: vi.fn().mockResolvedValue({ id: 0, deleted: true }),
    postCustomersBulkDelete: vi.fn().mockResolvedValue({ deletedIds: [], deletedCount: 0 }),
  }
})

describe("CustomersPage Structural Test", () => {
  it("should have Toolbar and Table as children of a gap container", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <PageTitleProvider>
          <CustomersPage />
        </PageTitleProvider>
      </QueryClientProvider>,
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
