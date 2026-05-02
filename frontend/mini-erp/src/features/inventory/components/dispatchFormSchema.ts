import { z } from "zod"

const emptyLine = () => ({
  productId: 0,
  inventoryId: 0,
  dispatchQty: 1,
  unitPriceSnapshot: 0,
  unitName: "",
  productLabel: "",
  batchNumber: "",
})

export const dispatchLineSchema = z.object({
  productId: z.number().min(1, "Chọn sản phẩm"),
  inventoryId: z.number().min(1, "Chọn lô tồn"),
  dispatchQty: z.number().min(1, "SL > 0"),
  unitPriceSnapshot: z.number().min(0),
  unitName: z.string().min(1),
  productLabel: z.string().min(1),
  batchNumber: z.string().optional(),
})

export const dispatchFormSchema = z.object({
  dispatchDate: z.string().min(1, "Chọn ngày xuất"),
  referenceLabel: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(dispatchLineSchema).min(1, "Thêm ít nhất một dòng hàng"),
})

export type DispatchFormData = z.infer<typeof dispatchFormSchema>

export { emptyLine }
