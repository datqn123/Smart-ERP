import type { ApprovalTransaction } from "./types";

export const mockApprovals: ApprovalTransaction[] = [
  {
    id: 1,
    transactionCode: "PN-240419-001",
    type: "Inbound",
    creatorName: "Nguyễn Văn Kho",
    date: "2024-04-19T08:30:00Z",
    totalAmount: 12500000,
    status: "Pending",
    notes: "Nhập hàng sữa từ Vinamilk"
  },
  {
    id: 2,
    transactionCode: "PX-240419-002",
    type: "Outbound",
    creatorName: "Trần Thị Bán",
    date: "2024-04-19T09:15:00Z",
    totalAmount: 3400000,
    status: "Pending",
    notes: "Xuất hàng cho đại lý cấp 1"
  },
  {
    id: 3,
    transactionCode: "PTH-240418-005",
    type: "Return",
    creatorName: "Lê Văn Trả",
    date: "2024-04-18T14:20:00Z",
    totalAmount: 500000,
    status: "Approved",
    processedDate: "2024-04-18T16:00:00Z",
    notes: "Hàng lỗi bao bì"
  },
  {
    id: 4,
    transactionCode: "PN-240418-002",
    type: "Inbound",
    creatorName: "Nguyễn Văn Kho",
    date: "2024-04-18T10:00:00Z",
    totalAmount: 8900000,
    status: "Rejected",
    rejectionReason: "Sai đơn giá so với hợp đồng",
    processedDate: "2024-04-18T11:30:00Z",
    notes: "Nhập bánh kẹo Kinh Đô"
  }
];
