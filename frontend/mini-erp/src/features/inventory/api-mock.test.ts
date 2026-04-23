import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockInventory, mockStockReceipts, mockStockDispatchs, mockAuditSessions } from './mockData';

// ==========================================
// Mock API Tests - Inventory (Task004)
// ==========================================

describe('Mock API - Inventory (Task004)', () => {
  const mockApi = {
    getInventory: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockInventory), 100);
      });
    },
    getInventoryById: async (id: number) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const item = mockInventory.find(i => i.id === id);
          if (item) resolve(item);
          else reject(new Error('Không tìm thấy sản phẩm'));
        }, 100);
      });
    },
    updateInventory: async (id: number, data: Partial<typeof mockInventory[0]>) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockInventory.findIndex(i => i.id === id);
          if (index >= 0) {
            mockInventory[index] = { ...mockInventory[index], ...data };
          }
          resolve(true);
        }, 100);
      });
    },
  };

  it('nên gọi API getInventory', async () => {
    const data = await mockApi.getInventory();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('nên gọi API getInventoryById với id hợp lệ', async () => {
    const item = await mockApi.getInventoryById(1);
    expect(item).toBeDefined();
    expect(item.id).toBe(1);
  });

  it('nên reject khi getInventoryById với id không tồn tại', async () => {
    await expect(mockApi.getInventoryById(999)).rejects.toThrow('Không tìm thấy sản phẩm');
  });

  it('nên gọi API updateInventory', async () => {
    const result = await mockApi.updateInventory(1, { quantity: 100 });
    expect(result).toBe(true);
  });
});

// ==========================================
// Mock API - Stock Receipts (Task005)
// ==========================================

describe('Mock API - Stock Receipts (Task005)', () => {
  const mockReceiptApi = {
    getReceipts: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockStockReceipts), 100);
      });
    },
    createReceipt: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReceipt = {
            id: mockStockReceipts.length + 1,
            ...data,
            createdAt: new Date().toISOString(),
          };
          resolve(newReceipt);
        }, 100);
      });
    },
    submitReceipt: async (id: number) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const receipt = mockStockReceipts.find(r => r.id === id);
          if (receipt && receipt.status === 'Draft') {
            resolve({ ...receipt, status: 'Pending' });
          } else {
            reject(new Error('Không thể gửi phê duyệt'));
          }
        }, 100);
      });
    },
    approveReceipt: async (id: number, approvedBy: number, notes?: string) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const receipt = mockStockReceipts.find(r => r.id === id);
          if (receipt && receipt.status === 'Pending') {
            resolve({
              ...receipt,
              status: 'Approved',
              approvedBy,
              approvedAt: new Date().toISOString(),
              notes,
            });
          } else {
            reject(new Error('Không thể phê duyệt'));
          }
        }, 100);
      });
    },
    rejectReceipt: async (id: number, approvedBy: number, reason: string) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const receipt = mockStockReceipts.find(r => r.id === id);
          if (receipt && receipt.status === 'Pending') {
            resolve({
              ...receipt,
              status: 'Rejected',
              approvedBy,
              approvedAt: new Date().toISOString(),
              notes: reason,
            });
          } else {
            reject(new Error('Không thể từ chối'));
          }
        }, 100);
      });
    },
  };

  it('nên gọi API getReceipts', async () => {
    const data = await mockReceiptApi.getReceipts();
    expect(data).toBeDefined();
  });

  it('nên tạo receipt mới', async () => {
    const newReceipt = await mockReceiptApi.createReceipt({
      receiptCode: 'PN-2026-9999',
      supplierId: 1,
      supplierName: 'Test',
      status: 'Draft',
    });
    expect(newReceipt).toBeDefined();
  });

  it('nên gửi phê duyệt receipt Draft', async () => {
    const draft = mockStockReceipts.find(r => r.status === 'Draft');
    expect(draft).toBeDefined();
    if (draft) {
      const result = await mockReceiptApi.submitReceipt(draft.id);
      expect(result.status).toBe('Pending');
    }
  });

  it('nên phê duyệt receipt Pending', async () => {
    const pending = mockStockReceipts.find(r => r.status === 'Pending');
    expect(pending).toBeDefined();
    if (pending) {
      const result = await mockReceiptApi.approveReceipt(pending.id, 1);
      expect(result.status).toBe('Approved');
    }
  });

  it('nên từ chối receipt Pending', async () => {
    const pending = mockStockReceipts.find(r => r.status === 'Pending');
    expect(pending).toBeDefined();
    if (pending) {
      const result = await mockReceiptApi.rejectReceipt(pending.id, 1, 'Sai đơn giá');
      expect(result.status).toBe('Rejected');
    }
  });
});

