import { useEffect, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, Store, Globe, MapPin, Phone, Mail, FileText, Link2, AtSign } from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  getStoreProfile,
  patchStoreProfile,
  uploadStoreLogo,
  STORE_PROFILE_QUERY_KEY,
  type StoreProfileData,
} from "../api/storeProfileApi"

export function StoreInfoPage() {
  const { setTitle } = usePageTitle()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [storeData, setStoreData] = useState({
    name: "",
    businessCategory: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxCode: "",
    footerNote: "",
    logoUrl: "",
    facebookUrl: "",
    instagramHandle: "",
  })

  const storeProfileQuery = useQuery({
    queryKey: STORE_PROFILE_QUERY_KEY,
    queryFn: getStoreProfile,
  })

  const patchMutation = useMutation({
    mutationFn: patchStoreProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY })
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: uploadStoreLogo,
    onSuccess: (data) => {
      setStoreData((prev) => ({ ...prev, logoUrl: data.logoUrl }))
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY })
      toast.success("Đã cập nhật logo")
    },
  })

  useEffect(() => {
    setTitle("Thông Tin Cửa Hàng")
  }, [setTitle])

  useEffect(() => {
    if (!storeProfileQuery.data) return
    if (isEditing) return
    const d = storeProfileQuery.data
    setStoreData({
      name: d.name ?? "",
      businessCategory: d.businessCategory ?? "",
      address: d.address ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      website: d.website ?? "",
      taxCode: d.taxCode ?? "",
      footerNote: d.footerNote ?? "",
      logoUrl: d.logoUrl ?? "",
      facebookUrl: d.facebookUrl ?? "",
      instagramHandle: d.instagramHandle ?? "",
    })
  }, [storeProfileQuery.data, isEditing])

  function buildPatchBody(form: typeof storeData, baseline: StoreProfileData | undefined) {
    const out: Record<string, unknown> = {}
    const base = baseline
    const norm = (s: string) => s.trim()
    const toNullable = (s: string) => {
      const t = norm(s)
      return t.length > 0 ? t : null
    }
    const changed = (a: unknown, b: unknown) => (a ?? null) !== (b ?? null)

    const name = norm(form.name)
    if (changed(name, base?.name ?? "")) out.name = name
    const businessCategory = toNullable(form.businessCategory)
    if (changed(businessCategory, base?.businessCategory ?? null)) out.businessCategory = businessCategory
    const address = toNullable(form.address)
    if (changed(address, base?.address ?? null)) out.address = address
    const phone = toNullable(form.phone)
    if (changed(phone, base?.phone ?? null)) out.phone = phone
    const email = toNullable(form.email)
    if (changed(email, base?.email ?? null)) out.email = email
    const website = toNullable(form.website)
    if (changed(website, base?.website ?? null)) out.website = website
    const taxCode = toNullable(form.taxCode)
    if (changed(taxCode, base?.taxCode ?? null)) out.taxCode = taxCode
    const footerNote = toNullable(form.footerNote)
    if (changed(footerNote, base?.footerNote ?? null)) out.footerNote = footerNote
    const logoUrl = toNullable(form.logoUrl)
    if (changed(logoUrl, base?.logoUrl ?? null)) out.logoUrl = logoUrl
    const facebookUrl = toNullable(form.facebookUrl)
    if (changed(facebookUrl, base?.facebookUrl ?? null)) out.facebookUrl = facebookUrl
    const instagramHandle = toNullable(form.instagramHandle)
    if (changed(instagramHandle, base?.instagramHandle ?? null)) out.instagramHandle = instagramHandle

    return out
  }

  const handleSave = async () => {
    const body = buildPatchBody(storeData, storeProfileQuery.data)
    if (Object.keys(body).length === 0) {
      toast.info("Chưa có thay đổi để lưu")
      setIsEditing(false)
      return
    }
    try {
      await patchMutation.mutateAsync(body)
      toast.success("Đã cập nhật thông tin cửa hàng")
      setIsEditing(false)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const details = e.body?.details ?? {}
        const keys = Object.keys(details)
        if (keys.length > 0) {
          toast.error(e.body?.message ?? "Dữ liệu không hợp lệ", {
            description: keys.slice(0, 4).map((k) => `${k}: ${details[k]}`).join(" • "),
          })
        } else {
          toast.error(e.body?.message ?? "Không thể lưu thông tin cửa hàng")
        }
        return
      }
      toast.error("Không thể lưu thông tin cửa hàng")
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadLogoMutation.mutate(file, {
        onError: (err) => {
          if (err instanceof ApiRequestError) {
            toast.error(err.body?.message ?? "Không thể cập nhật logo")
            return
          }
          toast.error("Không thể cập nhật logo")
        },
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const err = storeProfileQuery.error
    if (!err) return
    if (err instanceof ApiRequestError) {
      toast.error(err.body?.message ?? "Không tải được thông tin cửa hàng")
      return
    }
    toast.error("Không tải được thông tin cửa hàng")
  }, [storeProfileQuery.error])

  return (
    <div className="p-4 md:p-8 space-y-8 h-full overflow-y-auto bg-slate-50/30">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông tin cửa hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nhận diện thương hiệu và thông tin liên hệ của bạn</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            disabled={storeProfileQuery.isLoading}
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
          >
            Chỉnh sửa thông tin
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-slate-500 font-medium"
              onClick={() => setIsEditing(false)}
              disabled={patchMutation.isPending || uploadLogoMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSave}
              disabled={patchMutation.isPending || uploadLogoMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 px-6"
            >
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
                        value={storeData.facebookUrl} 
                        onChange={(e) => handleChange('facebookUrl', e.target.value)}
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
                        value={storeData.instagramHandle} 
                        onChange={(e) => handleChange('instagramHandle', e.target.value)}
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
                      value={storeData.businessCategory}
                      onChange={(e) => handleChange('businessCategory', e.target.value)} 
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
                         value={storeData.taxCode} 
                         onChange={(e) => handleChange('taxCode', e.target.value)}
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
