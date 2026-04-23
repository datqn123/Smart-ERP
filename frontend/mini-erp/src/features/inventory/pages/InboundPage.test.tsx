import { render } from "@testing-library/react"
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

// Mock IntersectionObserver
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})

describe("InboundPage Render Test", () => {
  it("should render without crashing", () => {
    // This test is expected to FAIL to compile/run because of the syntax error in InboundPage.tsx
    render(
      <PageTitleProvider>
        <InboundPage />
      </PageTitleProvider>
    )
    expect(true).toBe(true)
  })
})
