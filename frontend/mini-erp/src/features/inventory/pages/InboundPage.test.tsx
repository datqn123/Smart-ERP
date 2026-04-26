import type { ReactElement } from "react"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { InboundPage } from "./InboundPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

// Giữ toàn bộ icon thật (form/panel dùng nhiều icon); tránh mock từng export.
vi.mock("lucide-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("lucide-react")>()
  return { ...mod }
})

// Mock components used in InboundPage
vi.mock("../components/ReceiptTable", () => ({
  ReceiptTable: () => <div data-testid="receipt-table" />,
}))

vi.mock("../components/ReceiptDetailPanel", () => ({
  ReceiptDetailPanel: () => <div data-testid="receipt-detail-panel" />,
}))

vi.mock("../api/stockReceiptsApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../api/stockReceiptsApi")>()
  return {
    ...mod,
    getStockReceiptList: vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    }),
  }
})

// Mock IntersectionObserver
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})

function wrap(ui: ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <PageTitleProvider>{ui}</PageTitleProvider>
    </QueryClientProvider>
  )
}

describe("InboundPage Render Test", () => {
  it("should render without crashing", () => {
    render(wrap(<InboundPage />))
    expect(true).toBe(true)
  })
})
