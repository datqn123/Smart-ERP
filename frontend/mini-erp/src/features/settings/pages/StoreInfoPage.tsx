import { useEffect, useState, useRef } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, Store, Globe, MapPin, Phone, Mail, FileText, Link2, AtSign } from "lucide-react"
import { toast } from "sonner"

export function StoreInfoPage() {
  const { setTitle } = usePageTitle()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [storeData, setStoreData] = useState({
    name: "Mini ERP Solution Center",
    category: "Bán lẻ & Phân phối thiết bị",
    address: "123 Đường ABC, Quận X, TP. Hồ Chí Minh",
    phone: "028 1234 5678",
    email: "contact@minierp.vn",
    website: "https://minierp.vn",
    taxId: "0312345678",
    footerNote: "Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chùng tôi. Hóa đơn có giá trị trong vòng 30 ngày kể từ ngày xuất.",
    logoUrl: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=200&h=200&auto=format&fit=crop",
    facebook: "fb.com/minierp_store",
    instagram: "@minierp.official"
  })

  useEffect(() => {
    setTitle("Thông Tin Cửa Hàng")
  }, [setTitle])

  const handleSave = () => {
    toast.success("Đã cập nhật thông tin cửa hàng thành công")
    setIsEditing(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setStoreData(prev => ({ ...prev, logoUrl: event.target?.result as string }))
        toast.info("Đã chọn logo mới. Nhấn Lưu để hoàn tất.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (field: string, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto bg-slate-50/30">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông tin cửa hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nhận diện thương hiệu và thông tin liên hệ của bạn</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
            Chỉnh sửa thông tin
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" className="text-slate-500 font-medium" onClick={() => setIsEditing(false)}>Hủy bỏ</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 px-6">
              <Save className="h-4 w-4 mr-2" /> Lưu thay đổi
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Left Column: Brand & Logo */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 relative">Logo cửa hàng</h3>
            <div className="flex flex-col items-center gap-6 relative">
              <div 
                className={`h-48 w-48 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex flex-col items-center justify-center text-slate-400 gap-2 overflow-hidden relative ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                 <img src={storeData.logoUrl} alt="Logo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                       <Upload className="h-10 w-10 text-white mb-2" />
                       <span className="text-xs font-bold text-white uppercase tracking-wider">Tải ảnh mới</span>
                    </div>
                 )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              
              <div className="text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yêu cầu tối thiểu</p>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  Kích thước 512x512px • PNG/JPG • Tối đa 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Mạng xã hội</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Facebook</Label>
                   <div className="relative group/input">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <Input 
                        disabled={!isEditing} 
                        value={storeData.facebook} 
                        onChange={(e) => handleChange('facebook', e.target.value)}
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Instagram</Label>
                   <div className="relative group/input">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-pink-600 transition-colors" />
                      <Input 
                        disabled={!isEditing} 
                        value={storeData.instagram} 
                        onChange={(e) => handleChange('instagram', e.target.value)}
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Form */}
        <div className="lg:col-span-2 space-y-6 text-slate-700">
           {/* Section 1: Basic Info */}
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                 <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Store className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 tracking-tight">Cấu hình cơ bản</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Tên cửa hàng (Hiển thị hóa đơn)</Label>
                    <Input 
                      disabled={!isEditing} 
                      value={storeData.name} 
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl font-medium" 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Lĩnh vực hoạt động</Label>
                    <Input 
                      disabled={!isEditing} 
                      value={storeData.category}
                      onChange={(e) => handleChange('category', e.target.value)} 
                      className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl font-medium" 
                    />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Địa chỉ kinh doanh</Label>
                    <div className="relative group/input">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                       <Input 
                         disabled={!isEditing} 
                         value={storeData.address} 
                         onChange={(e) => handleChange('address', e.target.value)}
                         className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl font-medium" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 2: Contact Info */}
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                 <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 tracking-tight">Thông tin liên hệ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Số điện thoại</Label>
                    <div className="relative group/input">
                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors" />
                       <Input 
                         disabled={!isEditing} 
                         value={storeData.phone} 
                         onChange={(e) => handleChange('phone', e.target.value)}
                         className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl font-mono" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Email hỗ trợ</Label>
                    <div className="relative group/input">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors" />
                       <Input 
                         disabled={!isEditing} 
                         value={storeData.email} 
                         onChange={(e) => handleChange('email', e.target.value)}
                         className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Website</Label>
                    <div className="relative group/input">
                       <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors" />
                       <Input 
                         disabled={!isEditing} 
                         value={storeData.website} 
                         onChange={(e) => handleChange('website', e.target.value)}
                         className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Mã số thuế</Label>
                    <div className="relative group/input">
                       <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors" />
                       <Input 
                         disabled={!isEditing} 
                         value={storeData.taxId} 
                         onChange={(e) => handleChange('taxId', e.target.value)}
                         className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl font-mono" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 3: Legal & More */}
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <Label className="text-xs font-bold uppercase tracking-tight text-slate-800">Ghi chú (Hiển thị cuối hóa đơn)</Label>
              <Textarea 
                disabled={!isEditing} 
                className="bg-slate-50/50 border-slate-200 min-h-[120px] focus:bg-white transition-all rounded-2xl resize-none p-4 leading-relaxed"
                value={storeData.footerNote}
                onChange={(e) => handleChange('footerNote', e.target.value)}
              />
           </div>
        </div>
      </div>
    </div>
  )
}
