import { useEffect, useMemo, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { Package, AlertTriangle, CalendarClock, TrendingUp } from "lucide-react"
import { formatCurrency } from "../utils"
import { mockInventory } from "../mockData"
import type { InventoryItem, InventoryFilters } from "../types"
import { toast } from "sonner"
import { applyBulkApprove, applyBulkDelete, recalculateKPIs } from "../inventoryLogic"

import { StockToolbar } from "../components/StockToolbar"
import { StockTable } from "../components/StockTable"
import { StockBatchDetailsDialog } from "../components/StockBatchDetailsDialog"
import { StockActionDialog } from "../components/StockActionDialog"
import { StockEditDialog } from "../components/StockEditDialog"

function KPICard({ title, value, icon, color }: {
  title: string; value: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white p-4 md:p-5 flex items-start gap-3 border border-slate-200 rounded-lg shadow-sm">
      <div className={`p-2.5 ${color} rounded-md flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-lg md:text-xl font-semibold text-slate-900 truncate tracking-tight">{value}</p>
      </div>
    </div>
  )
}

export function StockPage() {
  const { setTitle } = usePageTitle()
  const [filters, setFilters] = useState<InventoryFilters>({ search: "", status: "all" })
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventory)
  const kpis = useMemo(() => recalculateKPIs(inventoryItems), [inventoryItems])
  
  // Custom states for selection and dialog tracking
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedBatchItem, setSelectedBatchItem] = useState<InventoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // States for Import/Export Action Dialog
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'import' | 'export'>('import')
  const [actionItems, setActionItems] = useState<InventoryItem[]>([])

  // States for Edit Modal
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemsToEdit, setItemsToEdit] = useState<InventoryItem[]>([])

  useEffect(() => { setTitle("Tồn kho") }, [setTitle])

  // Derived state: filter items based on search + status
  const filteredItems = useMemo(() => {
    let items = [...inventoryItems]
    if (filters.search) {
      const search = filters.search.toLowerCase()
      items = items.filter(i =>
        i.productName.toLowerCase().includes(search) || i.skuCode.toLowerCase().includes(search)
      )
    }
    if (filters.status === "low-stock") items = items.filter(i => i.isLowStock)
    else if (filters.status === "out-of-stock") items = items.filter(i => i.quantity === 0)
    else if (filters.status === "in-stock") items = items.filter(i => !i.isLowStock && i.quantity > 0)
    return items
  }, [filters, inventoryItems])

  const allSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredItems.length;

  // Handlers for table selection
  const handleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredItems.map(i => i.id) : [])
  }

  // View details logic
  const handleViewDetails = (item: InventoryItem) => {
    setSelectedBatchItem(item)
    setIsDialogOpen(true)
  }

  // Handle toolbar actions
  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "approve":
        setInventoryItems(prev => applyBulkApprove(prev, selectedIds));
        toast.success(`Đã duyệt ${selectedIds.length} mặt hàng`);
        setSelectedIds([]);
        break;
      case "delete":
        setInventoryItems(prev => applyBulkDelete(prev, selectedIds));
        toast.success(`Đã xoá ${selectedIds.length} mặt hàng khỏi dữ liệu nháp (Draft)`);
        setSelectedIds([]);
        break;
      case "edit":
        setItemsToEdit(inventoryItems.filter(i => selectedIds.includes(i.id)));
        setIsEditDialogOpen(true);
        break;
      case "import":
        setActionType('import');
        setActionItems(inventoryItems.filter(i => selectedIds.includes(i.id)));
        setIsActionDialogOpen(true);
        break;
      case "export":
        setActionType('export');
        setActionItems(inventoryItems.filter(i => selectedIds.includes(i.id)));
        setIsActionDialogOpen(true);
        break;
    }
  }

  const handleActionConfirm = (adjustments: Record<number, number>) => {
    setInventoryItems(prev => prev.map(item => {
      if (adjustments[item.id]) {
        const adj = adjustments[item.id]
        const newQty = actionType === 'import' ? item.quantity + adj : item.quantity - adj
        return {
          ...item,
          quantity: newQty,
          totalValue: newQty * item.costPrice,
          updatedAt: new Date().toISOString(),
          isLowStock: newQty <= item.minQuantity
        }
      }
      return item
    }))
    
    toast.success(`Đã cập nhật ${Object.keys(adjustments).length} mặt hàng thành công`);
    setIsActionDialogOpen(false);
    setSelectedIds([]);
  }

  const handleEditConfirm = (updatedItems: InventoryItem[]) => {
    setInventoryItems(prev => {
      const newItems = [...prev];
      updatedItems.forEach(updated => {
        const index = newItems.findIndex(i => i.id === updated.id);
        if (index !== -1) {
          // Recalculate computed fields
          const totalValue = updated.quantity * updated.costPrice;
          const isLowStock = updated.quantity <= updated.minQuantity;
          
          newItems[index] = { 
            ...updated, 
            totalValue, 
            isLowStock,
            updatedAt: new Date().toISOString()
          };
        }
      });
      return newItems;
    });

    toast.success(`Đã cập nhật thông tin ${updatedItems.length} mặt hàng`);
    setIsEditDialogOpen(false);
    setSelectedIds([]);
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
            Danh sách tồn kho
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý số lượng, vị trí và lô hàng chi tiết</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
        <KPICard
          title="Tổng mặt hàng"
          value={String(kpis.totalSKUs)}
          icon={<Package className="h-5 w-5 text-slate-700" />}
          color="bg-slate-100"
        />
        <KPICard
          title="Tổng giá trị kho"
          value={formatCurrency(kpis.totalValue)}
          icon={<TrendingUp className="h-5 w-5 text-green-700" />}
          color="bg-green-50"
        />
        <KPICard
          title="Sắp hết hàng"
          value={String(kpis.lowStockCount)}
          icon={<AlertTriangle className="h-5 w-5 text-red-700" />}
          color="bg-red-50"
        />
        <KPICard
          title="Cận hạn sử dụng"
          value={String(kpis.expiringSoonCount)}
          icon={<CalendarClock className="h-5 w-5 text-amber-700" />}
          color="bg-amber-50"
        />
      </div>

      {/* Filters (Standardized) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shrink-0">
        <StockToolbar 
          searchStr={filters.search}
          onSearch={(v) => setFilters(prev => ({ ...prev, search: v }))}
          status={filters.status}
          onStatusChange={(v) => setFilters(prev => ({ ...prev, status: v as InventoryFilters['status'] }))}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
      </div>
      
      {/* Một bảng thead+tbody trong cùng vùng cuộn — chuẩn data-table-layout */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
          <StockTable
            data={filteredItems}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onViewDetails={handleViewDetails}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>

      {/* Batch details modal */}
      <StockBatchDetailsDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        item={selectedBatchItem}
      />

      {/* Import/Export Action Modal */}
      <StockActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        onConfirm={handleActionConfirm}
        items={actionItems}
        type={actionType}
      />

      {/* Bulk Edit Modal */}
      <StockEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleEditConfirm}
        items={itemsToEdit}
      />
    </div>
  )
}
