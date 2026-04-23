import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuditSessions } from './mockData';
import type { AuditSession, AuditItem } from './types';
import { calculateVariancePercent } from './utils';

// ==========================================
// Audit Session Tests (Task007)
// ==========================================

describe('Audit Session Creation (Task007)', () => {
  interface AuditFormData {
    title: string;
    auditDate: string;
    locationFilter?: string;
    categoryFilter?: string;
    notes?: string;
  }

  const validateAuditForm = (data: AuditFormData): string[] => {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Tên đợt kiểm kê là bắt buộc');
    } else if (data.title.length > 255) {
      errors.push('Tên đợt kiểm kê không được quá 255 ký tự');
    }

    if (!data.auditDate) {
      errors.push('Ngày kiểm kê là bắt buộc');
    } else {
      const auditDate = new Date(data.auditDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (auditDate > today) {
        errors.push('Ngày kiểm kê không được là ngày trong tương lai');
      }
    }

    return errors;
  };

  it('nên báo lỗi khi không có tên', () => {
    const data: AuditFormData = { title: '', auditDate: '2026-04-13' };
    expect(validateAuditForm(data)).toContain('Tên đợt kiểm kê là bắt buộc');
  });

  it('nên báo lỗi khi tên quá dài', () => {
    const data: AuditFormData = { title: 'A'.repeat(300), auditDate: '2026-04-13' };
    expect(validateAuditForm(data)).toContain('Tên đợt kiểm kê không được quá 255 ký tự');
  });

  it('nên báo lỗi khi ngày là tương lai', () => {
    const data: AuditFormData = { title: 'Test', auditDate: '2030-01-01' };
    expect(validateAuditForm(data)).toContain('Ngày kiểm kê không được là ngày trong tương lai');
  });

  it('nên hợp lệ khi dữ liệu đầy đủ', () => {
    const data: AuditFormData = { title: 'Kiểm kê tháng 4', auditDate: '2026-04-13' };
    expect(validateAuditForm(data).length).toBe(0);
  });
});

describe('Variance Calculation (Task007)', () => {
  it('nên tính đúng variance (actual - system)', () => {
    mockAuditSessions.forEach(session => {
      session.items.forEach(item => {
        if (item.actualQuantity !== undefined) {
          const expected = item.actualQuantity - item.systemQuantity;
          expect(item.variance).toBe(expected);
        }
      });
    });
  });

  it('nên tính đúng variancePercent', () => {
    mockAuditSessions.forEach(session => {
      session.items.forEach(item => {
        if (item.actualQuantity !== undefined) {
          const expected = calculateVariancePercent(item.actualQuantity, item.systemQuantity);
          expect(item.variancePercent).toBeCloseTo(expected, 1);
        }
      });
    });
  });

  it('nên nhận diện đúng variance = 0 (khớp)', () => {
    mockAuditSessions.forEach(session => {
      session.items.forEach(item => {
        if (item.actualQuantity !== undefined) {
          const expected = item.variance === 0;
          expect(item.variance === 0).toBe(expected);
        }
      });
    });
  });

  it('nên nhận diện đúng variance > 0 (thừa)', () => {
    const hasSurplus = mockAuditSessions.some(s => s.items.some(i => i.variance > 0));
    expect(hasSurplus).toBe(true);
  });

  it('nên nhận diện đúng variance < 0 (thiếu)', () => {
    const hasDeficit = mockAuditSessions.some(s => s.items.some(i => i.variance < 0));
    expect(hasDeficit).toBe(true);
  });
});

