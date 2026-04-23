import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockDebts } from "../mockData"
import type { Debt } from "../types"
import { DebtToolbar } from "../components/DebtToolbar"
import { DebtTable } from "../components/DebtTable"
import { DebtDetailDialog } from "../components/DebtDetailDialog"
import { DebtFormDialog } from "../components/DebtFormDialog"
import { toast } from "sonner"
import { Scale, Users, Truck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function DebtPage() {
  const { setTitle } = usePageTitle()
  
  const [debts, setDebts] = useState<Debt[]>(mockDebts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // Modals state
  const [selectedItem, setSelectedItem] = useState<Debt | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  useEffect(() => { setTitle("Sổ nợ") }, [setTitle])

  const filtered = debts.filter(d => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false
    if (typeFilter !== "all" && d.partnerType !== typeFilter) return false
    if (search && !d.debtCode.toLowerCase().includes(search.toLowerCase()) && !d.partnerName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Summary stats
  const totalReceivable = debts.filter(d => d.partnerType === 'Customer').reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalPayable = debts.filter(d => d.partnerType === 'Supplier').reduce((sum, d) => sum + d.remainingAmount, 0)
  const overdueCount = debts.filter(d => d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'Cleared').length

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(d => d.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "create":
        setSelectedItem(null)
        setFormMode('create')
        setIsFormOpen(true)
        break;
      case "repay":
        if (selectedIds.length === 1) {
            const item = debts.find(d => d.id === selectedIds[0])
            if (item) {
                setSelectedItem(item)
                setFormMode('edit')
                setIsFormOpen(true)
            }
        } else {
            toast.error("Vui lòng chọn duy nhất 1 khoản nợ để cập nhật thanh toán")
        }
        break;
      case "delete":
        toast.success(`Đã xoá ${selectedIds.length} khoản nợ`)
        setSelectedIds([])
        break;
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break;
    }
  }

  const handleView = (item: Debt) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Debt) => {
    setSelectedItem(item)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleFormSubmit = (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const paid = Number(data.paidAmount)
    const total = Number(data.totalAmount)
    const remainingAmount = Math.max(0, total - paid)
    const status = remainingAmount <= 0 ? "Cleared" : "InDebt"
    if (formMode === 'create') {
      const newDebt = {
        ...data,
        id: Date.now(),
        remainingAmount,
        status,
        createdAt: now,
        updatedAt: now,
      } as (typeof debts)[number]
      setDebts([newDebt, ...debts])
    } else {
      setDebts(
        debts.map((d) =>
          d.id === selectedItem?.id
            ? ({
                ...d,
                ...data,
                remainingAmount,
                status,
                updatedAt: now,
              } as (typeof debts)[number])
            : d
        )
      )
    }
    setIsFormOpen(false)
  }
  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header & Stats Cards */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Sổ nợ đối tác</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Theo dõi công nợ khách hàng và nhà cung cấp</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            <StatCard 
                label="Nợ phải thu" 
                amount={totalReceivable} 
                icon={Users} 
                color="blue" 
            />
            <StatCard 
                label="Nợ phải trả" 
                amount={totalPayable} 
                icon={Truck} 
                color="indigo" 
            />
            <StatCard 
                label="Quá hạn" 
                amount={overdueCount} 
                icon={AlertCircle} 
                color="rose"
                isCount 
            />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 md:gap-5">
        <DebtToolbar 
          searchStr={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
        
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
          <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
            <DebtTable 
              data={filtered}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(item) => toast.error(`Yêu cầu xóa: ${item.debtCode}`)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DebtDetailDialog 
        debt={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <DebtFormDialog 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        mode={formMode}
      />
    </div>
  )
}

function StatCard({ label, amount, icon: Icon, color, isCount = false }: { label: string, amount: number, icon: any, color: 'blue' | 'indigo' | 'rose', isCount?: boolean }) {
    const colorMap = {
        blue: "text-blue-600 bg-slate-50 border-slate-100",
        indigo: "text-indigo-600 bg-slate-50 border-slate-100",
        rose: "text-rose-600 bg-slate-50 border-slate-100"
    }
    
    return (
        <div className="px-5 py-3 rounded-2xl border border-slate-200/60 flex items-center gap-4 bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] min-w-[200px]">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colorMap[color].split(' ')[1])}>
                <Icon size={18} className={colorMap[color].split(' ')[0]} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                <p className={cn("text-base font-black tracking-tight", colorMap[color].split(' ')[0])}>
                    {amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{isCount ? 'khoản' : 'đ'}</span>
                </p>
            </div>
        </div>
    )
}
