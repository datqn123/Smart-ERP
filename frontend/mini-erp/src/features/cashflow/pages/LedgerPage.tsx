import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { ApiRequestError } from "@/lib/api/http"
import type { LedgerEntry } from "../types"
import { LedgerToolbar } from "../components/LedgerToolbar"
import { LedgerTable } from "../components/LedgerTable"
import { toast } from "sonner"
import { FINANCE_LEDGER_LIST_QUERY_KEY, getFinanceLedgerList } from "../api/financeLedgerApi"

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export function LedgerPage() {
  const { setTitle } = usePageTitle()
  
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => { setTitle("Sổ cái tài chính") }, [setTitle])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, dateFrom, dateTo])

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, dateFrom, dateTo, page],
  )

  const ledgerQuery = useQuery({
    queryKey: [...FINANCE_LEDGER_LIST_QUERY_KEY, filters],
    queryFn: () => getFinanceLedgerList(filters),
  })

  useEffect(() => {
    if (!ledgerQuery.isError) return
    const e = ledgerQuery.error
    if (e instanceof ApiRequestError) {
      toast.error(e.body?.message ?? e.message)
    } else {
      toast.error(e instanceof Error ? e.message : "Đã xảy ra lỗi")
    }
  }, [ledgerQuery.isError, ledgerQuery.error])

  const items: LedgerEntry[] = ledgerQuery.data?.items ?? []
  const total = ledgerQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleToolbarAction = (action: string) => {
    if (action === "export") {
      toast.info("Đang xuất sổ cái tài chính Excel...")
    }
  }

  const resetFilters = () => {
    setSearch("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
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
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onResetFilters={resetFilters}
          onAction={handleToolbarAction}
        />
        
        {/* Data Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
          <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
            <LedgerTable data={items} />
          </div>
          {total > PAGE_SIZE ? (
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
              <span>
                Trang {page} / {totalPages} — {ledgerQuery.isFetching ? "…" : total} bản ghi
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  disabled={page <= 1 || ledgerQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </button>
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  disabled={page >= totalPages || ledgerQuery.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
