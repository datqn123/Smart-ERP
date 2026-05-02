import { render, screen, waitFor } from "@testing-library/react"
import { DispatchPage } from "./DispatchPage"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import * as dispatchApi from "../api/dispatchApi"

vi.mock("lucide-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("lucide-react")>()
  return { ...mod }
})

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)

beforeEach(() => {
  vi.spyOn(dispatchApi, "getStockDispatchList").mockResolvedValue({
    items: [
      {
        id: 1,
        dispatchCode: "PX-2026-000001",
        orderCode: "—",
        customerName: "Test",
        dispatchDate: "2026-01-15",
        userName: "User",
        itemCount: 1,
        status: "Full",
        createdByUserId: 1,
        manualDispatch: false,
        shortageWarning: false,
        canEdit: false,
        canDelete: false,
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  })
})

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <PageTitleProvider>
          <DispatchPage />
        </PageTitleProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe("DispatchPage Layout Test", () => {
  it("should render one scrollable table (thead + tbody aligned)", async () => {
    renderPage()

    const scroll = await screen.findByTestId("dispatch-list-container")
    const tableWrapper = scroll.parentElement
    expect(tableWrapper?.className).toContain("rounded-xl")
    expect(tableWrapper?.className).toContain("shadow-md")

    await waitFor(() => {
      expect(screen.getByTestId("dispatch-table")).toBeInTheDocument()
    })
    expect(scroll.querySelector("thead")).toBeTruthy()
    expect(scroll.querySelector("tbody")).toBeTruthy()
  })
})
