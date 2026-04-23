import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockLedger } from "../mockData"
import type { LedgerEntry } from "../types"
import { LedgerToolbar } from "../components/LedgerToolbar"
import { LedgerTable } from "../components/LedgerTable"
import { toast } from "sonner"

export function LedgerPage() {
  const { setTitle } = usePageTitle()
  
  const [entries] = useState<LedgerEntry[]>(mockLedger)
  const [search, setSearch] = useState("")

  useEffect(() => { setTitle("Sổ cái tài chính") }, [setTitle])

  const filtered = entries.filter(e => {
    if (search && !e.transactionCode.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleToolbarAction = (action: string) => {
    if (action === "export") {
      toast.info("Đang xuất sổ cái tài chính Excel...")
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Sổ cái tài chính</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi chi tiết phát sinh và số dư tài chính</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 md:gap-5">
        {/* Toolbar */}
        <LedgerToolbar 
          searchStr={search}
          onSearch={setSearch}
          onAction={handleToolbarAction}
        />
        
        {/* Data Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
          <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
            <LedgerTable data={filtered} />
          </div>
        </div>
      </div>
    </div>
  )
}
