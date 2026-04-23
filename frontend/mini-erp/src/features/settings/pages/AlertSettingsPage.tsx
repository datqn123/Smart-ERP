import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, ShieldAlert, TrendingDown, Clock, CreditCard, Save } from "lucide-react"
import { toast } from "sonner"

export function AlertSettingsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Cấu hình cảnh báo")
  }, [setTitle])

  const [settings, setSettings] = useState({
    lowStock: true,
    overStock: false,
    newOrder: true,
    debtDue: true,
    systemError: true,
    largeTransaction: true,
  })

  const handleSave = () => {
    toast.success("Đã lưu cấu hình cảnh báo")
  }

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto bg-slate-50/30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <Bell className="h-7 w-7 text-slate-400" />
             Cấu hình cảnh báo
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý cách hệ thống thông báo các sự kiện quan trọng</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100">
          <Save className="h-4 w-4 mr-2" /> Lưu cấu hình
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section: Inventory */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert className="h-4 w-4 text-slate-400" />
                 Cảnh báo kho hàng
              </h3>
           </div>
           <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Cảnh báo sắp hết hàng</Label>
                    <p className="text-sm text-slate-500">Thông báo khi tồn kho thấp hơn định mức tối thiểu</p>
                 </div>
                 <Switch 
                   checked={settings.lowStock} 
                   onCheckedChange={(val) => setSettings(s => ({...s, lowStock: val}))} 
                 />
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Cảnh báo tồn kho quá cao</Label>
                    <p className="text-sm text-slate-500">Nhắc nhở khi sản phẩm vượt quá định mức tối đa</p>
                 </div>
                 <Switch 
                   checked={settings.overStock} 
                   onCheckedChange={(val) => setSettings(s => ({...s, overStock: val}))} 
                 />
              </div>
           </div>
        </div>

        {/* Section: Orders & Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <TrendingDown className="h-4 w-4 text-slate-400" />
                 Giao dịch & Doanh thu
              </h3>
           </div>
           <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Thông báo đơn hàng mới</Label>
                    <p className="text-sm text-slate-500">Nhận thông báo mỗi khi có đơn bán sỉ hoặc lẻ thành công</p>
                 </div>
                 <Switch 
                   checked={settings.newOrder} 
                   onCheckedChange={(val) => setSettings(s => ({...s, newOrder: val}))} 
                 />
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Giao dịch giá trị lớn</Label>
                    <p className="text-sm text-slate-500">Thông báo khi có giao dịch thu/chi trên 50,000,000đ</p>
                 </div>
                 <Switch 
                   checked={settings.largeTransaction} 
                   onCheckedChange={(val) => setSettings(s => ({...s, largeTransaction: val}))} 
                 />
              </div>
           </div>
        </div>

        {/* Section: Finance & System */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <CreditCard className="h-4 w-4 text-slate-400" />
                 Tài chính & Hệ thống
              </h3>
           </div>
           <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Nhắc nợ đến hạn</Label>
                    <p className="text-sm text-slate-500">Cảnh báo các khoản nợ phải thu/trả sắp đến hạn trong 3 ngày</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-500">
                       <Clock className="h-3 w-3" /> 3 Ngày
                    </div>
                    <Switch 
                      checked={settings.debtDue} 
                      onCheckedChange={(val) => setSettings(s => ({...s, debtDue: val}))} 
                    />
                 </div>
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Báo cáo lỗi hệ thống</Label>
                    <p className="text-sm text-slate-500">Thông báo cho Admin khi có lỗi bất thường trong quá trình vận hành</p>
                 </div>
                 <Switch 
                   checked={settings.systemError} 
                   onCheckedChange={(val) => setSettings(s => ({...s, systemError: val}))} 
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
