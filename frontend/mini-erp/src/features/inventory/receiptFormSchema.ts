import { z } from "zod"
import { isExpiryValid } from "./inboundLogic"

export const receiptSchema = z
  .object({
    supplierId: z.number().min(1, "Vui lòng chọn nhà cung cấp"),
    receiptDate: z.string().min(1, "Vui lòng chọn ngày nhập"),
    invoiceNumber: z.string().optional(),
    notes: z.string().optional(),
    details: z
      .array(
        z.object({
          productId: z.number().min(1, "Chọn sản phẩm"),
          unitId: z.number().min(1, "Thiếu đơn vị (chọn lại sản phẩm)"),
          quantity: z.number().min(1, "Min = 1"),
          costPrice: z.number().min(0, "Min = 0"),
          batchNumber: z.string().optional(),
          expiryDate: z.string().optional(),
        }),
      )
      .min(1, "Phải có ít nhất 1 sản phẩm"),
  })
  .refine(
    (data) => {
      return data.details.every((d) => isExpiryValid(data.receiptDate, d.expiryDate))
    },
    {
      message: "Hạn sử dụng không được nhỏ hơn ngày nhập",
      path: ["details"],
    },
  )

export type ReceiptFormData = z.infer<typeof receiptSchema>