// ==========================================
// Mock API - Stock Dispatch (Task006)
// ==========================================

describe('Mock API - Stock Dispatch (Task006)', () => {
  const mockDispatchApi = {
    getDispatches: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockStockDispatchs), 100);
      });
    },
    createDispatch: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: 999, status: 'Pending', ...data });
        }, 100);
      });
    },
    confirmDispatch: async (id: number) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const dispatch = mockStockDispatchs.find(d => d.id === id);
          if (dispatch && dispatch.status === 'Pending') {
            resolve({ ...dispatch, status: 'Full' });
          } else {
            reject(new Error('Không thể xác nhận'));
          }
        }, 100);
      });
    },
    cancelDispatch: async (id: number) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const dispatch = mockStockDispatchs.find(d => d.id === id);
          if (dispatch && (dispatch.status === 'Pending' || dispatch.status === 'Partial')) {
            resolve({ ...dispatch, status: 'Cancelled' });
          } else {
            reject(new Error('Không thể hủy'));
          }
        }, 100);
      });
    },
  };

  it('nên gọi API getDispatches', async () => {
    const data = await mockDispatchApi.getDispatches();
    expect(data).toBeDefined();
  });

  it('nên tạo dispatch mới', async () => {
    const dispatch = await mockDispatchApi.createDispatch({
      dispatchCode: 'PX-2026-9999',
      orderId: 1,
    });
    expect(dispatch.status).toBe('Pending');
  });

  it('nên xác nhận dispatch Pending', async () => {
    const pending = mockStockDispatchs.find(d => d.status === 'Pending');
    expect(pending).toBeDefined();
    if (pending) {
      const result = await mockDispatchApi.confirmDispatch(pending.id);
      expect(result.status).toBe('Full');
    }
  });
});

// ==========================================
// Mock API - Inventory Audit (Task007)
// ==========================================

describe('Mock API - Inventory Audit (Task007)', () => {
  const mockAuditApi = {
    getAudits: async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockAuditSessions), 100);
      });
    },
    createAudit: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: 999, status: 'Pending', ...data });
        }, 100);
      });
    },
    updateAuditItem: async (sessionId: number, itemId: number, actualQuantity: number, notes?: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ actualQuantity, notes, isCounted: true });
        }, 100);
      });
    },
    completeAudit: async (id: number) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const session = mockAuditSessions.find(a => a.id === id);
          if (session && session.status === 'In Progress') {
            resolve({ ...session, status: 'Completed' });
          } else {
            reject(new Error('Không thể hoàn thành'));
          }
        }, 100);
      });
    },
  };

  it('nên gọi API getAudits', async () => {
    const data = await mockAuditApi.getAudits();
    expect(data).toBeDefined();
  });

  it('nên tạo audit session mới', async () => {
    const audit = await mockAuditApi.createAudit({
      auditCode: 'KK-2026-9999',
      title: 'Test Audit',
    });
    expect(audit.status).toBe('Pending');
  });

  it('nên cập nhật audit item', async () => {
    const result = await mockAuditApi.updateAuditItem(1, 1, 100, 'Test');
    expect(result.actualQuantity).toBe(100);
    expect(result.isCounted).toBe(true);
  });
});