import { render, screen } from "@testing-library/react"
import { DispatchPage } from "./DispatchPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

vi.mock("lucide-react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("lucide-react")>()
  return { ...mod }
})

// Mock IntersectionObserver
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})

describe("DispatchPage Layout Test", () => {
  it("should render one scrollable table (thead + tbody aligned)", () => {
    render(
      <PageTitleProvider>
        <DispatchPage />
      </PageTitleProvider>
    )

    const scroll = screen.getByTestId("dispatch-list-container")
    const tableWrapper = scroll.parentElement
    expect(tableWrapper?.className).toContain("rounded-xl")
    expect(tableWrapper?.className).toContain("shadow-md")

    expect(screen.getByTestId("dispatch-table")).toBeInTheDocument()
    expect(scroll.querySelector("thead")).toBeTruthy()
    expect(scroll.querySelector("tbody")).toBeTruthy()
  })
})
