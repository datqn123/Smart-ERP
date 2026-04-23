import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  generateReceiptCode,
  generateDispatchCode,
  generateAuditCode,
  calculateVariancePercent 
} from './utils';

describe('formatCurrency()', () => {
  it('nên định dạng đúng số tiền sang VND', () => {
    expect(formatCurrency(1000000)).toContain('1.000.000');
    expect(formatCurrency(1000000)).toContain('₫');
  });

  it('nên xử lý số 0', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('nên xử lý số lẻ', () => {
    expect(formatCurrency(1234567)).toContain('1.234.567');
  });
});

describe('formatDate()', () => {
  it('nên định dạng ngày DD/MM/YYYY', () => {
    const result = formatDate('2026-04-13');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('nên trả về "-" khi không có ngày', () => {
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate(null)).toBe('-');
  });
});

describe('formatDateTime()', () => {
  it('nên định dạng ngày giờ DD/MM/YYYY HH:mm', () => {
    const result = formatDateTime('2026-04-13T10:30:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toMatch(/:/);
  });
});

describe('generateReceiptCode()', () => {
  it('nên sinh mã đúng định dạng PN-YYYY-NNNN', () => {
    expect(generateReceiptCode(1)).toMatch(/^PN-\d{4}-0001$/);
    expect(generateReceiptCode(12)).toMatch(/^PN-\d{4}-0012$/);
    expect(generateReceiptCode(123)).toMatch(/^PN-\d{4}-0123$/);
  });
});

describe('generateDispatchCode()', () => {
  it('nên sinh mã đúng định dạng PX-YYYY-NNNN', () => {
    expect(generateDispatchCode(1)).toMatch(/^PX-\d{4}-0001$/);
  });
});

describe('generateAuditCode()', () => {
  it('nên sinh mã đúng định dạng KK-YYYY-NNNN', () => {
    expect(generateAuditCode(1)).toMatch(/^KK-\d{4}-0001$/);
  });
});

describe('calculateVariancePercent()', () => {
  it('nên tính đúng phần trăm chênh lệch', () => {
    expect(calculateVariancePercent(100, 100)).toBe(0);
    expect(calculateVariancePercent(110, 100)).toBe(10);
    expect(calculateVariancePercent(90, 100)).toBe(-10);
  });

  it('nên trả về 0 khi system quantity = 0', () => {
    expect(calculateVariancePercent(10, 0)).toBe(0);
  });
});