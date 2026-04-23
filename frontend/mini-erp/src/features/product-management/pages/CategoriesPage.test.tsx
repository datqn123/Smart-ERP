import { render } from "@testing-library/react"
import { CategoriesPage } from "./CategoriesPage"
import { describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"

vi.mock("../components/CategoryToolbar", () => ({
  CategoryToolbar: () => <div data-testid="category-toolbar">Toolbar</div>,
}))
vi.mock("../components/CategoryTable", () => ({
  CategoryTable: () => <div data-testid="category-table">Table</div>,
}))
vi.mock("../components/CategoryDetailDialog", () => ({
  CategoryDetailDialog: () => null,
}))
vi.mock("../components/CategoryForm", () => ({
  CategoryForm: () => null,
}))
vi.mock("@/components/shared/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}))

describe("CategoriesPage Structural Test", () => {
  it("should have Toolbar and Table as children of a gap container", () => {
    const { getByTestId } = render(
      <PageTitleProvider>
        <CategoriesPage />
      </PageTitleProvider>
    )
    
    const toolbar = getByTestId("category-toolbar")
    const table = getByTestId("category-table")
    
    const toolbarParent = toolbar.parentElement
    const tableWrapper = table.parentElement?.parentElement
    const tableGrandParent = tableWrapper?.parentElement
    
    expect(toolbarParent).toBe(tableGrandParent)
    expect(toolbarParent?.className).toContain("gap-")
  })
})
