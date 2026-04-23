/**
 * Chuẩn layout bảng danh sách (Data Table) — đồng bộ với `docs/rules/RULES_UI_TABLE.md`.
 * Import các constant này khi tạo bảng mới để giữ width / sticky / root class nhất quán.
 */

/** Gốc `<Table>`: một thead + tbody, `table-fixed`, không cuộn ngang trên desktop (fit window). */
export const DATA_TABLE_ROOT_CLASS =
  "bg-white border-none border-separate border-spacing-0 table-fixed w-full"

/** Vỏ bảng (wrapper) chuẩn: border + radius + shadow, dùng chung toàn project. */
export const DATA_TABLE_SHELL_CLASS =
  "flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md"

/** Vùng cuộn bảng (1 vùng cuộn cho thead sticky + tbody). */
export const DATA_TABLE_SCROLL_CLASS =
  "flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"

/**
 * Cột NV / Thao tác: tối thiểu ~168px để vừa 3 nút `size="icon"` h-8 w-8 + gap-1 + padding cell.
 * Không đặt `flex` trực tiếp trên `<td>` / `<th>` — bọc nút trong `<div className="flex ...">`.
 */
export const DATA_TABLE_ACTION_COL_WIDTH = "w-[168px]"

export const DATA_TABLE_ACTION_HEAD_CLASS = `${DATA_TABLE_ACTION_COL_WIDTH} text-center sticky right-0 z-30 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)]`

export const DATA_TABLE_ACTION_CELL_CLASS = `${DATA_TABLE_ACTION_COL_WIDTH} text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50/50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`

/** Một nút icon (vd: Tồn kho — xem lô; Kiểm kê — mở chi tiết). */
export const DATA_TABLE_ACTION_SINGLE_COL_WIDTH = "w-[96px]"

export const DATA_TABLE_ACTION_SINGLE_HEAD_CLASS = `${DATA_TABLE_ACTION_SINGLE_COL_WIDTH} text-center sticky right-0 z-30 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)]`

export const DATA_TABLE_ACTION_SINGLE_CELL_CLASS = `${DATA_TABLE_ACTION_SINGLE_COL_WIDTH} text-center sticky right-0 z-10 bg-white group-hover:bg-slate-50/50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`

/** Phiếu nhập kho — width khớp thead/tbody */
export const RECEIPT_TABLE_COL = {
  receiptCode: "w-[116px]",
  supplierName: "min-w-[200px]",
  receiptDate: "w-[100px]",
  staffName: "w-[152px]",
  invoiceNumber: "w-[92px]",
  lineCount: "w-[72px]",
  totalAmount: "w-[124px]",
  status: "w-[112px]",
} as const

/** Phiếu xuất kho */
export const DISPATCH_TABLE_COL = {
  dispatchCode: "w-[116px]",
  orderCode: "w-[116px]",
  customerName: "min-w-[200px]",
  dispatchDate: "w-[100px]",
  userName: "w-[152px]",
  itemCount: "w-[72px]",
  status: "w-[112px]",
} as const

/** Tồn kho (danh sách SKU) — có cột checkbox */
export const STOCK_TABLE_COL = {
  select: "w-[48px]",
  skuCode: "w-[112px]",
  productName: "min-w-[200px]",
  location: "w-[120px]",
  quantity: "w-[108px]",
  expiryDate: "w-[120px]",
  status: "w-[120px]",
} as const

/** Đợt kiểm kê kho (danh sách phiên) */
export const AUDIT_SESSION_TABLE_COL = {
  auditCode: "w-[128px]",
  title: "min-w-[200px]",
  auditDate: "w-[104px]",
  createdByName: "w-[152px]",
  progress: "w-[104px]",
  varianceHint: "w-[100px]",
  status: "w-[120px]",
} as const

