import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, ShieldAlert, TrendingDown, Clock, CreditCard, Save } from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  deleteAlertSetting,
  getAlertSettingsList,
  patchAlertSetting,
  postCreateAlertSetting,
  type AlertSettingItemData,
  type AlertType,
} from "../api/alertSettingsApi"

export function AlertSettingsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Cấu hình cảnh báo")
  }, [setTitle])

  const [settings, setSettings] = useState({
    lowStock: false,
    overStock: false,
    newOrder: false,
    debtDue: false,
    systemError: false,
    largeTransaction: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [itemsByType, setItemsByType] = useState<Partial<Record<AlertType, AlertSettingItemData>>>({})
  const [thresholds, setThresholds] = useState({
    largeTransaction: 50_000_000,
    debtDueDays: 3,
  })

  const handleDelete = async (alertType: AlertType) => {
    const item = itemsByType[alertType]
    if (!item) return
    setIsLoading(true)
    try {
      await deleteAlertSetting(item.id)
      setItemsByType((m) => ({
        ...m,
        [alertType]: { ...item, isEnabled: false },
      }))
      setSettings((s) => {
        switch (alertType) {
          case "LowStock":
            return { ...s, lowStock: false }
          case "OverStock":
            return { ...s, overStock: false }
          case "SalesOrderCreated":
            return { ...s, newOrder: false }
          case "PartnerDebtDueSoon":
            return { ...s, debtDue: false }
          case "SystemHealth":
            return { ...s, systemError: false }
          case "HighValueTransaction":
            return { ...s, largeTransaction: false }
          default:
            return s
        }
      })
      toast.success("Đã tắt cấu hình cảnh báo")
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 404) {
        toast.error(e.body.message || "Không tìm thấy cấu hình cảnh báo")
        return
      }
      const msg = e instanceof Error ? e.message : "Không thể tắt cấu hình cảnh báo"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAlertSettingsList()
      .then((data) => {
        if (cancelled) return
        const next = {
          lowStock: false,
          overStock: false,
          newOrder: false,
          debtDue: false,
          systemError: false,
          largeTransaction: false,
        }
        const map: Partial<Record<AlertType, AlertSettingItemData>> = {}
        for (const it of data.items) {
          map[it.alertType] = it
          switch (it.alertType) {
            case "LowStock":
              next.lowStock = it.isEnabled
              break
            case "OverStock":
              next.overStock = it.isEnabled
              break
            case "SalesOrderCreated":
              next.newOrder = it.isEnabled
              break
            case "PartnerDebtDueSoon":
              next.debtDue = it.isEnabled
              if (typeof it.thresholdValue === "number") {
                setThresholds((s) => ({ ...s, debtDueDays: Number(it.thresholdValue) }))
              }
              break
            case "SystemHealth":
              next.systemError = it.isEnabled
              break
            case "HighValueTransaction":
              next.largeTransaction = it.isEnabled
              if (typeof it.thresholdValue === "number") {
                setThresholds((s) => ({ ...s, largeTransaction: Number(it.thresholdValue) }))
              }
              break
            default:
              break
          }
        }
        setSettings(next)
        setItemsByType(map)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : "Không tải được cấu hình cảnh báo"
        toast.error(msg)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const desired: Array<{ alertType: AlertType; isEnabled: boolean; thresholdValue?: number | null }> = [
        { alertType: "LowStock", isEnabled: settings.lowStock },
        { alertType: "OverStock", isEnabled: settings.overStock },
        { alertType: "SalesOrderCreated", isEnabled: settings.newOrder },
        { alertType: "SystemHealth", isEnabled: settings.systemError },
        { alertType: "HighValueTransaction", isEnabled: settings.largeTransaction, thresholdValue: thresholds.largeTransaction },
        { alertType: "PartnerDebtDueSoon", isEnabled: settings.debtDue, thresholdValue: thresholds.debtDueDays },
      ]

      const nextMap: Partial<Record<AlertType, AlertSettingItemData>> = { ...itemsByType }

      for (const d of desired) {
        const existing = itemsByType[d.alertType]
        if (!existing) {
          // chưa có record: chỉ tạo nếu user bật switch
          if (!d.isEnabled) continue
          const created = await postCreateAlertSetting({
            alertType: d.alertType,
            channel: "App",
            frequency: "Realtime",
            thresholdValue: d.thresholdValue ?? null,
            isEnabled: true,
          })
          nextMap[created.alertType] = created
          continue
        }

        // đã có record: PATCH toggle + threshold (nếu có)
        const patched = await patchAlertSetting(existing.id, {
          isEnabled: d.isEnabled,
          ...(d.alertType === "HighValueTransaction" || d.alertType === "PartnerDebtDueSoon"
            ? { thresholdValue: d.thresholdValue ?? null }
            : {}),
        })
        nextMap[patched.alertType] = patched
      }

      setItemsByType(nextMap)
      toast.success("Đã lưu cấu hình cảnh báo")
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 400) {
        const details = e.body.details
        const detailsMsg =
          details && Object.keys(details).length > 0
            ? Object.entries(details)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" • ")
            : ""
        toast.error(detailsMsg ? `${e.body.message} (${detailsMsg})` : e.body.message || "Dữ liệu không hợp lệ")
        return
      }
      if (e instanceof ApiRequestError && e.status === 409) {
        toast.error(e.body.message || "Bạn đã có cấu hình cho loại cảnh báo này")
        return
      }
      if (e instanceof ApiRequestError && e.status === 404) {
        toast.error(e.body.message || "Không tìm thấy cấu hình cảnh báo")
        return
      }
      const msg = e instanceof Error ? e.message : "Không thể lưu cấu hình cảnh báo"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
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
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
        >
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
                 <div className="flex items-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isLoading || !itemsByType["LowStock"]}
                     onClick={() => handleDelete("LowStock")}
                     className="text-slate-500 hover:text-red-600"
                   >
                     Xóa
                   </Button>
                   <Switch
                     checked={settings.lowStock}
                     onCheckedChange={(val) => setSettings((s) => ({ ...s, lowStock: val }))}
                   />
                 </div>
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Cảnh báo tồn kho quá cao</Label>
                    <p className="text-sm text-slate-500">Nhắc nhở khi sản phẩm vượt quá định mức tối đa</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isLoading || !itemsByType["OverStock"]}
                     onClick={() => handleDelete("OverStock")}
                     className="text-slate-500 hover:text-red-600"
                   >
                     Xóa
                   </Button>
                   <Switch
                     checked={settings.overStock}
                     onCheckedChange={(val) => setSettings((s) => ({ ...s, overStock: val }))}
                   />
                 </div>
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
                 <div className="flex items-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isLoading || !itemsByType["SalesOrderCreated"]}
                     onClick={() => handleDelete("SalesOrderCreated")}
                     className="text-slate-500 hover:text-red-600"
                   >
                     Xóa
                   </Button>
                   <Switch
                     checked={settings.newOrder}
                     onCheckedChange={(val) => setSettings((s) => ({ ...s, newOrder: val }))}
                   />
                 </div>
              </div>
              <div className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                 <div className="space-y-1">
                    <Label className="text-[15px] font-bold text-slate-800">Giao dịch giá trị lớn</Label>
                    <p className="text-sm text-slate-500">Thông báo khi có giao dịch thu/chi trên 50,000,000đ</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isLoading || !itemsByType["HighValueTransaction"]}
                     onClick={() => handleDelete("HighValueTransaction")}
                     className="text-slate-500 hover:text-red-600"
                   >
                     Xóa
                   </Button>
                   <input
                     type="number"
                     min={0}
                     step={100000}
                     value={thresholds.largeTransaction}
                     onChange={(e) =>
                       setThresholds((s) => ({ ...s, largeTransaction: Number(e.target.value || 0) }))
                     }
                     className="w-[160px] h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                     disabled={isLoading}
                   />
                   <Switch
                     checked={settings.largeTransaction}
                     onCheckedChange={(val) => setSettings((s) => ({ ...s, largeTransaction: val }))}
                   />
                 </div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading || !itemsByType["PartnerDebtDueSoon"]}
                      onClick={() => handleDelete("PartnerDebtDueSoon")}
                      className="text-slate-500 hover:text-red-600"
                    >
                      Xóa
                    </Button>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={thresholds.debtDueDays}
                        onChange={(e) =>
                          setThresholds((s) => ({ ...s, debtDueDays: Number(e.target.value || 0) }))
                        }
                        className="w-[90px] h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                        disabled={isLoading}
                      />
                      <span className="text-xs font-bold text-slate-500">Ngày</span>
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
                 <div className="flex items-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isLoading || !itemsByType["SystemHealth"]}
                     onClick={() => handleDelete("SystemHealth")}
                     className="text-slate-500 hover:text-red-600"
                   >
                     Xóa
                   </Button>
                   <Switch
                     checked={settings.systemError}
                     onCheckedChange={(val) => setSettings((s) => ({ ...s, systemError: val }))}
                   />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
