import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge UI - Màu sắc & Layout (Task004-007)', () => {
  describe('Inventory Status Colors (Task004)', () => {
    it('nên có màu xanh cho "Còn hàng"', () => {
      const { container } = render(<StatusBadge status="in-stock" type="inventory" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-50');
      expect(badge).toHaveClass('text-green-700');
    });

    it('nên có màu đỏ cho "Sắp hết"', () => {
      const { container } = render(<StatusBadge status="low-stock" type="inventory" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-red-50');
      expect(badge).toHaveClass('text-red-700');
    });

    it('nên có màu đỏ đậm cho "Hết hàng"', () => {
      const { container } = render(<StatusBadge status="out-of-stock" type="inventory" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });
  });

  describe('Receipt Status Colors (Task005)', () => {
    it('nên có màu xám cho Draft', () => {
      const { container } = render(<StatusBadge status="Draft" type="receipt" />);
      expect(container.firstChild).toHaveClass('bg-slate-100');
    });

    it('nên có màu vàng cho Pending', () => {
      const { container } = render(<StatusBadge status="Pending" type="receipt" />);
      expect(container.firstChild).toHaveClass('bg-amber-50');
    });

    it('nên có màu xanh lá cho Approved', () => {
      const { container } = render(<StatusBadge status="Approved" type="receipt" />);
      expect(container.firstChild).toHaveClass('bg-green-50');
    });

    it('nên có màu đỏ cho Rejected', () => {
      const { container } = render(<StatusBadge status="Rejected" type="receipt" />);
      expect(container.firstChild).toHaveClass('bg-red-50');
    });
  });

  describe('Dispatch Status Colors (Task006)', () => {
    it('nên có màu vàng cho Pending', () => {
      const { container } = render(<StatusBadge status="Pending" type="dispatch" />);
      expect(container.firstChild).toHaveClass('bg-amber-50');
    });

    it('nên có màu xanh lá cho Full', () => {
      const { container } = render(<StatusBadge status="Full" type="dispatch" />);
      expect(container.firstChild).toHaveClass('bg-green-50');
    });

    it('nên có màu xanh dương cho Partial', () => {
      const { container } = render(<StatusBadge status="Partial" type="dispatch" />);
      expect(container.firstChild).toHaveClass('bg-blue-50');
    });
  });

  describe('Audit Status Colors (Task007)', () => {
    it('nên có màu vàng cho Pending', () => {
      const { container } = render(<StatusBadge status="Pending" type="audit" />);
      expect(container.firstChild).toHaveClass('bg-amber-50');
    });

    it('nên có màu xanh dương cho In Progress', () => {
      const { container } = render(<StatusBadge status="In Progress" type="audit" />);
      expect(container.firstChild).toHaveClass('bg-blue-50');
    });

    it('nên có màu xanh lá cho Completed', () => {
      const { container } = render(<StatusBadge status="Completed" type="audit" />);
      expect(container.firstChild).toHaveClass('bg-green-50');
    });
  });

  describe('Typography & Spacing', () => {
    it('nên có font-medium', () => {
      const { container } = render(<StatusBadge status="Approved" type="receipt" />);
      expect(container.firstChild).toHaveClass('font-medium');
    });

    it('nên có text-xs (12px)', () => {
      const { container } = render(<StatusBadge status="Approved" type="receipt" />);
      expect(container.firstChild).toHaveClass('text-xs');
    });

    it('nên có padding px-2.5 py-1', () => {
      const { container } = render(<StatusBadge status="Approved" type="receipt" />);
      expect(container.firstChild).toHaveClass('px-2.5');
      expect(container.firstChild).toHaveClass('py-1');
    });
  });
});