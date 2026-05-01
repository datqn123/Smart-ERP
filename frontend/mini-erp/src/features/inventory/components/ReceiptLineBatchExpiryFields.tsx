import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import { getInventoryList } from "@/features/inventory/api/inventoryApi"
import type { ReceiptFormData } from "../receiptFormSchema"
import {
  RECEIPT_LOT_SELECT_MANUAL,
  buildReceiptLotOptions,
  findLotOptionValue,
} from "../receiptFormLotOptions"

const RECEIPT_LOT_SELECT_NONE = "__none__" as const

const FORM_FIELD_DISABLED_OPAQUE = "disabled:opacity-100"

type Props = {
  rowIndex: number
  productId: number
  isEditable: boolean
  dialogOpen: boolean
}

export function ReceiptLineBatchExpiryFields({ rowIndex, productId, isEditable, dialogOpen }: Props) {
  const { watch, setValue, register } = useFormContext<ReceiptFormData>()
  const batchVal = watch(`details.${rowIndex}.batchNumber`) ?? ""
  const expiryVal = watch(`details.${rowIndex}.expiryDate`) ?? ""

  const { data: invPage, isPending } = useQuery({
    queryKey: ["inventory", "by-product", productId],
    queryFn: () =>
      getInventoryList({
        productId,
        page: 1,
        limit: 100,
        stockLevel: "all",
      }),
    enabled: dialogOpen && isEditable && productId > 0,
    staleTime: 30_000,
  })

  const lotOptions = useMemo(() => buildReceiptLotOptions(invPage?.items ?? []), [invPage?.items])

  const matchedInventory = findLotOptionValue(batchVal, expiryVal, lotOptions)
  const selectValue = useMemo(() => {
    if (lotOptions.length === 0) {
      return RECEIPT_LOT_SELECT_MANUAL
    }
    if (matchedInventory != null) {
      return matchedInventory
    }
    const hasManual = batchVal.trim() !== "" || normExpiryDay(expiryVal) !== ""
    if (hasManual) {
      return RECEIPT_LOT_SELECT_MANUAL
    }
    return RECEIPT_LOT_SELECT_NONE
  }, [lotOptions.length, matchedInventory, batchVal, expiryVal])

  return (
    <>
      <TableCell className="px-1 text-left align-top">
        {productId > 0 && lotOptions.length > 0 ? (
          <Select
            value={selectValue}
            onValueChange={(v) => {
              if (v === RECEIPT_LOT_SELECT_NONE) {
                setValue(`details.${rowIndex}.batchNumber`, "")
                setValue(`details.${rowIndex}.expiryDate`, "")
                return
              }
              if (v === RECEIPT_LOT_SELECT_MANUAL) {
                return
              }
              const opt = lotOptions.find((o) => o.selectValue === v)
              if (opt != null) {
                setValue(`details.${rowIndex}.batchNumber`, opt.batchNumber)
                setValue(`details.${rowIndex}.expiryDate`, opt.expiryDay)
              }
            }}
            disabled={!isEditable || isPending}
          >
            <SelectTrigger
              className={cn(
                FORM_INPUT_CLASS,
                "h-10 w-full min-w-[120px] text-left font-mono text-xs group-hover:bg-white focus:bg-white",
                FORM_FIELD_DISABLED_OPAQUE,
              )}
            >
              <SelectValue placeholder={isPending ? "Đang tải lô…" : "Chọn lô từ tồn…"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECEIPT_LOT_SELECT_NONE} className="text-slate-600">
                — Chưa chọn từ tồn —
              </SelectItem>
              {lotOptions.map((o) => (
                <SelectItem key={o.selectValue} value={o.selectValue} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
              <SelectItem value={RECEIPT_LOT_SELECT_MANUAL}>Nhập tay / lô mới</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
        <Input
          placeholder={productId > 0 && lotOptions.length > 0 ? "Số lô (nhập tay nếu cần)" : "BATCH..."}
          {...register(`details.${rowIndex}.batchNumber`)}
          disabled={!isEditable}
          className={cn(
            FORM_INPUT_CLASS,
            "mt-1 h-10 font-mono text-xs group-hover:bg-white focus:bg-white",
            productId > 0 && lotOptions.length > 0 ? "min-h-10" : "",
            FORM_FIELD_DISABLED_OPAQUE,
          )}
        />
      </TableCell>
      <TableCell className="px-1 text-left">
        <Input
          type="date"
          {...register(`details.${rowIndex}.expiryDate`)}
          disabled={!isEditable}
          className={cn(
            FORM_INPUT_CLASS,
            "h-10 text-left text-xs group-hover:bg-white focus:bg-white px-2",
            FORM_FIELD_DISABLED_OPAQUE,
          )}
        />
      </TableCell>
    </>
  )
}

function normExpiryDay(s: string | undefined): string {
  if (s == null || s.trim() === "") return ""
  return s.trim().split("T")[0] ?? ""
}
