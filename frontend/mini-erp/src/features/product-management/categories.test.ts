import { describe, it, expect, beforeEach } from 'vitest';
import { mockCategories } from './mockData';
import type { Category } from './types';

// ==========================================
// Category Tests (Task009)
// ==========================================

describe('Category Tree Logic (Task009)', () => {
  const buildCategoryTree = (categories: Category[], parentId?: number, level = 0): any[] => {
    return categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({
        ...c,
        level,
        children: buildCategoryTree(categories, c.id, level + 1),
      }));
  };

  const getCategoryDepth = (categories: Category[], categoryId: number): number => {
    let depth = 0;
    let current = categories.find(c => c.id === categoryId);
    while (current && current.parentId) {
      depth++;
      current = categories.find(c => c.id === current!.parentId);
    }
    return depth;
  };

  it('nên xây dựng đúng cây danh mục', () => {
    const tree = buildCategoryTree(mockCategories);
    expect(tree.length).toBeGreaterThan(0);
  });

  it('nên tính đúng độ sâu của danh mục', () => {
    const rootCategory = mockCategories.find(c => !c.parentId);
    expect(rootCategory).toBeDefined();
    if (rootCategory) {
      const depth = getCategoryDepth(mockCategories, rootCategory.id);
      expect(depth).toBe(0);
    }
  });
});

describe('Category Validation (Task009)', () => {
  interface CategoryForm {
    name: string;
    categoryCode?: string;
    parentId?: number;
    description?: string;
    sortOrder?: number;
    status: 'Active' | 'Inactive';
  }

  const validateCategory = (data: CategoryForm): string[] => {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tên danh mục là bắt buộc');
    }
    if (data.name && data.name.length > 255) {
      errors.push('Tên danh mục không được quá 255 ký tự');
    }
    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      errors.push('Thứ tự sắp xếp không được âm');
    }
    return errors;
  };

  it('nên báo lỗi khi tên trống', () => {
    expect(validateCategory({ name: '', status: 'Active' })).toContain('Tên danh mục là bắt buộc');
  });

  it('nên báo lỗi khi tên quá dài', () => {
    expect(validateCategory({ name: 'A'.repeat(300), status: 'Active' })).toContain('Tên danh mục không được quá 255 ký tự');
  });

  it('nên hợp lệ khi dữ liệu đúng', () => {
    expect(validateCategory({ name: 'Đồ uống', status: 'Active' }).length).toBe(0);
  });
});

describe('Category Code Generation (Task009)', () => {
  const generateCategoryCode = (index: number): string => {
    return `CAT${String(index).padStart(3, '0')}`;
  };

  it('nên sinh mã đúng định dạng', () => {
    expect(generateCategoryCode(1)).toBe('CAT001');
    expect(generateCategoryCode(12)).toBe('CAT012');
  });
});

describe('Category Status (Task009)', () => {
  const canDeleteCategory = (hasChildren: boolean, hasProducts: boolean): boolean => {
    return !hasChildren && !hasProducts;
  };

  it('nên cho phép xóa khi không có con và sản phẩm', () => {
    expect(canDeleteCategory(false, false)).toBe(true);
  });

  it('nên chặn xóa khi có danh mục con', () => {
    expect(canDeleteCategory(true, false)).toBe(false);
  });

  it('nên chặn xóa khi có sản phẩm', () => {
    expect(canDeleteCategory(false, true)).toBe(false);
  });
});