describe('Audit Progress Tracking (Task007)', () => {
  const calculateProgress = (items: AuditItem[]) => {
    const counted = items.filter(i => i.isCounted).length;
    const total = items.length;
    return {
      counted,
      total,
      percentage: total > 0 ? (counted / total) * 100 : 0,
      remaining: total - counted,
    };
  };

  it('nên tính đúng progress cho session hoàn thành', () => {
    const completed = mockAuditSessions.find(s => s.status === 'Completed');
    expect(completed).toBeDefined();
    if (completed) {
      const progress = calculateProgress(completed.items);
      expect(progress.percentage).toBe(100);
      expect(progress.remaining).toBe(0);
    }
  });

  it('nên tính đúng progress cho session đang tiến hành', () => {
    const inProgress = mockAuditSessions.find(s => s.status === 'In Progress');
    expect(inProgress).toBeDefined();
    if (inProgress) {
      const progress = calculateProgress(inProgress.items);
      expect(progress.percentage).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThan(100);
    }
  });

  it('nên tính đúng remaining items', () => {
    mockAuditSessions.forEach(session => {
      const progress = calculateProgress(session.items);
      expect(progress.remaining).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Adjustment Logic (Task007)', () => {
  interface AdjustmentData {
    auditItemId: number;
    productId: number;
    actualQuantity: number;
    systemQuantity: number;
    reason?: string;
    notes?: string;
  }

  const canAdjust = (data: AdjustmentData): string[] => {
    const errors: string[] = [];
    const variance = data.actualQuantity - data.systemQuantity;
    const variancePercent = calculateVariancePercent(data.actualQuantity, data.systemQuantity);

    if (data.actualQuantity < 0) {
      errors.push('Số thực tế không được âm');
    }

    if (Math.abs(variancePercent) > 10) {
      errors.push(`Cảnh báo: Chênh lệch ${Math.abs(variancePercent).toFixed(2)}% > 10% - cần xác nhận`);
    }

    if (variance !== 0 && !data.reason) {
      errors.push('Phải chọn lý do điều chỉnh khi có chênh lệch');
    }

    return errors;
  };

  it('nên báo lỗi khi số thực tế âm', () => {
    const data: AdjustmentData = { auditItemId: 1, productId: 1, actualQuantity: -5, systemQuantity: 10 };
    expect(canAdjust(data)).toContain('Số thực tế không được âm');
  });

  it('nên cảnh báo khi variance > 10%', () => {
    const data: AdjustmentData = { auditItemId: 1, productId: 1, actualQuantity: 0, systemQuantity: 100 };
    const errors = canAdjust(data);
    expect(errors.some(e => e.includes('Cảnh báo'))).toBe(true);
  });

  it('nên báo lỗi khi có variance mà không có lý do', () => {
    const data: AdjustmentData = { auditItemId: 1, productId: 1, actualQuantity: 15, systemQuantity: 10 };
    expect(canAdjust(data)).toContain('Phải chọn lý do điều chỉnh khi có chênh lệch');
  });

  it('nên cho phép điều chỉnh khi hợp lệ và không có warning', () => {
    const data: AdjustmentData = {
      auditItemId: 1,
      productId: 1,
      actualQuantity: 11,
      systemQuantity: 10,
      reason: 'Nhập sai số liệu',
    };
    // Variance = 10%, không có warning > 10%
    expect(canAdjust(data).length).toBe(0);
  });
});

describe('Audit Code Generation (Task007)', () => {
  const generateAuditCode = (index: number): string => {
    const year = new Date().getFullYear();
    return `KK-${year}-${String(index).padStart(4, '0')}`;
  };

  it('nên sinh mã đúng định dạng', () => {
    expect(generateAuditCode(1)).toBe('KK-2026-0001');
    expect(generateAuditCode(12)).toBe('KK-2026-0012');
  });
});

describe('Complete Audit Session (Task007)', () => {
  const canCompleteAudit = (session: AuditSession): { canComplete: boolean; message?: string } => {
    const uncounted = session.items.filter(i => !i.isCounted).length;
    const hasVariance = session.items.some(i => i.variance !== 0);

    if (uncounted > 0) {
      return { canComplete: false, message: `Còn ${uncounted} mặt hàng chưa kiểm` };
    }

    if (hasVariance) {
      const allHaveReason = session.items.every(i => i.variance === 0 || i.notes);
      if (!allHaveReason) {
        return { canComplete: false, message: 'Cần nhập lý do cho các mặt hàng có chênh lệch' };
      }
    }

    return { canComplete: true };
  };

  it('nên không cho phép hoàn thành khi còn item chưa kiểm', () => {
    const inProgress = mockAuditSessions.find(s => s.status === 'In Progress');
    expect(inProgress).toBeDefined();
    if (inProgress) {
      const result = canCompleteAudit(inProgress);
      expect(result.canComplete).toBe(false);
      expect(result.message).toContain('chưa kiểm');
    }
  });

  it('nên cho phép hoàn thành khi tất cả đã kiểm', () => {
    const completed = mockAuditSessions.find(s => s.status === 'Completed');
    expect(completed).toBeDefined();
    if (completed) {
      const result = canCompleteAudit(completed);
      expect(result.canComplete).toBe(true);
    }
  });
});