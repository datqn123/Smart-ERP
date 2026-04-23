import { useEffect, useState, useRef, useMemo } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { ClipboardCheck, Plus, Search, Calendar, Download, Upload } from "lucide-react"
import { mockAuditSessions } from "../mockData"
import type { AuditSession } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuditSessionsTable } from "../components/AuditSessionsTable"
import { toast } from "sonner"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ kiểm" },
  { value: "In Progress", label: "Đang kiểm" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
]

export function AuditPage() {
  const { setTitle } = usePageTitle()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sessions] = useState<AuditSession[]>(mockAuditSessions)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    setTitle("Kiểm kê kho")
  }, [setTitle])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        s.auditCode.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.createdByName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      const matchesFrom = !dateFrom || s.auditDate >= dateFrom
      const matchesTo = !dateTo || s.auditDate <= dateTo
      return matchesSearch && matchesStatus && matchesFrom && matchesTo
    })
  }, [sessions, search, statusFilter, dateFrom, dateTo])

  const handleExportExcel = () => {
    toast.info("Đang xuất dữ liệu Excel...")
  }
  const handleImportExcel = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) toast.success(`Đã chọn file: ${file.name}. Đang xử lý import...`)
  }
  const handleCreateAudit = () => {
    toast.info("Mở form tạo đợt kiểm kê")
  }

  const handleView = (session: AuditSession) => {
    toast.info(`Xem chi tiết đợt kiểm: ${session.auditCode}`)
  }

  const handleEdit = (session: AuditSession) => {
    toast.info(`Chỉnh sửa đợt kiểm: ${session.auditCode}`)
  }

  const handleDelete = (id: number) => {
    toast.error(`Yêu cầu xóa đợt kiểm ID: ${id}`)
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
            Kiểm kê kho
          </h1>
          <p className="text-sm text-slate-500 mt-1">Đối chiếu tồn kho hệ thống với thực tế</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateAudit} className="h-11 bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Tạo đợt kiểm kê
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="h-11">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={handleImportExcel} variant="outline" className="h-11">
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo mã, tên đợt kiểm kê, người tạo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-[180px] rounded-md"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-500 whitespace-nowrap">Từ ngày:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-2 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 whitespace-nowrap">Đến ngày:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-2 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Hiển thị <span className="font-medium text-slate-700">{filteredSessions.length}</span> /{" "}
          <span className="font-medium text-slate-700">{sessions.length}</span> đợt kiểm kê
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-transparent">
        {sessions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-white border border-slate-200 rounded-xl">
            <ClipboardCheck className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm mb-4">Chưa có đợt kiểm kê nào</p>
            <Button onClick={handleCreateAudit} className="h-11 bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Tạo đợt kiểm kê
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-md">
            <div className="flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 px-4 text-slate-500 text-sm">
                  Không có đợt kiểm kê khớp bộ lọc. Thử đổi từ khóa hoặc khoảng ngày.
                </div>
              ) : (
                <AuditSessionsTable 
                  sessions={filteredSessions} 
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
