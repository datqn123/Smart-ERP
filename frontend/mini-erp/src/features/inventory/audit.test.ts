import { describe, it, expect } from 'vitest';
import { mockAuditSessions } from './mockData';
import { calculateVariancePercent } from './utils';

describe('Mock Data - Inventory Audit (Task007)', () => {
  describe('Audit Statuses', () => {
    it('nên có đủ các trạng thái', () => {
      const statuses = new Set(mockAuditSessions.map(a => a.status));
      expect(statuses.has('Pending')).toBe(true);
      expect(statuses.has('In Progress')).toBe(true);
      expect(statuses.has('Completed')).toBe(true);
    });

    it('nên có phiếu Completed', () => {
      const completed = mockAuditSessions.find(a => a.status === 'Completed');
      expect(completed).toBeDefined();
      expect(completed?.completedAt).toBeDefined();
    });

    it('nên có phiếu In Progress', () => {
      const inProgress = mockAuditSessions.find(a => a.status === 'In Progress');
      expect(inProgress).toBeDefined();
    });

    it('nên có phiếu Pending', () => {
      const pending = mockAuditSessions.find(a => a.status === 'Pending');
      expect(pending).toBeDefined();
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

    it('nên đánh dấu isCounted khi có actualQuantity', () => {
      mockAuditSessions.forEach(session => {
        session.items.forEach(item => {
          if (item.actualQuantity !== undefined) {
            expect(item.isCounted).toBe(true);
          }
        });
      });
    });
  });

  describe('Variance Status (Task007)', () => {
    const getVarianceStatus = (variance: number) => {
      if (variance === 0) return 'match';
      return variance > 0 ? 'surplus' : 'deficit';
    };

    it('nên nhận diện "match" khi variance = 0', () => {
      expect(getVarianceStatus(0)).toBe('match');
    });

    it('nên nhận diện "surplus" khi variance > 0 (thừa)', () => {
      expect(getVarianceStatus(5)).toBe('surplus');
    });

    it('nên nhận diện "deficit" khi variance < 0 (thiếu)', () => {
      expect(getVarianceStatus(-5)).toBe('deficit');
    });

    it('nên có items với đủ 3 trạng thái trong mock data', () => {
      const hasMatch = mockAuditSessions.some(s => s.items.some(i => i.variance === 0));
      const hasSurplus = mockAuditSessions.some(s => s.items.some(i => i.variance > 0));
      const hasDeficit = mockAuditSessions.some(s => s.items.some(i => i.variance < 0));
      
      expect(hasMatch).toBe(true);
      expect(hasSurplus).toBe(true);
      expect(hasDeficit).toBe(true);
    });
  });

  describe('Audit Progress (Task007)', () => {
    const calculateProgress = (items: { isCounted: boolean }[]) => {
      const counted = items.filter(i => i.isCounted).length;
      const total = items.length;
      return { counted, total, percentage: (counted / total) * 100 };
    };

    it('nên tính đúng progress', () => {
      const completedSession = mockAuditSessions.find(s => s.status === 'Completed');
      expect(completedSession).toBeDefined();
      
      if (completedSession) {
        const progress = calculateProgress(completedSession.items);
        expect(progress.percentage).toBe(100);
      }
    });

    it('nên có uncounted items trong session In Progress', () => {
      const inProgress = mockAuditSessions.find(s => s.status === 'In Progress');
      expect(inProgress).toBeDefined();
      
      if (inProgress) {
        const uncounted = inProgress.items.filter(i => !i.isCounted).length;
        expect(uncounted).toBeGreaterThan(0);
      }
    });
  });

  describe('Audit Code Format (Task007)', () => {
    it('nên đúng định dạng KK-YYYY-NNNN', () => {
      mockAuditSessions.forEach(session => {
        expect(session.auditCode).toMatch(/^KK-\d{4}-\d{4}$/);
      });
    });
  });

  describe('Adjustment Logic (Task007)', () => {
    const canAdjust = (status: string) => {
      return status === 'In Progress';
    };

    it('nên cho phép điều chỉnh khi In Progress', () => {
      expect(canAdjust('In Progress')).toBe(true);
    });

    it('nên không cho phép điều chỉnh khi Completed', () => {
      expect(canAdjust('Completed')).toBe(false);
    });
  });
});