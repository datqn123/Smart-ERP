import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApprovalTransaction } from '../types';
import { mockApprovals } from '../mockData';

interface ApprovalStore {
  pendingTransactions: ApprovalTransaction[];
  approvalHistory: ApprovalTransaction[];
  
  // Actions
  approveTransaction: (id: number) => void;
  rejectTransaction: (id: number, reason: string) => void;
  fetchData: () => void;
}

export const useApprovalStore = create<ApprovalStore>()(
  persist(
    (set, get) => ({
      pendingTransactions: mockApprovals.filter(t => t.status === 'Pending'),
      approvalHistory: mockApprovals.filter(t => t.status !== 'Pending'),
      
      fetchData: () => {
        // In real app, fetch from API
      },
      
      approveTransaction: (id) => {
        const transaction = get().pendingTransactions.find(t => t.id === id);
        if (transaction) {
          const updated: ApprovalTransaction = { 
            ...transaction, 
            status: 'Approved', 
            processedDate: new Date().toISOString() 
          };
          set({
            pendingTransactions: get().pendingTransactions.filter(t => t.id !== id),
            approvalHistory: [updated, ...get().approvalHistory]
          });
        }
      },
      
      rejectTransaction: (id, reason) => {
        const transaction = get().pendingTransactions.find(t => t.id === id);
        if (transaction) {
          const updated: ApprovalTransaction = { 
            ...transaction, 
            status: 'Rejected', 
            rejectionReason: reason,
            processedDate: new Date().toISOString() 
          };
          set({
            pendingTransactions: get().pendingTransactions.filter(t => t.id !== id),
            approvalHistory: [updated, ...get().approvalHistory]
          });
        }
      }
    }),
    {
      name: 'approval-storage',
    }
  )
);
