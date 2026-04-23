import { render } from "@testing-library/react"
import { StockPage } from "./StockPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Package: () => <div data-testid="package-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  CalendarClock: () => <div data-testid="calendar-clock-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Check: () => <div data-testid="check-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  MoreHorizontal: () => <div data-testid="more-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  ArrowRightLeft: () => <div data-testid="transfer-icon" />,
}))

// Mock IntersectionObserver
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})

// Mock components to simplify
vi.mock("../components/StockToolbar", () => ({
  StockToolbar: () => <div data-testid="stock-toolbar" />,
}))

vi.mock("../components/StockBatchDetailsDialog", () => ({
  StockBatchDetailsDialog: () => <div data-testid="stock-batch-dialog" />,
}))

describe("StockPage Layout Test", () => {
  it("should render one scrollable stock table (thead + tbody aligned)", () => {
    const { container } = render(
      <PageTitleProvider>
        <StockPage />
      </PageTitleProvider>
    )

    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer.className).toContain("h-full")
    expect(mainContainer.className).toContain("flex-col")

    const tableWrapper = container.querySelector(".shadow-md.rounded-xl")
    expect(tableWrapper).toBeTruthy()

    const scroll = tableWrapper?.querySelector(".overflow-y-auto")
    expect(scroll).toBeTruthy()
    expect(scroll?.querySelector("thead")).toBeTruthy()
    expect(scroll?.querySelector('[data-testid="stock-table"]')).toBeTruthy()
  })

  // AC3: Filter bar should NOT have shadow-sm
  it("should have filter bar without shadow", () => {
    const { container } = render(
      <PageTitleProvider>
        <StockPage />
      </PageTitleProvider>
    )
    
    // Filter Bar is the 3rd child (after Header section and KPI section)
    // It should be a div with class "bg-white border border-slate-200 rounded-lg p-4 shrink-0"
    // We look for a div that has BOTH border-slate-200 and rounded-lg but NO shadow
    const allDivs = container.querySelectorAll('div');
    const filterBar = Array.from(allDivs).find(div => 
      div.className.includes('border-slate-200') && 
      div.className.includes('rounded-lg') &&
      !div.className.includes('shadow') &&
      div.className.includes('p-4')
    );
    
    expect(filterBar).toBeTruthy();
  })
})
