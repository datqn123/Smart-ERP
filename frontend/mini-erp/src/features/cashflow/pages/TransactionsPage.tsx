import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockTransactions } from "../mockData"
import type { Transaction } from "../types"
import { TransactionToolbar } from "../components/TransactionToolbar"
import { TransactionTable } from "../components/TransactionTable"
import { TransactionDetailDialog } from "../components/TransactionDetailDialog"
import { TransactionFormDialog } from "../components/TransactionFormDialog"
import { toast } from "sonner"
import { Banknote, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export function TransactionsPage() {
  const { setTitle } = usePageTitle()
  
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // Modals state
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  useEffect(() => { setTitle("Giao dịch thu chi") }, [setTitle])

  const filtered = transactions.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    if (typeFilter !== "all" && t.direction !== typeFilter) return false
    if (
      search &&
      !t.transactionCode.toLowerCase().includes(search.toLowerCase()) &&
      !(t.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  // Summary stats
  const totalIncome = transactions.filter(t => t.direction === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.direction === 'Expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(t => t.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "create":
        setSelectedItem(null)
        setFormMode('create')
        setIsFormOpen(true)
        break;
      case "edit":
        if (selectedIds.length === 1) {
          const item = transactions.find(t => t.id === selectedIds[0])
          if (item) {
            setSelectedItem(item)
            setFormMode('edit')
            setIsFormOpen(true)
          }
        } else {
          toast.error("Vui lòng chọn duy nhất 1 giao dịch để chỉnh sửa")
        }
        break;
      case "delete":
        toast.success(`Đã xoá ${selectedIds.length} giao dịch`)
        setSelectedIds([])
        break;
      case "export":
        toast.info("Đang xuất dữ liệu Excel...")
        break;
    }
  }

  const handleView = (item: Transaction) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleEdit = (item: Transaction) => {
    setSelectedItem(item)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleFormSubmit = (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    if (formMode === 'create') {
      const newTransaction = {
        ...data,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      } as (typeof transactions)[number]
      setTransactions([newTransaction, ...transactions])
    } else {
      setTransactions(
        transactions.map((t) =>
          t.id === selectedItem?.id ? ({ ...t, ...data, updatedAt: now } as (typeof transactions)[number]) : t
        )
      )
    }
    setIsFormOpen(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full min-h-0 gap-4 md:gap-5 overflow-hidden">
      {/* Header & Stats Cards */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Giao dịch thu chi</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý thu chi và luân chuyển tiền mặt</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            <StatCard 
                label="Tổng thu" 
                amount={totalIncome} 
                icon={TrendingUp} 
                color="emerald" 
            />
            <StatCard 
                label="Tổng chi" 
                amount={totalExpense} 
                icon={TrendingDown} 
                color="rose" 
            />
            <StatCard 
                label="Số dư" 
                amount={balance} 
                icon={DollarSign} 
                color="blue" 
            />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 md:gap-5">
        <TransactionToolbar 
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
            <TransactionTable 
              data={filtered}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(item) => toast.error(`Yêu cầu xóa: ${item.transactionCode}`)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionDetailDialog 
        transaction={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <TransactionFormDialog 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        mode={formMode}
      />
    </div>
  )
}

function StatCard({ label, amount, icon: Icon, color }: { label: string, amount: number, icon: any, color: 'emerald' | 'rose' | 'blue' }) {
    const colorMap = {
        emerald: "text-emerald-600 bg-slate-50 border-slate-100",
        rose: "text-rose-600 bg-slate-50 border-slate-100",
        blue: "text-blue-600 bg-slate-50 border-slate-100"
    }
    
    return (
        <div className="px-5 py-3 rounded-2xl border border-slate-200/60 flex items-center gap-4 bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] min-w-[200px]">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colorMap[color].split(' ')[1])}>
                <Icon size={18} className={colorMap[color].split(' ')[0]} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                <p className={cn("text-base font-black tracking-tight", colorMap[color].split(' ')[0])}>
                    {amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">đ</span>
                </p>
            </div>
        </div>
    )
}
