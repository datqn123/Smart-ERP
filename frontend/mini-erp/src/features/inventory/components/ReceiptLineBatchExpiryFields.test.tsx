import type { ReactElement } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Table, TableBody, TableRow } from "@/components/ui/table"
import { ReceiptLineBatchExpiryFields } from "./ReceiptLineBatchExpiryFields"
import { receiptSchema, type ReceiptFormData } from "../receiptFormSchema"
import { getInventoryList } from "@/features/inventory/api/inventoryApi"

vi.mock("@/features/inventory/api/inventoryApi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/features/inventory/api/inventoryApi")>()
  return {
    ...mod,
    getInventoryList: vi.fn(),
  }
})

const MOCK_INVENTORY_PAGE = {
  summary: {
    totalSkus: 1,
    totalValue: 100,
    lowStockCount: 0,
    expiringSoonCount: 0,
  },
  items: [
    {
      id: 99,
      productId: 1,
      productName: "Nước suối 500ml",
      skuCode: "DEMO-NUOC-500",
      barcode: null,
      locationId: 1,
      warehouseCode: "WH1",
      shelfCode: "R1",
      batchNumber: "LOT-TEST-1",
      expiryDate: "2028-06-15",
      quantity: 10,
      minQuantity: 1,
      unitId: 1,
      unitName: "Chai",
      costPrice: 12000,
      updatedAt: "2026-01-01T00:00:00Z",
      isLowStock: false,
      isExpiringSoon: false,
      totalValue: 120000,
    },
  ],
  page: 1,
  limit: 100,
  total: 1,
}

function TestHarness() {
  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      supplierId: 1,
      receiptDate: "2026-05-01",
      invoiceNumber: "",
      notes: "",
      details: [
        {
          productId: 1,
          unitId: 1,
          quantity: 1,
          costPrice: 0,
          batchNumber: "",
          expiryDate: "",
        },
      ],
    },
  })
  return (
    <FormProvider {...form}>
      <Table>
        <TableBody>
          <TableRow>
            <ReceiptLineBatchExpiryFields rowIndex={0} productId={1} isEditable dialogOpen />
          </TableRow>
        </TableBody>
      </Table>
    </FormProvider>
  )
}

function wrap(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

describe("ReceiptLineBatchExpiryFields", () => {
  beforeEach(() => {
    vi.mocked(getInventoryList).mockResolvedValue(MOCK_INVENTORY_PAGE as never)
  })

  it("gọi inventory theo productId và hiển thị chọn lô khi có dòng tồn", async () => {
    render(wrap(<TestHarness />))

    await waitFor(() => {
      expect(getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 1, limit: 100, page: 1 }),
      )
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/nhập tay nếu cần/i)).toBeInTheDocument()
    })

    expect(screen.getByRole("combobox")).toBeInTheDocument()
    expect(screen.getByText(/Chưa chọn từ tồn/i)).toBeInTheDocument()
  })
})
