export type ApprovalType = 'Inbound' | 'Outbound' | 'Return' | 'Debt';

export type ApprovalTransaction = {
  id: number;
  transactionCode: string;
  type: ApprovalType;
  creatorName: string;
  date: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  rejectionReason?: string;
  processedDate?: string;
}