/** Sản phẩm (danh sách SKU) */
export const PRODUCT_TABLE_COL = {
  select: "w-[48px]",
  skuCode: "w-[112px]",
  productName: "min-w-[280px]",
  categoryName: "w-[160px]",
  stock: "w-[108px]",
  price: "w-[140px]",
  status: "w-[120px]",
} as const

/** Danh mục sản phẩm (cấu trúc cây) */
export const CATEGORY_TABLE_COL = {
  select: "w-[48px]",
  categoryCode: "w-[180px]",
  categoryName: "min-w-[240px]",
  productCount: "w-[92px]",
  description: "min-w-[240px]",
  status: "w-[120px]",
} as const
/** Khách hàng */
export const CUSTOMER_TABLE_COL = {
  select: "w-[48px]",
  code: "w-[112px]",
  name: "min-w-[180px]",
  phone: "w-[124px]",
  email: "w-[160px]",
  loyalty: "w-[108px]",
  spending: "w-[124px]",
  orders: "w-[72px]",
  status: "w-[112px]",
} as const

/** Nhà cung cấp */
export const SUPPLIER_TABLE_COL = {
  select: "w-[48px]",
  code: "w-[112px]",
  name: "min-w-[200px]",
  contact: "w-[140px]",
  email: "w-[180px]",
  address: "min-w-[200px]",
  status: "w-[112px]",
} as const

/** Đơn hàng */
export const ORDER_TABLE_COL = {
  select: "w-[48px]",
  code: "w-[116px]",
  customer: "min-w-[180px]",
  date: "w-[104px]",
  items: "w-[84px]",
  total: "w-[128px]",
  payment: "w-[112px]",
  status: "w-[120px]",
} as const

/** Nhân viên / Người dùng */
export const USER_TABLE_COL = {
  select: "w-[48px]",
  avatar: "w-[56px]",
  fullName: "min-w-[160px]", // Fix key to fullName as used in table
  role: "w-[120px]",
  email: "w-[180px]",
  phone: "w-[124px]",
  status: "w-[112px]",
} as const

/** Giao dịch tài chính (Thu chi) */
export const TRANSACTION_TABLE_COL = {
  select: "w-[48px]",
  code: "w-[116px]",
  date: "w-[120px]",
  type: "w-[100px]",
  category: "w-[140px]",
  amount: "w-[140px]",
  method: "w-[112px]",
  status: "w-[112px]",
  description: "min-w-[200px]",
} as const

/** Sổ nợ */
export const DEBT_TABLE_COL = {
  select: "w-[48px]",
  code: "w-[116px]",
  partner: "min-w-[180px]",
  type: "w-[100px]",
  total: "w-[124px]",
  paid: "w-[124px]",
  remaining: "w-[124px]",
  lastUpdate: "w-[120px]",
  status: "w-[112px]",
} as const

/** Sổ cái */
export const LEDGER_TABLE_COL = {
  date: "w-[112px]",
  code: "w-[116px]",
  description: "min-w-[200px]",
  debit: "w-[124px]",
  credit: "w-[124px]",
  balance: "w-[140px]",
} as const

/**
 * Typography Standards — đồng bộ với ADR-005.
 * Dùng cho các thẻ <th>, <td>, <Label>, <Input>.
 */

export const TABLE_HEAD_CLASS = "text-[12px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200"

export const TABLE_CELL_PRIMARY_CLASS = "text-sm font-semibold text-slate-900"
export const TABLE_CELL_SECONDARY_CLASS = "text-sm text-slate-600"
export const TABLE_CELL_MONO_CLASS = "text-[13px] font-mono font-medium text-slate-500"
export const TABLE_CELL_NUMBER_CLASS = "text-sm font-medium text-slate-900 tabular-nums"

export const FORM_LABEL_CLASS = "text-sm font-semibold text-slate-700 block mb-1.5"
export const FORM_INPUT_CLASS = "h-11 border-slate-200 focus:ring-slate-100 focus:border-slate-900"
export const FORM_HELPER_CLASS = "text-xs text-slate-500 mt-1"
