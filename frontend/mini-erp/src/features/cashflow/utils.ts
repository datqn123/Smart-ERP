/** Hiển thị UI — giá trị API/Task065 (`Cash`, `BankTransfer`, …) */
export function paymentMethodLabel(method?: string | null): string {
  switch (method) {
    case "Cash":
      return "Tiền mặt"
    case "BankTransfer":
    case "Transfer":
      return "Chuyển khoản"
    case "Credit":
    case "CreditCard":
      return "Thẻ tín dụng"
    default:
      return method?.trim() ? method : "Tiền mặt"
  }
}
