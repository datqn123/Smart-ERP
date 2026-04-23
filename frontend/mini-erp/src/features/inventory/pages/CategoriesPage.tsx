import { useEffect } from "react"
import { EmptyState } from "@/components/shared/EmptyState"
import { usePageTitle } from "@/context/PageTitleContext"

export function CategoriesPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Danh mục sản phẩm")
  }, [setTitle])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          Danh mục sản phẩm
        </h1>
        <p className="text-slate-500 mt-1">Quản lý các danh mục sản phẩm của cửa hàng</p>
      </div>
      <EmptyState 
        title="Chưa có danh mục nào"
        description="Tạo danh mục đầu tiên của bạn để tổ chức sản phẩm"
        actionLabel="Tạo danh mục"
      />
    </div>
  )
}
