import { useEffect, useMemo, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import type { SystemLog } from "../log-types"
import { LogTable } from "../components/LogTable"
import { LogToolbar } from "../components/LogToolbar"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { getSystemLogsList } from "../api/systemLogsApi"

function formatLogTimestamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("vi-VN")
}

export function LogsPage() {
  const { setTitle } = usePageTitle()
  
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setTitle("Nhật ký hệ thống")
  }, [setTitle])

  useEffect(() => {
    setPage(1)
  }, [search, moduleFilter])

  const effectiveModule = useMemo(() => (moduleFilter === "all" ? undefined : moduleFilter), [moduleFilter])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setIsLoading(true)
        const data = await getSystemLogsList({
          search: search.trim() || undefined,
          module: effectiveModule,
          page,
          limit,
        })
        if (cancelled) return
        const mapped: SystemLog[] = data.items.map((it) => ({
          id: it.id,
          timestamp: formatLogTimestamp(it.timestamp),
          user: it.user,
          action: it.action,
          module: it.module,
          description: it.description,
          severity: it.severity === "Critical" ? "Error" : it.severity,
          ipAddress: it.ipAddress ?? "",
        }))
        setLogs(mapped)
        setTotal(data.total)
        setSelectedIds([])
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiRequestError) {
          toast.error(e.body.message ?? "Không tải được nhật ký hệ thống.")
        } else {
          toast.error("Không tải được nhật ký hệ thống.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [effectiveModule, limit, page, search])

  const filtered = logs

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(l => l.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    if (action === "export") toast.info("Đang xuất nhật ký hệ thống...")
  }

  const handleView = (item: SystemLog) => toast.info(`Xem chi tiết log #${item.id}`)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Nhật ký hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động của người dùng và các sự kiện hệ thống</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <LogToolbar 
          searchStr={search}
          onSearch={setSearch}
          moduleFilter={moduleFilter}
          onModuleChange={setModuleFilter}
          selectedIds={selectedIds}
          onAction={handleToolbarAction}
        />
        
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between text-sm text-slate-500 py-2">
            <div>
              {isLoading ? "Đang tải..." : `Tổng ${total} bản ghi`}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded border border-slate-200 disabled:opacity-50"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </button>
              <span>Trang {page}</span>
              <button
                className="px-2 py-1 rounded border border-slate-200 disabled:opacity-50"
                disabled={isLoading || page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </button>
            </div>
          </div>

          <LogTable 
            data={filtered}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={handleView}
          />
        </div>
      </div>
    </div>
  )
}
