import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Banknote, BarChart3, LayoutDashboard } from "lucide-react"
import { usePageTitle } from "@/context/PageTitleContext"

export function DashboardPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Bảng Điều Khiển")
  }, [setTitle])

  const pillars = [
    { title: "Kho hàng", icon: Package, description: "Quản lý tồn kho và sản phẩm", color: "text-blue-600" },
    { title: "Đơn hàng", icon: ShoppingCart, description: "Xử lý đơn nhập/xuất hàng", color: "text-green-600" },
    { title: "Dòng tiền", icon: Banknote, description: "Theo dõi thu chi và công nợ", color: "text-orange-600" },
    { title: "Báo cáo", icon: BarChart3, description: "Phân tích doanh thu và lợi nhuận", color: "text-purple-600" },
  ]

  return (
    <div className="p-6 space-y-8">
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Chào buổi sáng, Admin!
          </h1>
          <p className="text-slate-500 mt-1">Hôm nay doanh nghiệp của bạn đang hoạt động thế nào?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
              <CardHeader className="pb-2">
                <div className={`p-2 rounded-lg bg-slate-50 w-fit ${pillar.color}`}>
                  <pillar.icon className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base font-medium mb-1">{pillar.title}</CardTitle>
                <p className="text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity Placeholder */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
          <LayoutDashboard className="h-8 w-8 text-slate-300" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-medium text-slate-900">Chưa có hoạt động nào</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Bắt đầu bằng việc thêm sản phẩm vào kho hoặc tạo đơn hàng đầu tiên của bạn.
          </p>
        </div>
        <Button variant="outline" className="mt-2">
          Bắt đầu ngay
        </Button>
      </section>
    </div>
  )
}
