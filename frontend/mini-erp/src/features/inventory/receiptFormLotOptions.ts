import type { InventoryListItemResponse } from "./api/inventoryApi"

export const RECEIPT_LOT_SELECT_MANUAL = "__manual__" as const

export type ReceiptLotOption = {
  /** Khóa ổn định trong Select */
  selectValue: string
  batchNumber: string
  /** `yyyy-MM-dd` hoặc rỗng */
  expiryDay: string
  label: string
}

function normBatch(s: string | undefined): string {
  return (s ?? "").trim()
}

function normExpiryDay(s: string | null | undefined): string {
  if (s == null || String(s).trim() === "") return ""
  return String(s).trim().split("T")[0] ?? ""
}

/** Gộp các dòng tồn cùng (lô, HSD); gắn nhãn vị trí khi nhiều kệ. */
export function buildReceiptLotOptions(items: InventoryListItemResponse[]): ReceiptLotOption[] {
  const byKey = new Map<
    string,
    { batchNumber: string; expiryDay: string; labels: Set<string>; sortKey: string }
  >()
  for (const row of items) {
    const batchNumber = normBatch(row.batchNumber ?? undefined)
    const expiryDay = normExpiryDay(row.expiryDate)
    const key = `${batchNumber}\u0000${expiryDay}`
    const loc = [row.warehouseCode, row.shelfCode].filter(Boolean).join("-")
    if (!byKey.has(key)) {
      byKey.set(key, {
        batchNumber,
        expiryDay,
        labels: new Set(loc ? [loc] : []),
        sortKey: `${batchNumber}\u0000${expiryDay}`,
      })
    } else {
      const e = byKey.get(key)!
      if (loc) e.labels.add(loc)
    }
  }
  const out: ReceiptLotOption[] = []
  for (const [, v] of byKey) {
    const locSuffix = v.labels.size > 0 ? ` (${[...v.labels].sort().join(", ")})` : ""
    const batchPart = v.batchNumber || "(Không số lô)"
    const expPart = v.expiryDay ? ` · HSD ${v.expiryDay}` : ""
    out.push({
      selectValue: v.sortKey,
      batchNumber: v.batchNumber,
      expiryDay: v.expiryDay,
      label: `${batchPart}${expPart}${locSuffix}`,
    })
  }
  out.sort((a, b) => a.label.localeCompare(b.label, "vi"))
  return out
}

export function findLotOptionValue(batch: string | undefined, expiry: string | undefined, options: ReceiptLotOption[]): string | null {
  const b = normBatch(batch)
  const e = normExpiryDay(expiry)
  const key = `${b}\u0000${e}`
  return options.some((o) => o.selectValue === key) ? key : null
}
