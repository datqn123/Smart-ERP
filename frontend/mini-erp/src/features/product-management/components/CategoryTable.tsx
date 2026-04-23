import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit2, Trash2, ChevronDown, ChevronRight, PlusCircle } from "lucide-react"
import type { Category } from "../types"
import { cn } from "@/lib/utils"
import {
  CATEGORY_TABLE_COL,
  DATA_TABLE_ACTION_CELL_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  DATA_TABLE_ROOT_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"

interface CategoryRowProps {
  category: Category
  level: number
  selectedIds: number[]
  onSelect: (id: number) => void
  onView: (item: Category) => void
  onEdit: (item: Category) => void
  onDelete: (item: Category) => void
  onAddSub: (parent: Category) => void
}

function CategoryRow({ 
  category, 
  level, 
  selectedIds, 
  onSelect, 
  onView, 
  onEdit,
  onDelete,
  onAddSub
}: CategoryRowProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = category.children && category.children.length > 0
  const isSelected = selectedIds.includes(category.id);

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    }
  }

  return (
    <>
      <TableRow className={cn("group h-14", isSelected ? "bg-slate-50" : "hover:bg-slate-50/50")}>
        <TableCell className="px-4 text-center">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onSelect(category.id)}
            className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
          />
        </TableCell>
        <TableCell className="px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button onClick={handleToggle} className="p-1 hover:bg-slate-200 rounded shrink-0">
                {expanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}
            <span className={TABLE_CELL_MONO_CLASS}>{category.categoryCode}</span>
          </div>
        </TableCell>
        <TableCell className={cn(TABLE_CELL_PRIMARY_CLASS, "px-4 truncate")}>{category.name}</TableCell>
        <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "px-4 text-center")}>{category.productCount ?? 0}</TableCell>
        <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 max-w-[200px] truncate")}>{category.description || '-'}</TableCell>
        <TableCell className="px-4">
          <Badge className={`${category.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'} text-xs font-normal border-none`}>
            {category.status === 'Active' ? 'Hoạt động' : 'Ngưng'}
          </Badge>
        </TableCell>
        <TableCell className={DATA_TABLE_ACTION_CELL_CLASS}>
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onView(category)} title="Xem chi tiết" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onAddSub(category)} title="Thêm danh mục con" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)} title="Chỉnh sửa" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(category)} title="Xóa" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && category.children?.map(child => (
        <CategoryRow 
          key={child.id} 
          category={child} 
          level={level + 1} 
          selectedIds={selectedIds} 
          onSelect={onSelect} 
          onView={onView} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onAddSub={onAddSub}
        />
      ))}
    </>
  )
}

// Flat list for "select all"
function flattenCategories(categories: Category[]): Category[] {
  let result: Category[] = [];
  categories.forEach(c => {
    result.push(c);
    if (c.children) {
      result = result.concat(flattenCategories(c.children));
    }
  });
  return result;
}

interface CategoryTableProps {
  data: Category[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onSelectAll: (checked: boolean) => void
  onView: (item: Category) => void
  onEdit: (item: Category) => void
  onDelete: (item: Category) => void
  onAddSub: (parent: Category) => void
}

export function CategoryTable({ 
  data, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onEdit,
  onDelete,
  onAddSub
}: CategoryTableProps) {

  const flatData = flattenCategories(data);
  const allSelected = flatData.length > 0 && selectedIds.length === flatData.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < flatData.length;

  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 shadow-sm border-b">
        <TableRow className="hover:bg-transparent border-slate-200 border-b">
          <TableHead className={cn(CATEGORY_TABLE_COL.select, "px-4 text-center", TABLE_HEAD_CLASS)}>
            <Checkbox 
              checked={allSelected ? true : someSelected ? "indeterminate" : false} 
              onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              className="border-slate-300 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600"
            />
          </TableHead>
          <TableHead className={cn(CATEGORY_TABLE_COL.categoryCode, TABLE_HEAD_CLASS, "px-4")}>Mã phân loại</TableHead>
          <TableHead className={cn(CATEGORY_TABLE_COL.categoryName, TABLE_HEAD_CLASS, "px-4")}>Tên danh mục</TableHead>
          <TableHead className={cn(CATEGORY_TABLE_COL.productCount, TABLE_HEAD_CLASS, "px-4 text-center")}>SL SP</TableHead>
          <TableHead className={cn(CATEGORY_TABLE_COL.description, TABLE_HEAD_CLASS, "px-4")}>Mô tả</TableHead>
          <TableHead className={cn(CATEGORY_TABLE_COL.status, TABLE_HEAD_CLASS, "px-4")}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-slate-500 text-sm">
              Không tìm thấy danh mục nào.
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <CategoryRow 
              key={item.id} 
              category={item} 
              level={0} 
              selectedIds={selectedIds} 
              onSelect={onSelect} 
              onView={onView} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onAddSub={onAddSub}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
